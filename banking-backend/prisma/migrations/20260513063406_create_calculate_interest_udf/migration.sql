/*
  Warnings:

  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_KYC', 'ACTIVE', 'DORMANT', 'CLOSED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionStatus" ADD VALUE 'APPROVED';
ALTER TYPE "TransactionStatus" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "frozenBalance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "isVault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_KYC',
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "checkerId" TEXT,
ADD COLUMN     "makerId" TEXT,
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_checkerId_fkey" FOREIGN KEY ("checkerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
DROP FUNCTION IF EXISTS calculate_daily_interest();

-- Tạo User Defined Function (UDF)
CREATE OR REPLACE FUNCTION calculate_daily_interest()
RETURNS integer AS $$
DECLARE
    updated_rows integer;
BEGIN
    UPDATE "Account"
    SET balance = balance + (balance * 0.005 / 365),
        "updatedAt" = NOW()
    WHERE status = 'ACTIVE' 
      AND balance > 0 
      AND "isVault" = false;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    
    RETURN updated_rows;
END;
$$ LANGUAGE plpgsql;