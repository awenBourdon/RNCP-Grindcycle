import { ProductStatus } from '@/generated/prisma';
import { ProductRepository } from '@/lib/server/repositories/productRepository';
import {
  CreateProductData,
  PurchaseProductData,
  ProductWithRelations,
} from '@/lib/server/types/product';
import { ImageService } from '@/lib/server/utils/imageService';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { prisma } from '@/lib/prisma';
import { PointsType } from '@/generated/prisma';
import { InterfaceProductRepository } from '../repositories/interfaces/interfaceProductRepository';
import {
  createNotification,
  NotificationTemplates,
} from './notificationsService';

export interface PurchaseResult {
  product: ProductWithRelations | null;
}

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
      throw new Error(API_MESSAGES.AT_LEAST_ONE_IMAGE_REQUIRED);
    }

    const productData: CreateProductData = {
      ...data,
      imageUrl: imageResult.urls,
      usedBoardId: data.usedBoardId || null,
    };

    try {
      const product = await this.productRepository.create(productData);

      if (product.usedBoard?.user) {
        await createNotification({
          userId: product.usedBoard.user.id,
          target: 'USER',
          description: NotificationTemplates.boardRecycled(
            product.usedBoard.name,
            product.name
          ),
        });
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

  async getAvailableProducts(): Promise<ProductWithRelations[]> {
    return await this.productRepository.findAvailable();
  }

  async getProductById(id: string): Promise<ProductWithRelations> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new Error(API_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  async purchaseProduct(data: PurchaseProductData): Promise<PurchaseResult> {
    const product = await this.getProductById(data.productId);

    if (product.status === ProductStatus.PURCHASED) {
      throw new Error(API_MESSAGES.PRODUCT_ALREADY_PURCHASED);
    }

    const result = await prisma.$transaction(async tx => {
      await tx.product.update({
        where: { id: data.productId },
        data: {
          status: ProductStatus.PURCHASED,
        },
      });

      await tx.pointsHistory.create({
        data: {
          user: { connect: { id: data.userId } },
          type: PointsType.PURCHASE,
          pointsAmount: -product.pricePoints,
        },
      });

      const updatedProduct = await this.productRepository.findById(data.productId);

      return {
        product: updatedProduct,
      };
    });

    await this.handlePostPurchaseActions(
      data.productId,
      data.userId,
      product.name
    );

    return result;
  }

  private async handlePostPurchaseActions(
    productId: string,
    buyerId: string,
    productName: string
  ): Promise<void> {
    try {
      await Promise.all([
        this.notifyFavoriteUsersAndCleanup(productId, buyerId, productName),
      ]);
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
    }
  }

  private async notifyFavoriteUsersAndCleanup(
    productId: string,
    buyerId: string,
    productName: string
  ): Promise<void> {
    try {
      const favoritesWithUsers = await prisma.favorite.findMany({
        where: {
          productId,
          userId: { not: buyerId },
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      if (favoritesWithUsers.length === 0) {
        return;
      }

      await prisma.$transaction(async tx => {
        const notifications = favoritesWithUsers.map(favorite => ({
          userId: favorite.userId,
          target: 'USER' as const,
          description:
            NotificationTemplates.favoriteProductPurchased(productName),
          isRead: false,
        }));

        await tx.notification.createMany({
          data: notifications,
        });

        await tx.favorite.deleteMany({
          where: { productId },
        });
      });

      console.log(
        `${favoritesWithUsers.length} utilisateurs notifiés pour le produit "${productName}"`
      );
    } catch (error) {
      console.error('Erreur notification favoris:', error);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);

    if (product.status === ProductStatus.PURCHASED) {
      throw new Error('Impossible de supprimer un produit acheté');
    }

    if (product.imageUrl && product.imageUrl.length > 0) {
      await this.imageService.deleteMultiple(product.imageUrl);
    }

    await this.productRepository.delete(id);
  }

  async updateProductStatus(
    id: string,
    status: ProductStatus
  ): Promise<ProductWithRelations> {
    return await this.productRepository.update(id, { status });
  }

  async getProductsByStatus(
    status: ProductStatus
  ): Promise<ProductWithRelations[]> {
    return await this.productRepository.findAll({ status });
  }

  async searchProducts(searchTerm: string): Promise<ProductWithRelations[]> {
    return await this.productRepository.findAll({ search: searchTerm });
  }

  async getProductStats() {
    const [total, available, purchased] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: ProductStatus.CATALOG } }),
      prisma.product.count({ where: { status: ProductStatus.PURCHASED } }),
    ]);

    return {
      total,
      available,
      purchased,
      soldPercentage: total > 0 ? Math.round((purchased / total) * 100) : 0,
    };
  }
}
