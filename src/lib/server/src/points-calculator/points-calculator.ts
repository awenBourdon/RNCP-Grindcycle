import { BoardType, BoardCondition } from '@/generated/prisma';

export class PointsCalculatorService {

  private static readonly POINTS_BAREME = {
    SKATE: { 
      GOOD: 80, 
      AVERAGE: 60, 
      BAD: 40 
    },
    CRUISER: { 
      GOOD: 90, 
      AVERAGE: 70, 
      BAD: 50 
    },
    LONG: { 
      GOOD: 100, 
      AVERAGE: 80, 
      BAD: 60 
    }
  } as const;

  static calculateRecyclingPoints(
    boardType: BoardType, 
    condition: BoardCondition
  ): number {
    return this.POINTS_BAREME[boardType][condition];
  }
}