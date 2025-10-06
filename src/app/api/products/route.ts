import { type NextRequest } from 'next/server';
import { applyGetRateLimit } from '@/lib/utils/rateLimit';
import { ProductService } from '@/lib/server/products/products.service';
import { extractPaginationFromSearchParams } from '@/lib/utils/pagination';

const productService = new ProductService();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'getProducts');
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('id');
  const latest = searchParams.get('latest');
  const available = searchParams.get('available');
  const admin = searchParams.get('admin');

  try {
    if (productId) {
      const product = await productService.getProductById(productId);
      return Response.json({ success: true, data: product }, { status: 200 });
    }

    if (latest) {
      const limit = parseInt(latest) || 6;
      const products = await productService.getLatestProducts(limit);
      return Response.json({ success: true, data: products }, { status: 200 });
    }

    if (available === 'true') {
      const { page, limit } = extractPaginationFromSearchParams(searchParams);
      const result = await productService.getAvailableProducts({ page, limit });
      return Response.json(result, { status: 200 });
    }

    if (admin === 'true') {
      const page = searchParams.get('page');
      

      if (page) {
        const { page: currentPage, limit } = extractPaginationFromSearchParams(searchParams);
        const result = await productService.getAllProductsWithPagination({ page: currentPage, limit });
        return Response.json(result, { status: 200 });
      }
      
      const products = await productService.getAllProducts();
      return Response.json({ success: true, data: products }, { status: 200 });
    }

    return Response.json(
      { success: false, error: 'Paramètre requis: id, latest, available, ou admin' },
      { status: 400 }
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