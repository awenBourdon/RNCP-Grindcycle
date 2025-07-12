import { ProductController } from '@/lib/server/controllers/productController'

export const dynamic = 'force-dynamic'

export async function GET() {
  const productController = new ProductController()
  return await productController.getAvailable()
}