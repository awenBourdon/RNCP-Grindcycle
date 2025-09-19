import { OrderStatus } from '@/generated/prisma';
import {
  OrderRepository,
  InterfaceOrderRepository,
} from '@/lib/server/src/orders/repository/orders.repository';
import {
  createNotification,
} from '../notifications/notifications.service';
import {
  CartItemForPurchase,
  OrderWithRelations,
  PurchaseWithPointsData,
} from '@/lib/types';
import { pointsService } from '../points/points.service';

export class OrderService {
  constructor(
    private orderRepository: InterfaceOrderRepository = new OrderRepository()
  ) {}

  async purchaseWithPoints(
    data: PurchaseWithPointsData
  ): Promise<OrderWithRelations> {
    const totalPointsNeeded = this.calculateTotalPoints(data.cartItems);
    const userPointsTotal = await pointsService.getUserPointsTotal(data.userId);

    if (userPointsTotal < totalPointsNeeded) {
      throw new Error(
        `Points insuffisants. Tu as ${userPointsTotal} points, ${totalPointsNeeded} requis.`
      );
    }

    const order = await this.orderRepository.purchaseWithPointsTransaction(data);
   
    const user = await this.orderRepository.findUserWithPoints(data.userId);
   
    await this.createPurchaseNotifications(order, user?.name || null);
    return order;
  }

  async confirmStripePayment(orderId: string): Promise<OrderWithRelations> {
    const updatedOrder = await this.orderRepository.updateStatus(orderId, 'CONFIRMED');
    
    await this.orderRepository.markProductsAsSold(
      updatedOrder.orderItems.map(item => item.productId)
    );

    const user = updatedOrder.user;
    await this.createStripeNotifications(updatedOrder, user?.name || null);

    return updatedOrder;
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

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderWithRelations> {
    return await this.orderRepository.updateStatus(orderId, status);
  }

  private calculateTotalPoints(cartItems: CartItemForPurchase[]): number {
    return Array.isArray(cartItems) 
      ? cartItems.reduce((total, item) => total + ((item.pricePoints || 0) * (item.quantity || 0)), 0)
      : 0;
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
        await this.orderRepository.notifyFavoriteUsersAndCleanup(
          item.productId,
          order.userId!,
          item.productName
        );
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
    }
  }

  private async createStripeNotifications(
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
          description: `Commande confirmée ! Produits achetés : ${productNames}. Total : ${order.totalAmount}€.`,
        });
      }

      await createNotification({
        userId: null,
        target: 'ADMIN',
        description: `Nouvelle commande de ${userName || 'Utilisateur'} pour ${order.totalAmount}€. Produits : ${productNames}`,
      });

      for (const item of order.orderItems) {
        await this.orderRepository.notifyFavoriteUsersAndCleanup(
          item.productId,
          order.userId!,
          item.productName
        );
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
    }
  }
}