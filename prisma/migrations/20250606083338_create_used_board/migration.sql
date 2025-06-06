-- CreateEnum
CREATE TYPE "UsedBoardStatus" AS ENUM ('envoyé', 'reçu', 'refusé');

-- CreateEnum
CREATE TYPE "BoardCondition" AS ENUM ('bon', 'moyen', 'mauvais');

-- CreateEnum
CREATE TYPE "PointsType" AS ENUM ('achat', 'recyclage');

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "image" TEXT[];

-- CreateTable
CREATE TABLE "used_board" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "UsedBoardStatus" NOT NULL DEFAULT 'envoyé',
    "boardCondition" "BoardCondition",
    "description" TEXT,
    "image" TEXT[],
    "pointsAwarded" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "used_board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PointsType" NOT NULL,
    "pointsAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "used_board" ADD CONSTRAINT "used_board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
