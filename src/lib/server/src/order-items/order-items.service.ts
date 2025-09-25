import { OrderItem } from '@/generated/prisma';
import { OrderItemRepository } from './repository/order-items.repository';
import { CreateOrderItemData, InterfaceOrderItemRepository, OrderItemWithProduct, UpdateOrderItemData } from './repository/interface-order-items';

export class OrderItemService {
  constructor(
    private orderItemRepository: InterfaceOrderItemRepository = new OrderItemRepository()
  ) {}

  async getOrderItems(orderId: string): Promise<OrderItemWithProduct[]> {
    if (!orderId) {
      throw new Error('ID de commande requis');
    }

    return await this.orderItemRepository.findByOrderId(orderId);
  }

  async getOrderItemById(itemId: string): Promise<OrderItemWithProduct> {
    if (!itemId) {
      throw new Error('ID de l\'item requis');
    }

    const item = await this.orderItemRepository.findById(itemId);
    
    if (!item) {
      throw new Error('Item de commande non trouvé');
    }

    return item;
  }

  async createOrderItem(data: CreateOrderItemData): Promise<OrderItem> {
    this.validateCreateData(data);
    return await this.orderItemRepository.create(data);
  }

  async updateOrderItem(itemId: string, data: UpdateOrderItemData): Promise<OrderItemWithProduct> {
    if (!itemId) {
      throw new Error('ID de l\'item requis');
    }

    await this.getOrderItemById(itemId);

    this.validateUpdateData(data);
    return await this.orderItemRepository.update(itemId, data);
  }

  async deleteOrderItem(itemId: string): Promise<void> {
    if (!itemId) {
      throw new Error('ID de l\'item requis');
    }

    await this.getOrderItemById(itemId);

    await this.orderItemRepository.delete(itemId);
  }

  getRepository(): InterfaceOrderItemRepository {
    return this.orderItemRepository;
  }

  private validateCreateData(data: CreateOrderItemData): void {
    if (!data.orderId) {
      throw new Error('ID de commande requis');
    }
    if (!data.productId) {
      throw new Error('ID de produit requis');
    }
    if (!data.productName || data.productName.trim().length === 0) {
      throw new Error('Nom de produit requis');
    }
    if (!data.productType) {
      throw new Error('Type de produit requis');
    }
    if (data.priceEuro < 0) {
      throw new Error('Prix en euros ne peut pas être négatif');
    }
    if (data.pricePoints !== null && data.pricePoints < 0) {
      throw new Error('Prix en points ne peut pas être négatif');
    }
  }

  private validateUpdateData(data: UpdateOrderItemData): void {
    if (data.productName !== undefined && data.productName.trim().length === 0) {
      throw new Error('Nom de produit ne peut pas être vide');
    }
    if (data.priceEuro !== undefined && data.priceEuro < 0) {
      throw new Error('Prix en euros ne peut pas être négatif');
    }
    if (data.pricePoints !== undefined && data.pricePoints !== null && data.pricePoints < 0) {
      throw new Error('Prix en points ne peut pas être négatif');
    }
  }
}