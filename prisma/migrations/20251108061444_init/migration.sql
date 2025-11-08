-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "elevenlabsId" TEXT NOT NULL,
    "circleWalletId" TEXT NOT NULL,
    "payoutAddress" TEXT NOT NULL,
    "metaURI" TEXT NOT NULL,
    "ratePerCall" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "onchainJobId" INTEGER,
    "clientAddr" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "amountUSDC" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "circleTransferId" TEXT,
    "txHash" TEXT,
    "callId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_elevenlabsId_key" ON "Agent"("elevenlabsId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_circleWalletId_key" ON "Agent"("circleWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_payoutAddress_key" ON "Agent"("payoutAddress");
