/*
  Warnings:

  - Added the required column `fullName` to the `CustomerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OutboxEvent" ADD COLUMN     "isAnalyticsProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFailed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "IdempotencyLog" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "requestPath" TEXT NOT NULL,
    "responseBody" JSONB NOT NULL,
    "responseStatus" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyLog_key_key" ON "IdempotencyLog"("key");

-- CreateIndex
CREATE INDEX "idx_idempotency_key" ON "IdempotencyLog"("key");

-- CreateIndex
CREATE INDEX "idx_outbox_aggregate_id" ON "OutboxEvent"("aggregateId");

-- CreateIndex
CREATE INDEX "idx_transaction_from_account_id" ON "Transaction"("fromAccountId");

-- CreateIndex
CREATE INDEX "idx_transaction_to_account_id" ON "Transaction"("toAccountId");
