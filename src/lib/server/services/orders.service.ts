import { prisma } from '@/lib/prisma';
import { PaymentType, ProductStatus, PointsType } from '@/generated/prisma';
import {
  OrderRepository,
  InterfaceOrderRepository,
} from '@/lib/server/repositories/orderRepository';
import {
  createNotification,
  NotificationTemplates,
} from './notifications.service';
import {
  OrderWithRelations,
  CreateOrderItemData,
  CreateOrderData,
  PurchaseWithPointsData,
  CartItemForPurchase,
} from '@/lib/types';
import { 
  pointsPurchaseSchema
} from '@/lib/validations/shippingValidation';

export class OrderService {
  constructor(
    private orderRepository: InterfaceOrderRepository = new OrderRepository()
  ) {}

  async purchaseWithPoints(
    data: PurchaseWithPointsData
  ): Promise<OrderWithRelations> {
    const user = await prisma.user.findUnique({
      where: { 
        id: data.userId,
        deletedAt: null 
      },
      select: { id: true, name: true, email: true, points: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const cartItemsArray = Array.isArray(data.cartItems) ? data.cartItems : [];
    const totalPoints = cartItemsArray.reduce((total: number, item: CartItemForPurchase) => {
      return total + ((item.pricePoints || 0) * (item.quantity || 0));
    }, 0);

    const validationData = {
      cartItems: data.cartItems,
      shippingAddress: data.shippingAddress,
      totalPoints,
      userPoints: user.points,
    };

    const validation = pointsPurchaseSchema.safeParse(validationData);

    if (!validation.success) {
      const errorMessage = validation.error.errors
        .map(error => error.message)
        .join(', ');
      throw new Error(`Données invalides: ${errorMessage}`);
    }

    const validatedData = validation.data;

    return await prisma.$transaction(async tx => {
      let totalPointsNeeded = 0;
      const orderItems: CreateOrderItemData[] = [];
      const productUpdates: { id: string; name: string }[] = [];

      for (const item of validatedData.cartItems) {
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
          `Points insuffisants. Tu as ${user.points} points, ${totalPointsNeeded} requis.`
        );
      }

      const orderData: CreateOrderData = {
        userId: data.userId,
        totalAmount: 0,
        shippingCost: 0,
        paymentType: PaymentType.POINTS,
        pointsUsed: totalPointsNeeded,
        shippingAddress: validatedData.shippingAddress.address,
        shippingCity: validatedData.shippingAddress.city,
        shippingPostalCode: validatedData.shippingAddress.postalCode,
        shippingCountry: validatedData.shippingAddress.country,
        shippingPhone: validatedData.shippingAddress.phone,
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
          data: { status: ProductStatus.SOLD },
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

      if (order.userId) {
        await createNotification({
          userId: order.userId,
          target: 'USER',
          description: `Commande confirmée ! Produits achetés : ${productNames}. Total : ${order.pointsUsed} points.`,
        });
      }

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
          user: { 
            select: { id: true, name: true, deletedAt: true }
          },
        },
      });

      if (favoritesWithUsers.length === 0) {
        return;
      }

      await prisma.$transaction(async tx => {
        const activeUserFavorites = favoritesWithUsers.filter(
          favorite => favorite.user && !favorite.user.deletedAt
        );

        if (activeUserFavorites.length > 0) {
          const notifications = activeUserFavorites.map(favorite => ({
            userId: favorite.userId,
            target: 'USER' as const,
            description: NotificationTemplates.favoriteProductPurchased(productName),
            isRead: false,
          }));

          await tx.notification.createMany({
            data: notifications,
          });
        }

        await tx.favorite.deleteMany({
          where: { productId },
        });
      });
    } catch (err) {
       console.error(err instanceof Error ? err.message : err);
    }
  }
}