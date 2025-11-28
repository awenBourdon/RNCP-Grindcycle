import { BoardType } from "@/generated/prisma";
import { OrderItemService } from "../../order-items/order-items.service";
import { OrderService } from "../../orders/orders.service";
import { OrderWithRelations } from "../../orders/repository/interface-orders.repository";
import { PointsHistoryService } from "../../points-history/points-history.service";
import { ProductService } from "../../products/products.service";
import { UserService } from "../../users/users-service";



export interface StripePaymentTransactionData {
  userId: string | null;
  cartItems: CartItemForPayment[];
  shippingAddress: ShippingAddressData;
  shippingCost: number;
  totalAmount: number;
}

export interface PointsPaymentTransactionData {
  userId: string;
  cartItems: CartItemForPayment[];
  shippingAddress: ShippingAddressData;
  totalPoints: number;
}


export interface CartItemForPayment {
  productId: string;
  name: string;
  type: BoardType;
  priceEuro: number;
  pricePoints: number;
}

export interface ShippingAddressData {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentServices {
  orderService: OrderService;
  orderItemService: OrderItemService;
  userService: UserService;
  pointsHistoryService: PointsHistoryService;
  productService: ProductService;
}

export interface InterfacePaymentRepository {

 executePointsPaymentTransaction(
    data: PointsPaymentTransactionData,
    services: PaymentServices
  ): Promise<OrderWithRelations>;

 executeStripeConfirmationTransaction(
    orderId: string,
    services: PaymentServices
  ): Promise<OrderWithRelations>;

cleanupFavoritesForPurchase(
    productIds: string[],
    buyerId: string,
    productNames: string[]
  ): Promise<void>;
}