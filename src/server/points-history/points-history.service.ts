import { PointsHistory } from '@/generated/prisma';
import { 
  InterfacePointsHistoryRepository} from './repository/interface-points-history.repository';
import { PointsHistoryRepository } from './repository/points-history.repository';

export class PointsHistoryService {
  constructor(
    private pointsHistoryRepository: InterfacePointsHistoryRepository = new PointsHistoryRepository()
  ) {}

  async getUserPointsHistory(userId: string): Promise<PointsHistory[]> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    return await this.pointsHistoryRepository.findByUserId(userId);
  }

  getRepository(): InterfacePointsHistoryRepository {
    return this.pointsHistoryRepository;
  }
}