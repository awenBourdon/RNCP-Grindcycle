import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentType, ProductStatus, PointsType } from '@/generated/prisma';
import { CreateOrderData, OrderWithRelations, PurchaseWithPointsData, CreateOrderItemData, CartItemForPurchase } from '@/lib/types';
import { InterfaceOrderRepository } from './interfaces/interfaceOrderRepository';

export type { InterfaceOrderRepository };
import { pointsPurchaseSchema } from '@/lib/validations/shippingValidation';
import { NotificationTemplates } from '../services/notifications.service';

export class OrderRepository implements InterfaceOrderRepository {
  async create(data: CreateOrderData): Promise<OrderWithRelations> {
    return await prisma.order.create({
      data: {
        userId: data.userId,
        totalAmount: data.totalAmount,
        shippingCost: data.shippingCost,
        paymentType: data.paymentType,
        pointsUsed: data.pointsUsed || 0,
        status: OrderStatus.CONFIRMED,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingPostalCode: data.shippingPostalCode,
        shippingCountry: data.shippingCountry,
        shippingPhone: data.shippingPhone,
        orderItems: {
          create: data.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productType: item.productType,
            priceEuro: item.priceEuro,
            pricePoints: item.pricePoints,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                imageUrl: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string): Promise<OrderWithRelations | null> {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                imageUrl: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<OrderWithRelations[]> {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                imageUrl: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(): Promise<OrderWithRelations[]> {
    return await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                imageUrl: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus
  ): Promise<OrderWithRelations> {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                imageUrl: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.order.delete({
      where: { id },
    });
  }

  

  // Nouvelles méthodes pour éviter les appels directs à Prisma dans le service
  async findUserWithPoints(userId: string): Promise<{
    id: string;
    name: string | null;
    email: string;
    points: number;
  } | null> {
    return await prisma.user.findUnique({
      where: { 
        id: userId,
        deletedAt: null 
      },
      select: { id: true, name: true, email: true, points: true },
    });
  }

  async purchaseWithPointsTransaction(data: PurchaseWithPointsData): Promise<OrderWithRelations> {
    const user = await this.findUserWithPoints(data.userId);

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

      const order = await this.createOrderInTransaction(tx, orderData);

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

      return order;
    });
  }

  private async createOrderInTransaction(
    tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>, 
    data: CreateOrderData
  ): Promise<OrderWithRelations> {
    return await tx.order.create({
      data: {
        userId: data.userId,
        totalAmount: data.totalAmount,
        shippingCost: data.shippingCost,
        paymentType: data.paymentType,
        pointsUsed: data.pointsUsed || 0,
        status: OrderStatus.CONFIRMED,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingPostalCode: data.shippingPostalCode,
        shippingCountry: data.shippingCountry,
        shippingPhone: data.shippingPhone,
        orderItems: {
          create: data.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productType: item.productType,
            priceEuro: item.priceEuro,
            pricePoints: item.pricePoints,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                imageUrl: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async notifyFavoriteUsersAndCleanup(
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