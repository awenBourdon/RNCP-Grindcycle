import { NextRequest } from 'next/server'
import { ProductController } from '@/lib/server/controllers/productController'

const productController = new ProductController()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return await productController.getById(id)
}