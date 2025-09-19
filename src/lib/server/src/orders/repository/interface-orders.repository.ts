import { OrderStatus } from '@/generated/prisma';
import { CreateOrderData, OrderWithRelations, PurchaseWithPointsData } from '@/lib/types';

export interface InterfaceOrderRepository {
  create(data: CreateOrderData): Promise<OrderWithRelations>;
  findById(id: string): Promise<OrderWithRelations | null>;
  findByUserId(userId: string): Promise<OrderWithRelations[]>;
  findAll(): Promise<OrderWithRelations[]>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderWithRelations>;
  delete(id: string): Promise<void>;
  
  findUserWithPoints(userId: string): Promise<{
    id: string;
    name: string | null;
    email: string;
    points: number;
  } | null>;
  
  purchaseWithPointsTransaction(data: PurchaseWithPointsData): Promise<OrderWithRelations>;
  
  notifyFavoriteUsersAndCleanup(
    productId: string,
    buyerId: string,
    productName: string
  ): Promise<void>;

  markProductsAsSold(productIds: string[]): Promise<void>;
}