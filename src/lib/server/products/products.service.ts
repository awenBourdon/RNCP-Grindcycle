import { ProductStatus } from '@/generated/prisma';
import {
  InterfaceProductRepository,
  CreateProductData,
  UpdateProductData,
  ProductWithRelations,
  ProductFilters
} from './repository/interface-products.repository';
import { ProductRepository } from './repository/products.repository';
import { createNotification, NotificationTemplates } from '../notifications/notifications.service';
import { ImageService } from '../upload-images/images.service';
import { normalizePaginationParams, PaginatedResponse, PaginationParams } from '@/lib/utils/pagination';

export class ProductService {
  constructor(
    private productRepository: InterfaceProductRepository = new ProductRepository(),
    private imageService: ImageService = new ImageService('products')
  ) {}

  async createProduct(
    data: Omit<CreateProductData, 'imageUrl'>,
    imageFiles: File[]
  ): Promise<ProductWithRelations> {
    const imageResult = await this.imageService.uploadMultiple(imageFiles);

    if (!imageResult.success) {
      throw new Error(`Erreur upload images: ${imageResult.errors.join(', ')}`);
    }

    if (imageResult.urls.length === 0) {
      throw new Error('Au moins une image est requise');
    }

    const productData: CreateProductData = {
      ...data,
      imageUrl: imageResult.urls,
    };

    try {
      const product = await this.productRepository.create(productData);
      if (product.usedBoard?.user) {
        await this.notifyBoardRecycled(product);
      }

      return product;
    } catch (error) {
      await this.imageService.deleteMultiple(imageResult.urls);
      throw error;
    }
  }

  async getAllProducts(): Promise<ProductWithRelations[]> {
    return await this.productRepository.findAll();
  }

  async getAvailableProducts(
  params: PaginationParams,
  filters?: ProductFilters
): Promise<PaginatedResponse<ProductWithRelations>> {
  const { page, limit } = normalizePaginationParams(params);
  return await this.productRepository.findAvailable(page, limit, filters);
}

  async getProductById(productId: string): Promise<ProductWithRelations> {
    if (!productId) {
      throw new Error('ID produit requis');
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new Error('Produit non trouvé');
    }

    return product;
  }

  async getLatestProducts(limit: number = 6): Promise<ProductWithRelations[]> {
    return await this.productRepository.findLatest(limit);
  }

  async updateProduct(productId: string, data: UpdateProductData): Promise<ProductWithRelations> {
    if (!productId) {
      throw new Error('ID produit requis');
    }

    await this.getProductById(productId);

    this.validateUpdateData(data);

    return await this.productRepository.update(productId, data);
  }

  async updateProductStatus(productId: string, status: ProductStatus): Promise<ProductWithRelations> {
    if (!productId) {
      throw new Error('ID produit requis');
    }

    if (!Object.values(ProductStatus).includes(status)) {
      throw new Error('Statut de produit invalide');
    }

    const product = await this.getProductById(productId);

    const updatedProduct = await this.productRepository.update(productId, { status });

    if (status === ProductStatus.SOLD && product.usedBoard) {
    }

    return updatedProduct;
  }

  async deleteProduct(productId: string): Promise<void> {
    if (!productId) {
      throw new Error('ID produit requis');
    }

    const product = await this.getProductById(productId);

    if (product.status !== ProductStatus.CATALOG) {
      throw new Error('Impossible de supprimer un produit vendu');
    }

    if (product.imageUrl && product.imageUrl.length > 0) {
      await this.imageService.deleteMultiple(product.imageUrl);
    }

    await this.productRepository.delete(productId);
  }

  getRepository(): InterfaceProductRepository {
    return this.productRepository;
  }

  private async notifyBoardRecycled(product: ProductWithRelations): Promise<void> {
    if (!product.usedBoard?.user) return;

    try {
      await createNotification({
        userId: product.usedBoard.user.id,
        target: 'USER',
        description: NotificationTemplates.boardRecycled(
          product.usedBoard.name,
          product.name
        ),
      });
    } catch (error) {
      console.error('Erreur notification recyclage:', error);
    }
  }

  private validateUpdateData(data: UpdateProductData): void {
    if (data.name !== undefined && (!data.name || data.name.trim().length === 0)) {
      throw new Error('Le nom du produit ne peut pas être vide');
    }

    if (data.priceEuro !== undefined && data.priceEuro < 0) {
      throw new Error('Le prix en euros ne peut pas être négatif');
    }

    if (data.pricePoints !== undefined && data.pricePoints < 0) {
      throw new Error('Le prix en points ne peut pas être négatif');
    }
  }
}