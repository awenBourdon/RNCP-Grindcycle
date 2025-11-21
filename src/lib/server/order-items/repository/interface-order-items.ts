import { BoardType, OrderItem } from '@/generated/prisma';

export interface CreateOrderItemData {
  orderId: string;
  productId: string;
  productName: string;
  productType: BoardType;
  priceEuro: number;
  pricePoints: number | null;
}

export interface UpdateOrderItemData {
  productName?: string;
  productType?: BoardType;
  priceEuro?: number;
  pricePoints?: number | null;
}

export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    name: string;
    type: string;
    imageUrl: string[];
    status: string;
  };
}

type PrismaTransaction = Parameters<Parameters<typeof import('@/lib/utils/prisma').prisma.$transaction>[0]>[0];

export interface InterfaceOrderItemRepository {

  findByOrderId(orderId: string): Promise<OrderItemWithProduct[]>;
  findById(id: string): Promise<OrderItemWithProduct | null>;
  create(data: CreateOrderItemData): Promise<OrderItem>;
  createMultiple(items: CreateOrderItemData[]): Promise<OrderItem[]>;
  createMultipleInTransaction(tx: PrismaTransaction, items: CreateOrderItemData[]): Promise<OrderItem[]>;
  update(id: string, data: UpdateOrderItemData): Promise<OrderItemWithProduct>;
  delete(id: string): Promise<void>;
}