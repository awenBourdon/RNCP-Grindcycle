import {
  UsedBoardStatus,
  BoardCondition,
  UserRole,
  Order,
  OrderItem,
  OrderStatus,
  PaymentType,
  BoardType,
} from '@/generated/prisma';

export interface ProductType {
  id: string;
  name: string;
  description?: string | null;
  type: BoardType;
  priceEuro: number;
  pricePoints: number;
  imageUrl: string[];
  status: string;
  usedBoard?: {
    id: string;
    name: string;
    boardType: BoardType;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
}

export type CartItemType = {
  id: string;
  name: string;
  type: string;
  size?: number;
  priceEuro: number;
  pricePoints: number;
  quantity: number;
  imageUrl: string[];
};

export interface ErrorContext {
  error: {
    message: string;
  };
}

export interface Notification {
  id: string;
  description?: string;
  isRead: boolean;
  createdAt?: string | Date;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface AdminNotification {
  id: string;
  description: string;
  isRead: boolean;
  createdAt: string | Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface UsedBoard {
  id: string;
  name: string | null;
  image: string[];
  description: string | null;
  createdAt: Date;
  status: UsedBoardStatus;
  pointsAwarded: number | null;
}

export interface Session {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
  };
}
export { BoardType, BoardCondition, UsedBoardStatus, UserRole };
export interface CreateOrderData {
  userId: string;
  totalAmount: number;
  shippingCost: number;
  paymentType: PaymentType;
  pointsUsed?: number;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  shippingPhone?: string;
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  orderId: any;
  productId: string;
  productName: string;
  productType: BoardType;
  priceEuro: number;
  pricePoints?: number;
  quantity: number;
}

export interface OrderWithRelations extends Order {
  user:
    | {
        id: string;
        name: string;
        email: string;
      }
    | null
    | undefined;
  orderItems: OrderItemWithProduct[];
}

export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    name: string;
    type: BoardType;
    imageUrl: string[];
    status: string;
  };
}

export interface PurchaseWithPointsData {
  userId: string;
  cartItems: CartItemForPurchase[];
  shippingAddress?: ShippingAddress;
}

export interface CartItemForPurchase {
  productId: string;
  name: string;
  type: BoardType;
  priceEuro: number;
  pricePoints: number;
  quantity: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  totalPointsUsed: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentType: Record<PaymentType, number>;
}

export { PaymentType, OrderStatus };
