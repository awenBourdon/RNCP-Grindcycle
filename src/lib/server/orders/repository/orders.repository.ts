import { prisma } from '@/lib/utils/prisma';
import { OrderStatus } from '@/generated/prisma';
import {
  InterfaceOrderRepository,
  CreateOrderData,
  OrderWithRelations
} from './interface-orders.repository';
import { PaginatedResponse, createPaginatedResponse } from '@/lib/utils/pagination';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class OrderRepository implements InterfaceOrderRepository {

  async create(data: CreateOrderData): Promise<OrderWithRelations> {
    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        totalAmount: data.totalAmount,
        shippingCost: data.shippingCost,
        paymentType: data.paymentType,
        pointsUsed: data.pointsUsed || 0,
        status: data.status || OrderStatus.PENDING,
        shippingAddress: data.shippingAddress || '',
        shippingCity: data.shippingCity || '',
        shippingPostalCode: data.shippingPostalCode || '',
        shippingCountry: data.shippingCountry || '',
        shippingPhone: data.shippingPhone || '',
      },
      include: this.getIncludeRelations(),
    });

    return order as OrderWithRelations;
  }

  async createInTransaction(
    tx: PrismaTransaction, 
    data: CreateOrderData
  ): Promise<OrderWithRelations> {
    const order = await tx.order.create({
      data: {
        userId: data.userId,
        totalAmount: data.totalAmount,
        shippingCost: data.shippingCost,
        paymentType: data.paymentType,
        pointsUsed: data.pointsUsed || 0,
        status: data.status || OrderStatus.PENDING,
        shippingAddress: data.shippingAddress || '',
        shippingCity: data.shippingCity || '',
        shippingPostalCode: data.shippingPostalCode || '',
        shippingCountry: data.shippingCountry || '',
        shippingPhone: data.shippingPhone || '',
      },
      include: this.getIncludeRelations(),
    });

    return order as OrderWithRelations;
  }

  async findById(id: string): Promise<OrderWithRelations | null> {
    const order = await prisma.order.findUnique({
      where: { 
        id,
        deletedAt: null 
      },
      include: this.getIncludeRelations(),
    });

    return order as OrderWithRelations | null;
  }

  async findByUserId(userId: string): Promise<OrderWithRelations[]> {
    const orders = await prisma.order.findMany({
      where: { 
        userId,
        deletedAt: null 
      },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' },
    });

    return orders as OrderWithRelations[];
  }

  async findAll(): Promise<OrderWithRelations[]> {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' },
    });

    return orders as OrderWithRelations[];
  }

  async findByUserIdWithPagination(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponse<OrderWithRelations>> {
    const skip = (page - 1) * limit;
    
    const where = { 
      userId,
      deletedAt: null 
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: this.getIncludeRelations(),
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return createPaginatedResponse(
      orders as OrderWithRelations[],
      total,
      page,
      limit
    );
  }

  async findAllWithPagination(
    page: number,
    limit: number
  ): Promise<PaginatedResponse<OrderWithRelations>> {
    const skip = (page - 1) * limit;
    
    const where = { deletedAt: null };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: this.getIncludeRelations(),
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return createPaginatedResponse(
      orders as OrderWithRelations[],
      total,
      page,
      limit
    );
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderWithRelations> {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: this.getIncludeRelations(),
    });

    return order as OrderWithRelations;
  }

  private getIncludeRelations() {
    return {
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
        orderBy: { createdAt: 'asc' as const },
      },
    };
  }
}