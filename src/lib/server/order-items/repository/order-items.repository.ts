import { prisma } from '@/lib/utils/prisma';
import { OrderItem } from '@/generated/prisma';
import { InterfaceOrderItemRepository, OrderItemWithProduct, CreateOrderItemData, UpdateOrderItemData } from './interface-order-items';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class OrderItemRepository implements InterfaceOrderItemRepository {

  async findByOrderId(orderId: string): Promise<OrderItemWithProduct[]> {
    return await prisma.orderItem.findMany({
      where: { 
        orderId,
        deletedAt: null 
      },
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
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<OrderItemWithProduct | null> {
    return await prisma.orderItem.findUnique({
      where: { 
        id,
        deletedAt: null 
      },
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
    });
  }


  async create(data: CreateOrderItemData): Promise<OrderItem> {
    return await prisma.orderItem.create({
      data: {
        orderId: data.orderId,
        productId: data.productId,
        productName: data.productName,
        productType: data.productType,
        priceEuro: data.priceEuro,
        pricePoints: data.pricePoints,
      },
    });
  }


  async createMultiple(items: CreateOrderItemData[]): Promise<OrderItem[]> {
    const createdItems: OrderItem[] = [];
    
    for (const item of items) {
      const createdItem = await this.create(item);
      createdItems.push(createdItem);
    }
    
    return createdItems;
  }

  async createMultipleInTransaction(
    tx: PrismaTransaction, 
    items: CreateOrderItemData[]
  ): Promise<OrderItem[]> {
    const createdItems: OrderItem[] = [];
    
    for (const item of items) {
      const createdItem = await tx.orderItem.create({
        data: {
          orderId: item.orderId,
          productId: item.productId,
          productName: item.productName,
          productType: item.productType,
          priceEuro: item.priceEuro,
          pricePoints: item.pricePoints,
        },
      });
      createdItems.push(createdItem);
    }
    
    return createdItems;
  }

  async update(id: string, data: UpdateOrderItemData): Promise<OrderItemWithProduct> {
    return await prisma.orderItem.update({
      where: { id },
      data: {
        productName: data.productName,
        productType: data.productType,
        priceEuro: data.priceEuro,
        pricePoints: data.pricePoints,
      },
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
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.orderItem.delete({
      where: { id },
    });
  }
}