-- AlterEnum
ALTER TYPE "Plan" ADD VALUE 'ENTERPRISE';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- CreateTable
CREATE TABLE "CostWeights" (
    "id" TEXT NOT NULL,
    "leagueWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "conditionWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "indicatorWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "apiWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "eventWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "notificationWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "frequencyWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostWeights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBudget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalBudget" INTEGER NOT NULL,
    "usedBudget" INTEGER NOT NULL DEFAULT 0,
    "plan" "Plan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyComplexity" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "complexityScore" INTEGER NOT NULL,
    "leagueCost" INTEGER NOT NULL,
    "conditionCost" INTEGER NOT NULL,
    "indicatorCost" INTEGER NOT NULL,
    "apiCost" INTEGER NOT NULL,
    "eventCost" INTEGER NOT NULL,
    "notificationCost" INTEGER NOT NULL,
    "frequencyCost" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyComplexity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyFingerprint" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "similarityGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBudget_userId_key" ON "UserBudget"("userId");

-- CreateIndex
CREATE INDEX "UserBudget_userId_idx" ON "UserBudget"("userId");

-- CreateIndex
CREATE INDEX "UserBudget_plan_idx" ON "UserBudget"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyComplexity_strategyId_key" ON "StrategyComplexity"("strategyId");

-- CreateIndex
CREATE INDEX "StrategyComplexity_strategyId_idx" ON "StrategyComplexity"("strategyId");

-- CreateIndex
CREATE INDEX "StrategyComplexity_complexityScore_idx" ON "StrategyComplexity"("complexityScore");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyFingerprint_strategyId_key" ON "StrategyFingerprint"("strategyId");

-- CreateIndex
CREATE INDEX "StrategyFingerprint_fingerprint_idx" ON "StrategyFingerprint"("fingerprint");

-- CreateIndex
CREATE INDEX "StrategyFingerprint_similarityGroup_idx" ON "StrategyFingerprint"("similarityGroup");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_ipAddress_idx" ON "AuditLog"("ipAddress");
