import { type NextRequest } from 'next/server';
import { ProductController } from '@/lib/server/controllers/productController';
import { applyGetRateLimit } from '@/lib/rateLimit';

const controller = new ProductController();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'getProducts');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { searchParams } = new URL(req.url);
  const available = searchParams.get('available');
  const productId = searchParams.get('id');

  if (productId) {
    return controller.getById(productId);
  }

  if (available === 'true') {
    return controller.getAvailable();
  }

  return controller.getAll();
}
