import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductDisplay } from './components/ProductDisplay'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        usedBoard: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })
    return product
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-32">
      <ProductDisplay product={product} />
    </div>
  )
}
