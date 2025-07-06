'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, useAnimation, useMotionValue } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NewProductCard } from './ProductCard'
import { useAbortController } from '@/hooks/useAbortController'
import { ProductType } from '@/lib/types'

interface ApiResponse {
  success: boolean
  data: ProductType[]
  error?: string
}

export const NewProducts = () => {
  const controls = useAnimation()
  const [isMobile, setIsMobile] = useState(false)
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const x = useMotionValue(0)
  const [, setIsPaused] = useState(false)
  const animationDuration = 45
  const { createSignal } = useAbortController()

  const fetchLatestProducts = useCallback(async () => {
    const signal = createSignal()

    try {
      setLoading(true)
      const response = await fetch('/api/product/latest?limit=6', {
        signal: signal,
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()

      if (data.success) {
        setProducts(data.data)
        setError(null)
      } else {
        setError(data.error || 'Erreur lors du chargement des produits')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Erreur fetch derniers produits:', err)
        setError(err.message)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }, [createSignal])

  const startAnimation = () => {
    const startX = x.get()
    const endX = '-50%'

    controls.start({
      x: [startX, endX],
      transition: {
        x: {
          ease: 'linear',
          duration:
            animationDuration *
            (1 -
              Math.abs(Number.parseFloat(startX as unknown as string) / -50)),
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    })
  }

  useEffect(() => {
    fetchLatestProducts()
  }, [fetchLatestProducts])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    const startAnimation = () => {
      const startX = x.get()
      const endX = '-50%'

      controls.start({
        x: [startX, endX],
        transition: {
          x: {
            ease: 'linear',
            duration:
              animationDuration *
              (1 -
                Math.abs(Number.parseFloat(startX as unknown as string) / -50)),
            repeat: Number.POSITIVE_INFINITY,
          },
        },
      })
    }

    if (!isMobile && products.length > 0) {
      startAnimation()
    }

    return () => {
      window.removeEventListener('resize', checkScreenSize)
      controls.stop()
    }
  }, [isMobile, controls, x, products.length])

  const handleMouseEnter = () => {
    setIsPaused(true)
    controls.stop()
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
    startAnimation()
  }

  if (loading) {
    return (
      <section className="py-24 bg-white text-[#010101]">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <h2 className="text-3xl font-normal mb-6">Nouveautés</h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Découvre nos dernières planches recyclées, chacune avec son histoire
            et son caractère unique.
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">
            Chargement des nouveautés...
          </span>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 bg-white text-[#010101]">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <h2 className="text-3xl font-normal mb-6">Nouveautés</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchLatestProducts()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-24 bg-white text-[#010101]">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <h2 className="text-3xl font-normal mb-6">Nouveautés</h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Aucune nouveauté disponible pour le moment.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-white text-[#010101]">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <h2 className="text-3xl font-normal mb-6">Nouveautés</h2>
        <p className="text-lg text-gray-600 max-w-3xl">
          Découvre nos dernières planches recyclées, chacune avec son histoire
          et son caractère unique.
        </p>
      </div>

      <div className="w-full relative">
        {isMobile ? (
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
            {products.slice(0, 3).map((product) => (
              <Link key={product.id} href={`/produit/${product.id}`}>
                <NewProductCard product={product} />
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="w-full overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              className="flex gap-12 w-max pl-[10%]"
              animate={controls}
              style={{ x }}
              initial={{ x: '0%' }}
            >
              {[...products, ...products].map((product, index) => (
                <Link
                  key={`${product.id}-${index}`}
                  href={`/produit/${product.id}`}
                >
                  <NewProductCard product={product} />
                </Link>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16">
        <Link href="/catalogue" className="inline-flex items-center group">
          <span className="border-b border-black pb-1 group-hover:border-[#0a3d3f] transition-colors">
            Voir toutes nos planches
          </span>
          <ArrowRight
            size={16}
            className="ml-2 transform group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </section>
  )
}
