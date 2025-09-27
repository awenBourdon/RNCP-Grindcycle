import { describe, it, expect } from 'vitest'
import { PointsCalculatorService } from '../../lib/server/points-calculator/points-calculator'
import { BoardType, BoardCondition } from '@/generated/prisma'

describe('PointsCalculatorService', () => {
  describe('calculateRecyclingPoints', () => {
    describe('SKATE boards', () => {
      it('doit retourner 80 points pour une planche SKATE en bon état', () => {
        const points = PointsCalculatorService.calculateRecyclingPoints(
          BoardType.SKATE, 
          BoardCondition.GOOD
        )
        
        expect(points).toBe(80)
      })

      it('doit retourner 60 points pour une planche SKATE en état moyen', () => {
        const points = PointsCalculatorService.calculateRecyclingPoints(
          BoardType.SKATE, 
          BoardCondition.AVERAGE
        )
        
        expect(points).toBe(60)
      })

      it('doit retourner 40 points pour une planche SKATE en mauvais état', () => {
        const points = PointsCalculatorService.calculateRecyclingPoints(
          BoardType.SKATE, 
          BoardCondition.BAD
        )
        
        expect(points).toBe(40)
      })
    })

    describe('CRUISER boards', () => {
      it('doit retourner 90 points pour une planche CRUISER en bon état', () => {
        const points = PointsCalculatorService.calculateRecyclingPoints(
          BoardType.CRUISER, 
          BoardCondition.GOOD
        )
        
        expect(points).toBe(90)
      })

      it('doit retourner 70 points pour une planche CRUISER en état moyen', () => {
        const points = PointsCalculatorService.calculateRecyclingPoints(
          BoardType.CRUISER, 
          BoardCondition.AVERAGE
        )
        
        expect(points).toBe(70)
      })

      it('doit retourner 50 points pour une planche CRUISER en mauvais état', () => {
        const points = PointsCalculatorService.calculateRecyclingPoints(
          BoardType.CRUISER, 
          BoardCondition.BAD
        )
        
        expect(points).toBe(50)
      })
    })

    describe('LONG boards', () => {
      it('doit retourner 100 points pour une planche LONG en bon état', () => {
        const points = PointsCalculatorService.calculateRecyclingPoints(
          BoardType.LONG, 
          BoardCondition.GOOD
        )
        
        expect(points).toBe(100)
      })

      it('doit retourner 80 points pour une planche LONG en état moyen', () => {
        const points = PointsCalculatorService.calculateRecyclingPoints(
          BoardType.LONG, 
          BoardCondition.AVERAGE
        )
        
        expect(points).toBe(80)
      })

      it('doit retourner 60 points pour une planche LONG en mauvais état', () => {
        const points = PointsCalculatorService.calculateRecyclingPoints(
          BoardType.LONG, 
          BoardCondition.BAD
        )
        
        expect(points).toBe(60)
      })
    })

    describe('Tests de cohérence', () => {
      it('les planches LONG doivent toujours valoir plus que les CRUISER', () => {
        const longGood = PointsCalculatorService.calculateRecyclingPoints(BoardType.LONG, BoardCondition.GOOD)
        const cruiserGood = PointsCalculatorService.calculateRecyclingPoints(BoardType.CRUISER, BoardCondition.GOOD)
        
        const longAverage = PointsCalculatorService.calculateRecyclingPoints(BoardType.LONG, BoardCondition.AVERAGE)
        const cruiserAverage = PointsCalculatorService.calculateRecyclingPoints(BoardType.CRUISER, BoardCondition.AVERAGE)
        
        const longBad = PointsCalculatorService.calculateRecyclingPoints(BoardType.LONG, BoardCondition.BAD)
        const cruiserBad = PointsCalculatorService.calculateRecyclingPoints(BoardType.CRUISER, BoardCondition.BAD)

        expect(longGood).toBeGreaterThan(cruiserGood)
        expect(longAverage).toBeGreaterThan(cruiserAverage)
        expect(longBad).toBeGreaterThan(cruiserBad)
      })

      it('les planches CRUISER doivent toujours valoir plus que les SKATE', () => {
        const cruiserGood = PointsCalculatorService.calculateRecyclingPoints(BoardType.CRUISER, BoardCondition.GOOD)
        const skateGood = PointsCalculatorService.calculateRecyclingPoints(BoardType.SKATE, BoardCondition.GOOD)
        
        const cruiserAverage = PointsCalculatorService.calculateRecyclingPoints(BoardType.CRUISER, BoardCondition.AVERAGE)
        const skateAverage = PointsCalculatorService.calculateRecyclingPoints(BoardType.SKATE, BoardCondition.AVERAGE)
        
        const cruiserBad = PointsCalculatorService.calculateRecyclingPoints(BoardType.CRUISER, BoardCondition.BAD)
        const skateBad = PointsCalculatorService.calculateRecyclingPoints(BoardType.SKATE, BoardCondition.BAD)

        expect(cruiserGood).toBeGreaterThan(skateGood)
        expect(cruiserAverage).toBeGreaterThan(skateAverage)
        expect(cruiserBad).toBeGreaterThan(skateBad)
      })

      it("une planche en bon état doit toujours valoir plus qu'en état moyen", () => {
        Object.values(BoardType).forEach(boardType => {
          const goodPoints = PointsCalculatorService.calculateRecyclingPoints(boardType, BoardCondition.GOOD)
          const averagePoints = PointsCalculatorService.calculateRecyclingPoints(boardType, BoardCondition.AVERAGE)
          
          expect(goodPoints).toBeGreaterThan(averagePoints)
        })
      })

      it("une planche en état moyen doit toujours valoir plus qu'en mauvais état", () => {
        Object.values(BoardType).forEach(boardType => {
          const averagePoints = PointsCalculatorService.calculateRecyclingPoints(boardType, BoardCondition.AVERAGE)
          const badPoints = PointsCalculatorService.calculateRecyclingPoints(boardType, BoardCondition.BAD)
          
          expect(averagePoints).toBeGreaterThan(badPoints)
        })
      })
    })

    describe('Tests de régression', () => {
      it('doit retourner des points positifs pour toutes les combinaisons', () => {
        Object.values(BoardType).forEach(boardType => {
          Object.values(BoardCondition).forEach(condition => {
            const points = PointsCalculatorService.calculateRecyclingPoints(boardType, condition)
            expect(points).toBeGreaterThan(0)
          })
        })
      })

      it('doit retourner des nombres entiers', () => {
        Object.values(BoardType).forEach(boardType => {
          Object.values(BoardCondition).forEach(condition => {
            const points = PointsCalculatorService.calculateRecyclingPoints(boardType, condition)
            expect(Number.isInteger(points)).toBe(true)
          })
        })
      })
    })
  })
})