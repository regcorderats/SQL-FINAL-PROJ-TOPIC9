-- CreateTable
CREATE TABLE "CustomerProfile_Audit" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldAge" INTEGER,
    "oldGender" TEXT,
    "oldEducation" TEXT,
    "oldIncome" DECIMAL(15,2),
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerProfile_Audit_pkey" PRIMARY KEY ("id")
);
