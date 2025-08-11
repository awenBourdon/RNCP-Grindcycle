import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: Request) {
  const { session_id } = await req.json();

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    return NextResponse.json({
      valid: session.payment_status === 'paid',
    });
  } catch {
    return NextResponse.json({ valid: false }); // Mettre true en prod
  }
}
