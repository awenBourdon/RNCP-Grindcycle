// src/lib/server/src/products/products.service.ts
import { ProductStatus } from '@/generated/prisma';
import { ProductRepository } from '@/lib/server/src/products/repository/products.repository';
import {
  CreateProductData,
  PurchaseProductData,
  ProductWithRelations,
} from '@/lib/server/types/product';
import { ImageService } from '@/lib/server/src/upload-images/images.service';
import { prisma } from '@/lib/prisma';
import {
  createNotification,
  NotificationTemplates,
} from '../notifications/notifications.service';
import { InterfaceProductRepository } from './repository/interface-products.repository';
import { pointsService } from '../points/points.service';
import { PointsType } from '@/generated/prisma';

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
      throw new Error('Au moins une image est requise');
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
      throw new Error('Produit non trouvé');
    }

    return product;
  }

  async getLatestProducts(limit: number = 6): Promise<ProductWithRelations[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 10);

    return await this.productRepository.findAll({
      status: ProductStatus.CATALOG,
    }).then(products => 
      products
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, safeLimit)
    );
  }

  async purchaseProduct(data: PurchaseProductData): Promise<PurchaseResult> {
    const product = await this.getProductById(data.productId);

    if (product.status !== ProductStatus.CATALOG) {
      throw new Error('Produit déjà acheté');
    }

    // Vérifier les points avec le nouveau PointsService
    const userPointsTotal = await pointsService.getUserPointsTotal(data.userId);
    if (userPointsTotal < (product.pricePoints || 0)) {
      throw new Error(`Points insuffisants. Tu as ${userPointsTotal} points, ${product.pricePoints} requis.`);
    }

    const result = await prisma.$transaction(async tx => {
      // Marquer le produit comme vendu
      await tx.product.update({
        where: { id: data.productId },
        data: {
          status: ProductStatus.SOLD,
        },
      });

      // Utiliser le nouveau PointsService pour gérer les points
      const pointsRepository = pointsService.getRepository();
      
      // Créer l'entrée dans l'historique
      await pointsRepository.createInTransaction(tx, {
        userId: data.userId,
        type: PointsType.PURCHASE,
        pointsAmount: -(product.pricePoints || 0),
        usedBoardId: null,
      });

      // Déduire les points directement de l'utilisateur
      await pointsRepository.addPointsToUserInTransaction(tx, data.userId, -(product.pricePoints || 0));

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
    } catch (error) {
      console.error('Erreur notification favoris:', error);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);

    if (product.status !== ProductStatus.CATALOG) {
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
}