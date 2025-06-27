'use client'
import { useCart } from '@/contexts/CartContext'
import EmptyCart from './components/EmptyCart'
import Header from './components/Header'
import Items from './components/ItemsList'
import Summary from './components/Summary'

export default function CartPage() {
  const { cartItems } = useCart()

  return (
    <div className="min-h-screen">
      <div className="pt-40 pb-16 px-6 text-center bg-white">
        <div className="max-w-7xl mx-auto">
          <Header />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <Items />
            <Summary />
          </div>
        ) : (
          <EmptyCart />
        )}
      </div>
    </div>
  )
}
