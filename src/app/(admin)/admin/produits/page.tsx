import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ProductsTable } from '../components/ProductsTable'

export default async function ProductsPage() {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion')
  }

  const products = await prisma.product.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
  })

  return <ProductsTable products={products} />
}
