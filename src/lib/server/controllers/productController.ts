import { NextResponse } from 'next/server';
import { BaseController } from './baseController';
import { ProductService } from '@/lib/server/services/productService';
import { ResponseHelper } from '@/lib/server/utils/responseHelper';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { ImageService } from '@/lib/server/utils/imageService';

export class ProductController extends BaseController {
  constructor(
    private productService: ProductService = new ProductService(),
    private imageService: ImageService = new ImageService('products')
  ) {
    super();
  }

  async getAll(): Promise<NextResponse> {
    try {
      const products = await this.productService.getAllProducts();
      return ResponseHelper.success(products);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAvailable(): Promise<NextResponse> {
    try {
      const products = await this.productService.getAvailableProducts();
      return ResponseHelper.success(products);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(productId: string): Promise<NextResponse> {
    try {
      const product = await this.productService.getProductById(productId);
      return ResponseHelper.success(product);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === API_MESSAGES.PRODUCT_NOT_FOUND
      ) {
        return ResponseHelper.notFound(error.message);
      }
      return this.handleError(error);
    }
  }
}
