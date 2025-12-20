import { PaymentService } from '@/lib/server/payments/payments.service';
import { MailService } from '@/lib/server/mail/mail.service';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: Request) {
  try {
    const { sessionId, orderId } = await req.json();
    
    if (!sessionId || !orderId) {
      return NextResponse.json(
        { error: 'Session ID et Order ID requis' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non confirmé', success: false },
        { status: 400 }
      );
    }

    const paymentService = new PaymentService();
    const updatedOrder = await paymentService.confirmStripePayment(orderId);

    const orderDetails = {
      id: updatedOrder.id,
      totalAmount: updatedOrder.totalAmount,
      shippingCost: updatedOrder.shippingCost,
      customerEmail: session.customer_email || updatedOrder.user?.email || '',
      status: updatedOrder.status,
      orderItems: updatedOrder.orderItems,
      shippingAddress: updatedOrder.shippingAddress,
      shippingCity: updatedOrder.shippingCity,
      shippingPostalCode: updatedOrder.shippingPostalCode,
      shippingCountry: updatedOrder.shippingCountry,
    };


    let invoiceUrl = null;
    if (session.invoice) {
      if (typeof session.invoice === 'string') {
        const invoice = await stripe.invoices.retrieve(session.invoice);
        invoiceUrl = invoice.hosted_invoice_url;
      } else {
        invoiceUrl = (session.invoice as Stripe.Invoice).hosted_invoice_url;
      }
    }

    const mailService = new MailService();
    await mailService.sendOrderConfirmationEmail(orderDetails.customerEmail, updatedOrder, invoiceUrl || null);

    return NextResponse.json({
      success: true,
      order: orderDetails,
    });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: `Erreur lors de la confirmation: ${error.message}`,
          success: false
        },
        { status: 500 }
      );
    }
   
    return NextResponse.json(
      { error: 'Erreur inconnue lors de la confirmation du paiement', success: false },
      { status: 500 }
    );
  }
}