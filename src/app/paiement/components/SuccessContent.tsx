'use client'
// TODO : refaire tout cette partie !
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useAbortController } from '@/hooks/useAbortController'

export const SuccessContent = () => {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const session_id = searchParams.get('session_id')
  const { createSignal } = useAbortController()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderDetails, setOrderDetails] = useState<{
    email?: string
    amount_total?: number
    currency?: string
  }>({})

  const fetchOrderDetails = useCallback(async () => {
    if (!session_id) {
      setError('Aucun identifiant de session fourni.')
      setLoading(false)
      return
    }

    const signal = createSignal()

    try {
      const res = await fetch('/api/stripe/get-order-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id }),
        signal: signal,
      })

      if (!res.ok) {
        setError('Impossible de récupérer les détails de la commande.')
        return
      }

      const data = await res.json()
      setOrderDetails(data)
      clearCart()
      sessionStorage.removeItem('shippingAddress')
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setError(
          'Une erreur est survenue lors de la récupération de la commande.'
        )
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }, [session_id, clearCart, createSignal])

  useEffect(() => {
    fetchOrderDetails()
  }, [fetchOrderDetails])

  if (loading) {
    return <p className="text-center mt-20">Chargement...</p>
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-red-600 text-lg mb-6">{error}</p>
        <Link
          href="/"
          className="text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-normal text-black mb-6">
            Commande confirmée !
          </h1>

          <p className="text-xl text-gray-600 mb-4">
            Merci pour ton achat. Ta commande a été traitée avec succès.
          </p>

          <p className="text-gray-600 mb-4">
            Total payé : {(orderDetails.amount_total! / 100).toFixed(2)}{' '}
            {orderDetails.currency?.toUpperCase()}
          </p>

          <p className="text-gray-600 mb-12">
            Un email de confirmation a été envoyé à{' '}
            <strong>{orderDetails.email}</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
            >
              Continuer mes achats
              <ArrowRight size={16} className="ml-2" />
            </Link>

            <Link
              href="/compte"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 border border-[#0a3d3f] text-[#0a3d3f] hover:bg-[#0a3d3f] hover:text-white transition-colors"
            >
              Mon compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
