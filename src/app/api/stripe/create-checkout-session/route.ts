import { CartItemType, CreateOrderData } from '@/lib/types';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { OrderService } from '@/lib/server/src/orders/orders.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const orderService = new OrderService();

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500 }
      );
    }

    const { cartItems, shippingCost, shippingAddress, userId } = await request.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Panier vide' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Adresse de livraison manquante' },
        { status: 400 }
      );
    }

    const totalAmount = cartItems.reduce((total: number, item: CartItemType) => 
      total + (item.priceEuro * item.quantity), 0
    );

    const orderData: CreateOrderData = {
      userId: userId || null,
      totalAmount,
      shippingCost,
      paymentType: 'EURO',
      pointsUsed: 0,
      shippingAddress: shippingAddress.address,
      shippingCity: shippingAddress.city,
      shippingPostalCode: shippingAddress.postalCode,
      shippingCountry: shippingAddress.country,
      shippingPhone: shippingAddress.phone,
      items: cartItems.map((item: CartItemType) => ({
        productId: item.id,
        productName: item.name,
        productType: item.type,
        priceEuro: item.priceEuro,
        pricePoints: null,
        quantity: item.quantity,
      }))
    };

    const order = await orderService.createPendingOrder(orderData);

    const lineItems = cartItems.map((item: CartItemType) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: `Type: ${item.type}`,
        },
        unit_amount: Math.round(item.priceEuro * 100),
      },
      quantity: item.quantity,
    }));

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de livraison',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/paiement/achat/succes?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/paiement/achat/echec?order_id=${order.id}`,
      customer_email: shippingAddress.email,
      metadata: {
        orderId: order.id,
        shippingName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        shippingAddress: shippingAddress.address,
        shippingCity: shippingAddress.city,
        shippingPostalCode: shippingAddress.postalCode,
        shippingCountry: shippingAddress.country,
        shippingPhone: shippingAddress.phone || '',
      },
    };

    if (shippingCost > 0) {
      sessionParams.shipping_options = [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: Math.round(shippingCost * 100),
            currency: 'eur',
          },
          display_name: 'Livraison standard',
        },
      }];
    }

    const stripeSession = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ 
      url: stripeSession.url,
      orderId: order.id 
    });

  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}