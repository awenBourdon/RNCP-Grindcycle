import { NextResponse } from "next/server"
import Stripe from "stripe"
import type { CartItemType } from "@/contexts/CartContext"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured")
      return NextResponse.json(
        { error: "Configuration Stripe manquante" }, 
        { status: 500 }
      )
    }
    const { cartItems, shippingCost, shippingAddress, userEmail } = await request.json()

    // TODO : Pansement pour faire fonctionner Stripe sans les images
    const lineItems = cartItems.map((item: CartItemType) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          description: `Type: ${item.type}${item.size ? `, Taille: ${item.size}"` : ""}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }))

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Frais de livraison",
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      })
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/panier`,
      customer_email: shippingAddress?.email || userEmail,
      shipping_address_collection: {
        allowed_countries: ["FR"],
      },
      metadata: {
        ...(shippingAddress && {
          shippingName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          shippingAddress: shippingAddress.address,
          shippingCity: shippingAddress.city,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
          shippingPhone: shippingAddress.phone,
        }),
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la session de paiement" }, { status: 500 })
  }
}
