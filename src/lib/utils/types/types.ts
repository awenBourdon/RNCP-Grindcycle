import {
  UsedBoardStatus,
  BoardCondition,
  UserRole,
  BoardType,
  ProductStatus,
  NotificationTarget,
  PaymentType,
  OrderStatus,
  PointsType,
} from '../enums/enums';


export interface Product {
  id: string;
  name: string;
  description?: string | null;
  type: BoardType;
  priceEuro: number;
  pricePoints: number;
  imageUrl: string[];
  status: ProductStatus;
  usedBoard?: {
    id: string;
    name: string;
    boardType: BoardType;
    user?: {
      id: string;
      name: string;
      email: string;
    } | null;
  } | null;
}


export interface CartItem {
  id: string;
  name: string;
  type: BoardType;
  size?: number;
  priceEuro: number;
  pricePoints: number;
  imageUrl: string[];
}


export interface ErrorContext {
  error: {
    message: string;
  };
}


export interface Notification {
  id: string;
  target: NotificationTarget;
  description: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
  isRead?: boolean;
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


export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
}

export interface UsedBoard {
  id: string;
  name: string;
  description: string | null;
  image: string[];
  userId?: string | null;
  boardType: BoardType;
  boardCondition?: BoardCondition | null;
  status: UsedBoardStatus;
  pointsAwarded?: number | null;
  createdAt: Date;
  updatedAt: Date;
}


export interface PointsHistory {
  id: string;
  userId?: string | null;
  usedBoardId?: string | null;
  type: PointsType;
  pointsAmount: number;
  createdAt: Date;
  deletedAt?: Date | null;
}

export interface Order {
  id: string;
  userId?: string | null;
  totalAmount: number;
  shippingCost: number;
  paymentType: PaymentType;
  pointsUsed?: number;
  status: OrderStatus;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productType: BoardType;
  priceEuro: number;
  pricePoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    name: string;
    type: BoardType;
    imageUrl: string[];
    status: ProductStatus;
  };
}

export interface OrderWithRelations extends Order {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  orderItems: OrderItemWithProduct[];
}

export interface Favorite {
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}