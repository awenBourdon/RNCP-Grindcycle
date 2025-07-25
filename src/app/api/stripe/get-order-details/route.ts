import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: Request) {
  const { session_id } = await req.json();

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'customer'],
    });

    return NextResponse.json({
      email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return NextResponse.json({ error: 'Session invalide' }, { status: 400 });
  }
}
