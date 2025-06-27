import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@/generated/prisma'

// TODO : Ce fichier sert à rien, pas prioritaire mais à supprimer si aucune solution trouvé

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')
  const buf = await request.arrayBuffer().then((ab) => Buffer.from(ab))

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error(`Webhook Error: ${err}`)
    return NextResponse.json({ error: `Webhook Error` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === 'paid') {
      const { amount_total, metadata } = session

      try {
        const order = await prisma.order.create({
          data: {
            totalAmount: amount_total ? amount_total / 100 : 0,
            shippingCost: Number(metadata?.shippingCost) || 0,
            shippingAddress: metadata?.shippingAddress,
            shippingCity: metadata?.shippingCity,
            shippingPostalCode: metadata?.shippingPostalCode,
            shippingCountry: metadata?.shippingCountry,
            shippingPhone: metadata?.shippingPhone,
          },
        })
        return NextResponse.json({ order })
      } catch (error) {
        console.error(error)
        return NextResponse.json(
          { error: 'Error creating order' },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
