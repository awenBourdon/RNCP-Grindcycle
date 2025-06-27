'use client'
import { useState, useEffect } from 'react'
import { motion, useAnimation, useMotionValue } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard'
import { products } from '@/lib/data'

export default function NewProducts() {
  const controls = useAnimation()
  const [isMobile, setIsMobile] = useState(false)
  const x = useMotionValue(0)
  const [, setIsPaused] = useState(false)
  const animationDuration = 45

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

    if (!isMobile) {
      startAnimation()
    }

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [isMobile, controls, x])

  const handleMouseEnter = () => {
    setIsPaused(true)
    controls.stop()
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
    startAnimation()
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
                <ProductCard product={product} />
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
                  <ProductCard product={product} />
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
