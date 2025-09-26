import { OrderStatus } from '@/generated/prisma';
import {
  InterfaceOrderRepository,
  OrderWithRelations
} from './repository/interface-orders.repository';
import { OrderRepository } from './repository/orders.repository';
export class OrderService {
  constructor(
    private orderRepository: InterfaceOrderRepository = new OrderRepository()
  ) {}

  async getOrderById(orderId: string): Promise<OrderWithRelations> {
    if (!orderId) {
      throw new Error('ID de commande requis');
    }

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Commande non trouvée');
    }

    return order;
  }

  async getUserOrders(userId: string): Promise<OrderWithRelations[]> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    return await this.orderRepository.findByUserId(userId);
  }

  async getAllOrders(): Promise<OrderWithRelations[]> {
    return await this.orderRepository.findAll();
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderWithRelations> {
    if (!orderId) {
      throw new Error('ID de commande requis');
    }

    if (!Object.values(OrderStatus).includes(status)) {
      throw new Error('Statut de commande invalide');
    }

    await this.getOrderById(orderId);

    return await this.orderRepository.updateStatus(orderId, status);
  }

  getRepository(): InterfaceOrderRepository {
    return this.orderRepository;
  }
}