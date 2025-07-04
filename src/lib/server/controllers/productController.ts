/**
 * PRODUCT MANAGEMENT CONTROLLER
 * 
 * This controller handles all HTTP requests related to product management in the skateboard
 * marketplace application. It serves as the entry point for product-related API endpoints,
 * coordinating between request validation, business logic execution, and response formatting.
 * 
 * Key Responsibilities:
 * - Product CRUD operations (Create, Read, Update, Delete)
 * - Product purchase transactions with points system integration
 * - Image upload validation and processing for product listings
 * - Request/response transformation and error handling
 * - Integration with ProductService for business logic execution
 * 
 * Supported Operations:
 * - create(): Creates new products with image uploads (FormData)
 * - getAll(): Retrieves all products in the system
 * - getAvailable(): Fetches only available (non-purchased) products
 * - getById(): Gets specific product details by ID
 * - purchase(): Handles product purchase transactions with points
 * - delete(): Removes products (with business rule validation)
 * 
 * Features:
 * - Comprehensive input validation using ProductValidator
 * - Image upload handling with size and type validation
 * - Transactional purchase processing with error rollback
 * - Standardized error responses with appropriate HTTP status codes
 * - Clean separation between controller logic and business rules
 */

import { type NextRequest, NextResponse } from 'next/server';
import { BaseController } from './baseController';
import { ProductService } from '@/lib/server/services/productService';
import { ProductValidator } from '@/lib/server/validators/productValidator';
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

  async create(req: NextRequest): Promise<NextResponse> {
    try {
      const formData = await this.extractFormData(req);

      const validation = ProductValidator.validateCreateData(formData);
      if (!validation.isValid || !validation.data) {
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

      const product = await this.productService.createProduct(validation.data, images);

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
      const validation = ProductValidator.validatePurchaseData(body);

      if (!validation.isValid || !validation.data) {
        return ResponseHelper.validationError(validation.errors);
      }

      const result = await this.productService.purchaseProduct(validation.data);

      return ResponseHelper.success(result, API_MESSAGES.PRODUCT_PURCHASED);
    } catch (error) {
      if (error instanceof Error) {
        const knownErrors = [
          API_MESSAGES.PRODUCT_NOT_FOUND,
          API_MESSAGES.PRODUCT_ALREADY_PURCHASED,
          API_MESSAGES.INSUFFICIENT_POINTS,
        ];

        const errorMessage = error.message as typeof knownErrors[number];

        if (knownErrors.includes(errorMessage)) {
          return ResponseHelper.error(errorMessage, 400);
        }
      }

      return this.handleError(error, 'ProductController.purchase');
    }
  }

  async delete(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await this.extractJsonData(req);
      const validation = ProductValidator.validateDeleteData(body);

      if (!validation.isValid || !validation.data) {
        return ResponseHelper.validationError(validation.errors);
      }

      await this.productService.deleteProduct(validation.data.productId);

      return ResponseHelper.successMessage(API_MESSAGES.PRODUCT_DELETED);
    } catch (error) {
      if (error instanceof Error) {
        const knownErrors = [
          API_MESSAGES.PRODUCT_NOT_FOUND,
          'Impossible de supprimer un produit acheté',
        ];

        const errorMessage = error.message as typeof knownErrors[number];

        if (knownErrors.includes(errorMessage)) {
          return ResponseHelper.error(errorMessage, 400);
        }
      }

      return this.handleError(error, 'ProductController.delete');
    }
  }
}