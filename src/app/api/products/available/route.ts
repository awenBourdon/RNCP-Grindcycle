import { NextRequest } from 'next/server';
import { ProductController } from '@/lib/server/controllers/productController';
import { applyGetRateLimit } from '@/lib/rateLimit';

const productController = new ProductController();

export async function GET(request: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(request, 'getProducts');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return await productController.getAvailable();
}