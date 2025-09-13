import { type NextRequest } from 'next/server';
import { ProductService } from '@/lib/server/services/productService';
import { applyGetRateLimit } from '@/lib/rateLimit';

const productService = new ProductService();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'getProducts');
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('id');
  const latest = searchParams.get('latest');
  const available = searchParams.get('available');

  try {
    if (productId) {
      const product = await productService.getProductById(productId);
      return Response.json(
        { success: true, data: product },
        { status: 200 }
      );
    }

    if (latest) {
      const limit = parseInt(latest) || 6;
      const products = await productService.getLatestProducts(limit);
      return Response.json(
        { success: true, data: products },
        { status: 200 }
      );
    }


    if (available === 'true') {
      const products = await productService.getAvailableProducts();
      return Response.json(
        { success: true, data: products },
        { status: 200 }
      );
    }

    const products = await productService.getAllProducts();
    return Response.json(
      { success: true, data: products },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur getProducts:', error);

    if (error instanceof Error && error.message.includes('non trouvé')) {
      return Response.json(
        { success: false, error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return Response.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}