'use client'
import { useState, useTransition, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { ReturnButton } from '@/components/ui/ReturnButton'
import { toast } from 'sonner'
import { ProductImageGallery } from './ProductImageGallery'
import { ProductInfo } from './ProductInfo'
import { ProductActions } from './ProductActions'
import { ProductType } from '@/lib/types'
import { useAbortController } from '@/hooks/useAbortController'
interface ProductDisplayProps {
  product: ProductType
}

interface FavoriteResponse {
  success: boolean
  data: Array<{ productId: string }>
}

export const ProductDisplay = ({ product }: ProductDisplayProps) => {
  const cartProduct = {
    ...product,
    description: product.description ?? undefined,
  }

  const { addToCart, removeFromCart, isInCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { createSignal } = useAbortController()

  useEffect(() => {
    setAdded(isInCart(product))
  }, [product, isInCart])

  useEffect(() => {
    let isMounted = true

    const fetchFavorites = async () => {
      const signal = createSignal()

      try {
        const response = await fetch('/api/favorites', {
          signal: signal,
        })

        if (response.status === 401) {
          if (isMounted) {
            setIsAuthenticated(false)
          }
          return
        }

        if (isMounted) {
          setIsAuthenticated(true)
        }

        const data: FavoriteResponse = await response.json()

        if (data && data.success && isMounted) {
          setFavorites(data.data.map((f) => f.productId))
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== 'AbortError' &&
          isMounted
        ) {
          setIsAuthenticated(false)
        }
      }
    }

    fetchFavorites()

    return () => {
      isMounted = false
    }
  }, [createSignal])

  const isFavorite = favorites.includes(product.id)
  const isAvailable = product.status === 'CATALOG'

  const toggleFavorite = async () => {
    if (isLoadingFavorites || !isAuthenticated) return

    setIsLoadingFavorites(true)
    try {
      if (isFavorite) {
        const response = await fetch(`/api/favorites?productId=${product.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setFavorites((prev) => prev.filter((id) => id !== product.id))
          toast.success('Retiré des favoris')
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product.id }),
        })
        if (response.ok) {
          setFavorites((prev) => [...prev, product.id])
          toast.success('Ajouté aux favoris')
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  const handleToggleCart = () => {
    startTransition(() => {
      if (added) {
        removeFromCart(cartProduct)
        toast.success('Retiré du panier')
      } else {
        addToCart(cartProduct)
        toast.success('Ajouté au panier')
      }
      setAdded(!added)
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <ReturnButton href="/catalogue" label="Catalogue" />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        <ProductImageGallery
          images={product.imageUrl || []}
          productName={product.name}
        />

        <div className="space-y-6 lg:space-y-8">
          <ProductInfo product={product} />
          <ProductActions
            product={product}
            added={added}
            handleToggleCart={handleToggleCart}
            isPending={isPending}
            isAvailable={isAvailable}
            isAuthenticated={isAuthenticated}
            isFavorite={isFavorite}
            isLoadingFavorites={isLoadingFavorites}
            toggleFavorite={toggleFavorite}
          />
        </div>
      </div>
    </div>
  )
}
