import { type NextRequest, NextResponse } from 'next/server';
import { BaseController } from './baseController';
import { ProductService } from '@/lib/server/services/productService';
import { ResponseHelper } from '@/lib/server/utils/responseHelper';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { ImageService } from '@/lib/server/utils/imageService';
import { ZodHelper } from '@/lib/server/utils/zodHelper';
import { productSchema } from '@/lib/validations/boardsValidation';
import { z } from 'zod';

const purchaseSchema = z.object({
  productId: z.string(),
  userId: z.string()
});

const deleteSchema = z.object({
  productId: z.string()
});

export class ProductController extends BaseController {
  constructor(
    private productService: ProductService = new ProductService(),
    private imageService: ImageService = new ImageService('products')
  ) {
    super();
  }

  async create(req: NextRequest): Promise<NextResponse> {
    try {
      const formData = await this.extractFormData(req);

      const validation = ZodHelper.validateFormData(productSchema, formData);
      if (!validation.isValid) {
        return ResponseHelper.validationError(validation.errors);
      }

      const images = formData.getAll('images') as File[];
      const imageValidation = this.imageService.validate(images);

      if (!imageValidation.isValid) {
        return ResponseHelper.error(
          API_MESSAGES.IMAGE_VALIDATION_FAILED,
          422,
          imageValidation.errors
        );
      }

      const product = await this.productService.createProduct(validation.data!, images);
      return ResponseHelper.created(product, API_MESSAGES.PRODUCT_CREATED);
    } catch (error) {
      return this.handleError(error, 'ProductController.create');
    }
  }
  
  async getAll(): Promise<NextResponse> {
    try {
      const products = await this.productService.getAllProducts();
      return ResponseHelper.success(products);
    } catch (error) {
      return this.handleError(error, 'ProductController.getAll');
    }
  }

  async getAvailable(): Promise<NextResponse> {
    try {
      const products = await this.productService.getAvailableProducts();
      return ResponseHelper.success(products);
    } catch (error) {
      return this.handleError(error, 'ProductController.getAvailable');
    }
  }

  async getById(productId: string): Promise<NextResponse> {
    try {
      const product = await this.productService.getProductById(productId);
      return ResponseHelper.success(product);
    } catch (error) {
      if (error instanceof Error && error.message === API_MESSAGES.PRODUCT_NOT_FOUND) {
        return ResponseHelper.notFound(error.message);
      }
      return this.handleError(error, 'ProductController.getById');
    }
  }

  async purchase(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await this.extractJsonData(req);
      const validation = ZodHelper.validate(purchaseSchema, body);
      if (!validation.isValid) {
        return ResponseHelper.validationError(validation.errors);
      }

      const result = await this.productService.purchaseProduct(validation.data!);
      return ResponseHelper.success(result, API_MESSAGES.PRODUCT_PURCHASED);
    } catch (error) {
      return this.handleError(error, 'ProductController.purchase');
    }
  }

  async delete(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await this.extractJsonData(req);
      
      const validation = ZodHelper.validate(deleteSchema, body);
      if (!validation.isValid) {
        return ResponseHelper.validationError(validation.errors);
      }

      await this.productService.deleteProduct(validation.data!.productId);
      return ResponseHelper.successMessage(API_MESSAGES.PRODUCT_DELETED);
    } catch (error) {
      return this.handleError(error, 'ProductController.delete');
    }
  }
}