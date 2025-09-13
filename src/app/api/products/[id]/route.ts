import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/server/services/productService';
import { ResponseHelper } from '@/lib/server/utils/responseHelper';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { applyGetRateLimit } from '@/lib/rateLimit';

const productService = new ProductService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = applyGetRateLimit(request, 'getProductById');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const product = await productService.getProductById(id);
    return ResponseHelper.success(product);
  } catch (error) {
    if (error instanceof Error && error.message === API_MESSAGES.PRODUCT_NOT_FOUND) {
      return ResponseHelper.notFound(error.message);
    }
    
    return ResponseHelper.error(
      error instanceof Error ? error.message : 'Erreur serveur'
    );
  }
}