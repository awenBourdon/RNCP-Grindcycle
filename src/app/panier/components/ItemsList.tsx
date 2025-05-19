"use client";
import { useCart } from "@/contexts/CartContext";
import Item from "./Item";

export default function Items() {
  const { cartItems } = useCart()

  return (
    <div className="lg:col-span-2 space-y-10">
      {cartItems.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  )
}