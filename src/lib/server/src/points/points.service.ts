import { PointsHistory, PointsType } from '@/generated/prisma';
import { InterfacePointsRepository } from './repository/interface-points.repository';
import { PointsRepository } from './repository/points.repository';

export class PointsService {
  constructor(
    private pointsRepository: InterfacePointsRepository = new PointsRepository()
  ) {}

  async awardRecyclingPoints(userId: string, usedBoardId: string, amount: number): Promise<PointsHistory> {
    if (amount <= 0) {
      throw new Error('Le montant des points doit être positif');
    }

    const pointsHistory = await this.pointsRepository.create({
      userId,
      type: PointsType.RECYCLING,
      pointsAmount: amount,
      usedBoardId,
    });

    await this.pointsRepository.addPointsToUser(userId, amount);
    
    return pointsHistory;
  }

  async deductPurchasePoints(userId: string, amount: number): Promise<PointsHistory> {
    if (amount <= 0) {
      throw new Error('Le montant des points doit être positif');
    }

    const currentBalance = await this.pointsRepository.getTotalPointsForUser(userId);
    if (currentBalance < amount) {
      throw new Error(`Points insuffisants. Solde: ${currentBalance}, requis: ${amount}`);
    }

    const pointsHistory = await this.pointsRepository.create({
      userId,
      type: PointsType.PURCHASE,
      pointsAmount: -amount,
      usedBoardId: null,
    });
    
    await this.pointsRepository.addPointsToUser(userId, -amount);
    
    return pointsHistory;
  }

  async getUserPointsTotal(userId: string): Promise<number> {
    return await this.pointsRepository.getTotalPointsForUser(userId);
  }

  async getUserPointsHistory(userId: string): Promise<PointsHistory[]> {
    return await this.pointsRepository.findByUserId(userId);
  }

  async removePointsForUsedBoard(userId: string, usedBoardId: string): Promise<void> {
    await this.pointsRepository.deleteByUsedBoardId(userId, usedBoardId);

  }

  getRepository(): InterfacePointsRepository {
    return this.pointsRepository;
  }
}

export const pointsService = new PointsService();