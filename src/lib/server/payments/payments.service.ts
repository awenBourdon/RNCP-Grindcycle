import { ProductStatus, OrderStatus, BoardType } from '@/generated/prisma';
import { OrderService } from '../orders/orders.service';
import { OrderItemService } from '../order-items/order-items.service';
import { ProductService } from '../products/products.service';
import { PointsHistoryService } from '../points-history/points-history.service';
import { OrderWithRelations } from '../orders/repository/interface-orders.repository';
import { createNotification, NotificationTemplates } from '../notifications/notifications.service';
import { CartItemForPayment, InterfacePaymentRepository, ShippingAddressData } from './repository/interface-payments.repository';
import { UserService } from '../users/users-service';
import { PaymentRepository } from './repository/payments.repository';

export interface StripePaymentData {
  userId: string | null;
  cartItems: CartItemForPurchase[];
  shippingAddress: ShippingAddress;
  shippingCost: number;
}

export interface PointsPaymentData {
  userId: string;
  cartItems: CartItemForPurchase[];
  shippingAddress: ShippingAddress;
}

export interface CartItemForPurchase {
  productId: string;
  name: string;
  type: BoardType;
  priceEuro: number;
  pricePoints: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}


export class PaymentService {
  constructor(
    private paymentRepository: InterfacePaymentRepository = new PaymentRepository(),
    private orderService: OrderService = new OrderService(),
    private orderItemService: OrderItemService = new OrderItemService(),
    private productService: ProductService = new ProductService(),
    private userService: UserService = new UserService(),
    private pointsHistoryService: PointsHistoryService = new PointsHistoryService()
  ) {}

  async processStripePayment(data: StripePaymentData): Promise<OrderWithRelations> {
    this.validateStripePaymentData(data);

    await this.validateProductAvailability(data.cartItems);

    const totalAmount = this.calculateTotalAmount(data.cartItems);

    const order = await this.orderService.getRepository().create({
      userId: data.userId,
      totalAmount,
      shippingCost: data.shippingCost,
      paymentType: 'EURO',
      pointsUsed: 0,
      status: OrderStatus.PENDING,
      shippingAddress: data.shippingAddress.address,
      shippingCity: data.shippingAddress.city,
      shippingPostalCode: data.shippingAddress.postalCode,
      shippingCountry: data.shippingAddress.country,
      shippingPhone: data.shippingAddress.phone,
    });

    const orderItems = data.cartItems.map(item => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.name,
      productType: item.type,
      priceEuro: item.priceEuro,
      pricePoints: item.pricePoints,
    }));

    await this.orderItemService.getRepository().createMultiple(orderItems);

    return await this.orderService.getOrderById(order.id);
  }

  async confirmStripePayment(orderId: string): Promise<OrderWithRelations> {
    if (!orderId) {
      throw new Error('ID de commande requis');
    }

    const confirmedOrder = await this.paymentRepository.executeStripeConfirmationTransaction(
      orderId,
      {
        orderService: this.orderService,
        orderItemService: this.orderItemService,
        userService: this.userService,
        pointsHistoryService: this.pointsHistoryService,
        productService: this.productService,
      }
    );

    const productIds = confirmedOrder.orderItems.map(item => item.productId);
    await this.productService.getRepository().updateManyStatus(productIds, ProductStatus.SOLD);

    await this.handlePostPaymentActions(confirmedOrder, 'stripe');

    return confirmedOrder;
  }

  async processPointsPayment(data: PointsPaymentData): Promise<OrderWithRelations> {
    this.validatePointsPaymentData(data);

    await this.validateProductAvailability(data.cartItems);

    const totalPoints = this.calculateTotalPoints(data.cartItems);

    const userPoints = await this.userService.getUserPoints(data.userId);
    if (userPoints < totalPoints) {
      throw new Error(`Points insuffisants. Tu as ${userPoints} points, ${totalPoints} requis.`);
    }

    const transactionData = {
      userId: data.userId,
      cartItems: this.convertToPaymentCartItems(data.cartItems),
      shippingAddress: this.convertToPaymentShippingAddress(data.shippingAddress),
      totalPoints,
    };

    const order = await this.paymentRepository.executePointsPaymentTransaction(
      transactionData,
      {
        orderService: this.orderService,
        orderItemService: this.orderItemService,
        userService: this.userService,
        pointsHistoryService: this.pointsHistoryService,
        productService: this.productService,
      }
    );

    const productIds = data.cartItems.map(item => item.productId);
    await this.productService.getRepository().updateManyStatus(productIds, ProductStatus.SOLD);

    const finalOrder = await this.orderService.getOrderById(order.id);
    await this.handlePostPaymentActions(finalOrder, 'points');

    return finalOrder;
  }

  async cancelOrder(orderId: string): Promise<OrderWithRelations> {
    if (!orderId) {
      throw new Error('ID de commande requis');
    }

    const order = await this.orderService.getOrderById(orderId);

    if (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      throw new Error('Cette commande ne peut plus être annulée');
    }

    const cancelledOrder = await this.orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);

    if (cancelledOrder.userId) {
      await createNotification({
        userId: cancelledOrder.userId,
        target: 'USER',
        description: NotificationTemplates.orderCancelled(orderId),
      });
    }

    return cancelledOrder;
  }


  private async handlePostPaymentActions(order: OrderWithRelations, paymentMethod: 'stripe' | 'points'): Promise<void> {
    try {
      await this.createPurchaseNotifications(order, paymentMethod);

      const productIds = order.orderItems.map(item => item.productId);
      const productNames = order.orderItems.map(item => item.productName);
      
      if (order.userId && productIds.length > 0) {
        await this.paymentRepository.cleanupFavoritesForPurchase(
          productIds,
          order.userId,
          productNames
        );
      }
    } catch (error) {
      console.error('Erreur post-paiement:', error);
    }
  }


  private async createPurchaseNotifications(order: OrderWithRelations, paymentMethod: 'stripe' | 'points'): Promise<void> {
    try {
      const productNames = order.orderItems
        .map(item => item.productName)
        .join(', ');

      if (order.userId) {
        const description = paymentMethod === 'points'
          ? `Commande confirmée ! Produits achetés : ${productNames}. Total : ${order.pointsUsed} points.`
          : `Commande confirmée ! Produits achetés : ${productNames}. Total : ${order.totalAmount}€.`;

        await createNotification({
          userId: order.userId,
          target: 'USER',
          description,
        });
      }

      const adminDescription = paymentMethod === 'points'
        ? `Nouvelle commande de ${order.user?.name || 'Utilisateur'} avec ${order.pointsUsed} points. Produits : ${productNames}`
        : `Nouvelle commande de ${order.user?.name || 'Utilisateur'} pour ${order.totalAmount}€. Produits : ${productNames}`;

      await createNotification({
        userId: null,
        target: 'ADMIN',
        description: adminDescription,
      });
    } catch (error) {
      console.error('Erreur création notifications:', error);
    }
  }

  private validateStripePaymentData(data: StripePaymentData): void {
    if (!data.cartItems || data.cartItems.length === 0) {
      throw new Error('Panier vide');
    }

    if (!data.shippingAddress) {
      throw new Error('Adresse de livraison requise');
    }

    if (data.shippingCost < 0) {
      throw new Error('Frais de livraison invalides');
    }
  }


  private validatePointsPaymentData(data: PointsPaymentData): void {
    if (!data.userId) {
      throw new Error('Utilisateur requis pour achat par points');
    }

    if (!data.cartItems || data.cartItems.length === 0) {
      throw new Error('Panier vide');
    }

    if (!data.shippingAddress) {
      throw new Error('Adresse de livraison requise');
    }
  }

  private async validateProductAvailability(cartItems: CartItemForPurchase[]): Promise<void> {
    for (const item of cartItems) {
      const product = await this.productService.getProductById(item.productId);
      
      if (product.status !== ProductStatus.CATALOG) {
        throw new Error(`Le produit "${item.name}" n'est plus disponible`);
      }
    }
  }

  private calculateTotalAmount(cartItems: CartItemForPurchase[]): number {
    return cartItems.reduce((total, item) => total + item.priceEuro, 0);
  }


  private calculateTotalPoints(cartItems: CartItemForPurchase[]): number {
    return cartItems.reduce((total, item) => total + item.pricePoints, 0);
  }

 
  private convertToPaymentCartItems(items: CartItemForPurchase[]): CartItemForPayment[] {
    return items.map(item => ({
      productId: item.productId,
      name: item.name,
      type: item.type,
      priceEuro: item.priceEuro,
      pricePoints: item.pricePoints
    }));
  }


  private convertToPaymentShippingAddress(address: ShippingAddress): ShippingAddressData {
    return {
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
    };
  }
}