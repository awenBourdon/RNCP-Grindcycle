import { OrderStatus } from '@/generated/prisma';
import { PaginatedResponse } from '@/lib/utils/pagination';

export interface OrderWithRelations {
  id: string;
  userId: string | null;
  totalAmount: number;
  shippingCost: number;
  paymentType: 'EURO' | 'POINTS';
  pointsUsed: number | null;
  status: OrderStatus;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  shippingPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  orderItems: Array<{
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productType: string;
    priceEuro: number;
    pricePoints: number | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    product: {
      id: string;
      name: string;
      type: string;
      imageUrl: string[];
      status: string;
    };
  }>;
}

export interface CreateOrderData {
  userId: string | null;
  totalAmount: number;
  shippingCost: number;
  paymentType: 'EURO' | 'POINTS';
  pointsUsed?: number;
  status?: OrderStatus;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  shippingPhone?: string | null;
}

type PrismaTransaction = Parameters<Parameters<typeof import('@/lib/utils/prisma').prisma.$transaction>[0]>[0];

export interface InterfaceOrderRepository {
  create(data: CreateOrderData): Promise<OrderWithRelations>;
  createInTransaction(tx: PrismaTransaction, data: CreateOrderData): Promise<OrderWithRelations>;
  findById(id: string): Promise<OrderWithRelations | null>;
  findByUserId(userId: string): Promise<OrderWithRelations[]>;
  findAll(): Promise<OrderWithRelations[]>;
  findByUserIdWithPagination(userId: string, page: number, limit: number): Promise<PaginatedResponse<OrderWithRelations>>;
  findAllWithPagination(page: number, limit: number): Promise<PaginatedResponse<OrderWithRelations>>;
  
  updateStatus(id: string, status: OrderStatus): Promise<OrderWithRelations>;
}