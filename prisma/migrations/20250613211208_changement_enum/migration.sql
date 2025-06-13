/*
  Warnings:

  - The values [bon,moyen,mauvais] on the enum `BoardCondition` will be removed. If these variants are still used in the database, this will fail.
  - The values [achat,recyclage] on the enum `PointsType` will be removed. If these variants are still used in the database, this will fail.
  - The values [envoyé,reçu,refusé] on the enum `UsedBoardStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BoardCondition_new" AS ENUM ('GOOD', 'AVERAGE', 'BAD');
ALTER TABLE "used_board" ALTER COLUMN "boardCondition" TYPE "BoardCondition_new" USING ("boardCondition"::text::"BoardCondition_new");
ALTER TYPE "BoardCondition" RENAME TO "BoardCondition_old";
ALTER TYPE "BoardCondition_new" RENAME TO "BoardCondition";
DROP TYPE "BoardCondition_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PointsType_new" AS ENUM ('PURCHASE', 'RECYCLING');
ALTER TABLE "points_history" ALTER COLUMN "type" TYPE "PointsType_new" USING ("type"::text::"PointsType_new");
ALTER TYPE "PointsType" RENAME TO "PointsType_old";
ALTER TYPE "PointsType_new" RENAME TO "PointsType";
DROP TYPE "PointsType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UsedBoardStatus_new" AS ENUM ('SENT', 'RECEIVED', 'REJECTED');
ALTER TABLE "used_board" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "used_board" ALTER COLUMN "status" TYPE "UsedBoardStatus_new" USING ("status"::text::"UsedBoardStatus_new");
ALTER TYPE "UsedBoardStatus" RENAME TO "UsedBoardStatus_old";
ALTER TYPE "UsedBoardStatus_new" RENAME TO "UsedBoardStatus";
DROP TYPE "UsedBoardStatus_old";
ALTER TABLE "used_board" ALTER COLUMN "status" SET DEFAULT 'SENT';
COMMIT;

-- AlterTable
ALTER TABLE "used_board" ALTER COLUMN "status" SET DEFAULT 'SENT';

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL,
    "shippingAddress" TEXT,
    "shippingCity" TEXT,
    "shippingPostalCode" TEXT,
    "shippingCountry" TEXT,
    "shippingPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);
