import { type NextRequest } from 'next/server';
import { ProductController } from '@/lib/server/controllers/productController';

const controller = new ProductController();

export async function POST(req: NextRequest) {
  return controller.create(req);
}

export async function GET(req: NextRequest) {
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

export async function PATCH(req: NextRequest) {
  return controller.purchase(req);
}

export async function DELETE(req: NextRequest) {
  return controller.delete(req);
}
