import { NextRequest } from 'next/server'
import { ProductController } from '@/lib/server/controllers/productController'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const productController = new ProductController()
  const { id } = await params
  return await productController.getById(id)
}