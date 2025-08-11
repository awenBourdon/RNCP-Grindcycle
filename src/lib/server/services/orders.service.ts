// src/lib/server/services/orderService.ts

import { prisma } from '@/lib/prisma';
import { PaymentType, ProductStatus, PointsType } from '@/generated/prisma';
import {
  OrderRepository,
  InterfaceOrderRepository,
} from '@/lib/server/repositories/orderRepository';
import { API_MESSAGES } from '@/lib/server/config/constants';
import {
  createNotification,
  NotificationTemplates,
} from './notificationsService';
import {
  PurchaseWithPointsData,
  OrderWithRelations,
  CreateOrderItemData,
  CreateOrderData,
} from '@/lib/types';

export class OrderService {
  constructor(
    private orderRepository: InterfaceOrderRepository = new OrderRepository()
  ) {}

  async purchaseWithPoints(
    data: PurchaseWithPointsData
  ): Promise<OrderWithRelations> {
    return await prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { id: true, name: true, email: true, points: true },
      });

      if (!user) {
        throw new Error(API_MESSAGES.USER_NOT_FOUND);
      }

      let totalPointsNeeded = 0;
      const orderItems: CreateOrderItemData[] = [];
      const productUpdates: { id: string; name: string }[] = [];

      for (const item of data.cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            type: true,
            pricePoints: true,
            status: true,
          },
        });

        if (!product) {
          throw new Error(`Produit ${item.name} non trouvé`);
        }

        if (product.status !== ProductStatus.CATALOG) {
          throw new Error(`Produit ${item.name} non disponible`);
        }

        const pointsForItem = (product.pricePoints || 0) * item.quantity;
        totalPointsNeeded += pointsForItem;

        orderItems.push({
          productId: item.productId,
          productName: item.name,
          productType: item.type,
          priceEuro: item.priceEuro,
          pricePoints: product.pricePoints,
          quantity: item.quantity,
        });

        productUpdates.push({
          id: product.id,
          name: product.name,
        });
      }

      if (user.points < totalPointsNeeded) {
        throw new Error(
          `Points insuffisants. Vous avez ${user.points} points, ${totalPointsNeeded} requis.`
        );
      }

      const orderData: CreateOrderData = {
        userId: data.userId,
        totalAmount: 0,
        shippingCost: 0,
        paymentType: PaymentType.POINTS,
        pointsUsed: totalPointsNeeded,
        shippingAddress: data.shippingAddress?.address,
        shippingCity: data.shippingAddress?.city,
        shippingPostalCode: data.shippingAddress?.postalCode,
        shippingCountry: data.shippingAddress?.country,
        shippingPhone: data.shippingAddress?.phone,
        items: orderItems,
      };

      const order = await this.orderRepository.create(orderData);

      await tx.pointsHistory.create({
        data: {
          userId: data.userId,
          type: PointsType.PURCHASE,
          pointsAmount: -totalPointsNeeded,
        },
      });

      await tx.user.update({
        where: { id: data.userId },
        data: {
          points: {
            decrement: totalPointsNeeded,
          },
        },
      });

      for (const productUpdate of productUpdates) {
        await tx.product.update({
          where: { id: productUpdate.id },
          data: { status: ProductStatus.PURCHASED },
        });
      }

      await this.createPurchaseNotifications(order, user.name);

      return order;
    });
  }

  async getUserOrders(userId: string): Promise<OrderWithRelations[]> {
    return await this.orderRepository.findByUserId(userId);
  }

  async getOrderById(orderId: string): Promise<OrderWithRelations> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Commande non trouvée');
    }

    return order;
  }

  async getAllOrders(): Promise<OrderWithRelations[]> {
    return await this.orderRepository.findAll();
  }

  private async createPurchaseNotifications(
    order: OrderWithRelations,
    userName: string | null
  ): Promise<void> {
    try {
      const productNames = order.orderItems
        .map((item: { productName: string }) => item.productName)
        .join(', ');

      await createNotification({
        userId: order.userId,
        target: 'USER',
        description: `Commande confirmée ! Produits achetés : ${productNames}. Total : ${order.pointsUsed} points.`,
      });

      await createNotification({
        userId: null,
        target: 'ADMIN',
        description: `Nouvelle commande de ${userName || 'Utilisateur'} avec ${order.pointsUsed} points. Produits : ${productNames}`,
      });

      for (const item of order.orderItems) {
        await this.notifyFavoriteUsersAndCleanup(
          item.productId,
          order.userId!,
          item.productName
        );
      }
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
    } catch (err) {
        console.error(err instanceof Error ? err.message : err);
    }
  }
}
