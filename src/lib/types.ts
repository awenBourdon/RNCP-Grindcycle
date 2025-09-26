import {
  UsedBoardStatus,
  BoardCondition,
  UserRole,
  Order,
  OrderItem,
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
