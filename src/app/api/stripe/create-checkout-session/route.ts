import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pointsShippingSchema, cartItemSchema } from '@/lib/validations/shipping.validation';
import { z } from 'zod';
import { CartItemForPurchase, PaymentService, ShippingAddress } from '@/lib/server/payments/payments.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const stripePaymentSchema = z.object({
  cartItems: z
    .array(cartItemSchema)
    .min(1, 'Panier vide')
    .max(10, 'Maximum 10 articles'),
  
  shippingCost: z.number().min(0, 'Frais de livraison invalides'),
  
  userId: z.string().optional().nullable(),
  
  shippingAddress: pointsShippingSchema,
});

type StripePaymentInput = z.infer<typeof stripePaymentSchema>;

const paymentService = new PaymentService();

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500 }
      );
    }

    const rawData = await request.json();
    
    const validation = stripePaymentSchema.safeParse(rawData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError?.message || 'Données invalides' },
        { status: 400 }
      );
    }

    const { cartItems, shippingCost, shippingAddress, userId } = validation.data;

    const paymentData = {
      userId: userId || null,
      cartItems: convertCartItemsToPaymentFormat(cartItems),
      shippingAddress: convertShippingAddressToPaymentFormat(shippingAddress),
      shippingCost,
    };

    const order = await paymentService.processStripePayment(paymentData);

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name
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
            name: 'Frais de livraison'
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


function convertCartItemsToPaymentFormat(items: StripePaymentInput['cartItems']): CartItemForPurchase[] {
  return items.map(item => ({
    productId: item.productId,
    name: item.name,
    type: item.type,
    priceEuro: item.priceEuro,
    pricePoints: item.pricePoints,
    quantity: item.quantity,
  }));
}

function convertShippingAddressToPaymentFormat(
  address: StripePaymentInput['shippingAddress']
): ShippingAddress {
  return {
    address: address.address,
    city: address.city,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
  };
}