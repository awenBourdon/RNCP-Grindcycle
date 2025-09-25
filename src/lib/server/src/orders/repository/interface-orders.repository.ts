import { OrderStatus } from '@/generated/prisma';
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
    quantity: number;
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

/**
 * Interface pour les données de création d'une commande
 */
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

/**
 * Type pour les transactions Prisma
 */
type PrismaTransaction = Parameters<Parameters<typeof import('@/lib/prisma').prisma.$transaction>[0]>[0];


/**
 * Interface du repository Orders
 * Responsabilité : CRUD des commandes
 */
export interface InterfaceOrderRepository {
  /**
   * Crée une nouvelle commande
   * @param data - Données de création
   * @returns Commande créée avec relations
   */
  create(data: CreateOrderData): Promise<OrderWithRelations>;

  /**
   * Crée une nouvelle commande au sein d'une transaction
   * @param tx - Transaction Prisma
   * @param data - Données de création
   * @returns Commande créée avec relations
   */
  createInTransaction(tx: PrismaTransaction, data: CreateOrderData): Promise<OrderWithRelations>;
  /**
   * Récupère une commande par son ID
   * @param id - ID de la commande
   * @returns Commande avec relations ou null si non trouvée
   */
  findById(id: string): Promise<OrderWithRelations | null>;

  /**
   * Récupère toutes les commandes d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Liste des commandes triées par date décroissante
   */
  findByUserId(userId: string): Promise<OrderWithRelations[]>;

  /**
   * Récupère toutes les commandes (pour admin)
   * @returns Liste de toutes les commandes triées par date décroissante
   */
  findAll(): Promise<OrderWithRelations[]>;

  /**
   * Met à jour le statut d'une commande
   * @param id - ID de la commande
   * @param status - Nouveau statut
   * @returns Commande mise à jour
   */
  updateStatus(id: string, status: OrderStatus): Promise<OrderWithRelations>;
}