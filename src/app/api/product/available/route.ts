import { ProductController } from '@/lib/server/controllers/productController'

const productController = new ProductController()

export async function GET() {
  return await productController.getAvailable()
}