import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentType } from '@/generated/prisma';
import { CreateOrderData, OrderWithRelations, OrderStats } from '@/lib/types';

export interface InterfaceOrderRepository {
  create(data: CreateOrderData): Promise<OrderWithRelations>;
  findById(id: string): Promise<OrderWithRelations | null>;
  findByUserId(userId: string): Promise<OrderWithRelations[]>;
  findAll(): Promise<OrderWithRelations[]>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderWithRelations>;
  delete(id: string): Promise<void>;
  getStats(): Promise<OrderStats>;
}

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

  async getStats(): Promise<OrderStats> {
    const [orders, totalRevenue, totalPointsUsed] = await Promise.all([
      prisma.order.findMany({
        select: {
          status: true,
          paymentType: true,
          totalAmount: true,
          pointsUsed: true,
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentType: PaymentType.EURO },
      }),
      prisma.order.aggregate({
        _sum: { pointsUsed: true },
        where: { paymentType: PaymentType.POINTS },
      }),
    ]);

    const ordersByStatus = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<OrderStatus, number>
    );

    const ordersByPaymentType = orders.reduce(
      (acc, order) => {
        acc[order.paymentType] = (acc[order.paymentType] || 0) + 1;
        return acc;
      },
      {} as Record<PaymentType, number>
    );

    return {
      totalOrders: orders.length,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalPointsUsed: totalPointsUsed._sum.pointsUsed || 0,
      ordersByStatus,
      ordersByPaymentType,
    };
  }
}
