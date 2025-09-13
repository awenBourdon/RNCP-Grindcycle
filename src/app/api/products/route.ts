import { type NextRequest } from 'next/server';
import { ProductService } from '@/lib/server/services/productService';
import { ResponseHelper } from '@/lib/server/utils/responseHelper';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { applyGetRateLimit } from '@/lib/rateLimit';

const productService = new ProductService();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'getProducts');
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(req.url);
  const available = searchParams.get('available');
  const productId = searchParams.get('id');

  try {
    if (productId) {
      const product = await productService.getProductById(productId);
      return ResponseHelper.success(product);
    }

    if (available === 'true') {
      const products = await productService.getAvailableProducts();
      return ResponseHelper.success(products);
    }

    const products = await productService.getAllProducts();
    return ResponseHelper.success(products);

  } catch (error) {
    if (error instanceof Error && error.message === API_MESSAGES.PRODUCT_NOT_FOUND) {
      return ResponseHelper.notFound(error.message);
    }
    
    return ResponseHelper.error(
      error instanceof Error ? error.message : 'Erreur serveur'
    );
  }
}