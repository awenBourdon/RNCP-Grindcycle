import { prisma } from '@/lib/utils/prisma';
import { OrderStatus, PointsType } from '@/generated/prisma';
import { NotificationTemplates } from '../../notifications/notifications.service';
import { InterfacePaymentRepository, PaymentServices, PointsPaymentTransactionData } from './interface-payments.repository';
import { OrderWithRelations } from '../../orders/repository/interface-orders.repository';


export class PaymentRepository implements InterfacePaymentRepository {

  async executePointsPaymentTransaction(
    data: PointsPaymentTransactionData,
    services: PaymentServices
  ): Promise<OrderWithRelations> {
    return await prisma.$transaction(async (tx) => {
      const order = await services.orderService.getRepository().createInTransaction(tx, {
        userId: data.userId,
        totalAmount: 0,
        shippingCost: 0,
        paymentType: 'POINTS',
        pointsUsed: data.totalPoints,
        status: OrderStatus.CONFIRMED,
        shippingAddress: data.shippingAddress.address,
        shippingCity: data.shippingAddress.city,
        shippingPostalCode: data.shippingAddress.postalCode,
        shippingCountry: data.shippingAddress.country,
        shippingPhone: data.shippingAddress.phone,
      });

      const orderItems = data.cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        productType: item.type,
        priceEuro: item.priceEuro,
        pricePoints: item.pricePoints,
      }));

      await services.orderItemService.getRepository().createMultipleInTransaction(tx, orderItems);

      await services.userService.getRepository().updatePointsInTransaction(tx, data.userId, -data.totalPoints);

      await services.pointsHistoryService.getRepository().createInTransaction(tx, {
        userId: data.userId,
        type: PointsType.PURCHASE,
        pointsAmount: -data.totalPoints,
        usedBoardId: null,
      });

      return order;
    });
  }


  async executeStripeConfirmationTransaction(
    orderId: string,
    services: PaymentServices
  ): Promise<OrderWithRelations> {
    const order = await services.orderService.getOrderById(orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Cette commande ne peut pas être confirmée');
    }
    
    return order;
  }

  async cleanupFavoritesForPurchase(
    productIds: string[],
    buyerId: string,
    productNames: string[]
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];
        const productName = productNames[i];

        const favoritesWithUsers = await tx.favorite.findMany({
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

        if (favoritesWithUsers.length > 0) {
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
        }
      }
    });
  }
}