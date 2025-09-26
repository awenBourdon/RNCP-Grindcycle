import { UsedBoard, UsedBoardStatus, BoardType, BoardCondition } from '@/generated/prisma';
import { UserService } from '../../users/users-service';
import { PointsHistoryService } from '../../points-history/points-history.service';

/**
 * Interface pour les données de création d'une UsedBoard
 */
export interface CreateUsedBoardData {
  name: string;
  userId: string;
  boardType: BoardType;
  boardCondition: BoardCondition;
  description?: string | null;
  image: string[];
}

/**
 * Interface pour les données de mise à jour d'une UsedBoard
 */
export interface UpdateUsedBoardData {
  name?: string;
  boardType?: BoardType;
  boardCondition?: BoardCondition;
  description?: string | null;
  image?: string[];
  status?: UsedBoardStatus;
  pointsAwarded?: number;
}

/**
 * UsedBoard avec relations User et Product
 */
export interface UsedBoardWithRelations extends UsedBoard {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  product?: {
    id: string;
    name: string;
    status: string;
  } | null;
}


/**
 * Interface du repository UsedBoards - Version refactorée
 * Responsabilité : CRUD des planches d'occasion
 */
export interface InterfaceUsedBoardRepository {
  /**
   * Crée une nouvelle planche d'occasion
   * @param data - Données de création
   * @returns Planche créée
   */
  create(data: CreateUsedBoardData): Promise<UsedBoard>;

  /**
   * Récupère une planche par son ID
   * @param id - ID de la planche
   * @returns Planche avec relations ou null si non trouvée
   */
  findById(id: string): Promise<UsedBoardWithRelations | null>;

  /**
   * Récupère toutes les planches
   * @returns Liste de toutes les planches avec relations
   */
  findAll(): Promise<UsedBoardWithRelations[]>;

  /**
   * Récupère toutes les planches d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Liste des planches de l'utilisateur
   */
  findByUserId(userId: string): Promise<UsedBoardWithRelations[]>;

  /**
   * Récupère les planches disponibles pour création de produits
   * @returns Liste des planches en statut RECEIVED
   */
  findAvailable(): Promise<UsedBoardWithRelations[]>;

  /**
   * Met à jour une planche
   * @param id - ID de la planche
   * @param data - Données de mise à jour
   * @returns Planche mise à jour
   */
  update(id: string, data: UpdateUsedBoardData): Promise<UsedBoardWithRelations>;

  /**
   * Met à jour une planche avec gestion complète des points et utilisateur
   * @param id - ID de la planche
   * @param data - Données de mise à jour
   * @param oldBoard - Planche avant mise à jour
   * @param services - Services nécessaires pour la transaction
   * @returns Planche mise à jour
   */
  updateWithPointsAndUserTransaction(
    id: string,
    data: UpdateUsedBoardData,
    oldBoard: UsedBoardWithRelations,
    services: {
      pointsHistoryService: PointsHistoryService;
      userService: UserService;
    }
  ): Promise<UsedBoardWithRelations>;


  delete(id: string): Promise<void>;
findUserById(userId: string): Promise<{ name: string | null } | null>;
}