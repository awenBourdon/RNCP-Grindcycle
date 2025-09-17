import {
  OrderRepository,
  InterfaceOrderRepository,
} from '@/lib/server/repositories/orderRepository';
import {
  createNotification,
} from './notifications.service';
import {
  OrderWithRelations,
  PurchaseWithPointsData,
} from '@/lib/types';

export class OrderService {
  constructor(
    private orderRepository: InterfaceOrderRepository = new OrderRepository()
  ) {}

  async purchaseWithPoints(
    data: PurchaseWithPointsData
  ): Promise<OrderWithRelations> {
    const order = await this.orderRepository.purchaseWithPointsTransaction(data);
    
    const user = await this.orderRepository.findUserWithPoints(data.userId);
    
    await this.createPurchaseNotifications(order, user?.name || null);

    return order;
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