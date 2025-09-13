import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/server/services/productService';
import { ResponseHelper } from '@/lib/server/utils/responseHelper';
import { applyGetRateLimit } from '@/lib/rateLimit';

const productService = new ProductService();

export async function GET(request: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(request, 'getProducts');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const products = await productService.getAvailableProducts();
    return ResponseHelper.success(products);
  } catch (error) {
    return ResponseHelper.error(
      error instanceof Error ? error.message : 'Erreur serveur'
    );
  }
}