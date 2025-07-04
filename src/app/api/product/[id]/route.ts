import { NextRequest } from 'next/server'
import { ProductController } from '@/lib/server/controllers/productController'

const productController = new ProductController()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await productController.getById(params.id)
}