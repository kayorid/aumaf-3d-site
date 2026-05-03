-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "botyoFailReason" TEXT,
ADD COLUMN     "botyoLeadId" TEXT,
ADD COLUMN     "botyoQueuedAt" TIMESTAMP(3),
ADD COLUMN     "botyoSentAt" TIMESTAMP(3),
ADD COLUMN     "botyoStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "landingPage" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "utmTerm" TEXT;

-- CreateTable
CREATE TABLE "botyo_webhook_deliveries" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "botyo_webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "botyo_webhook_deliveries_deliveryId_key" ON "botyo_webhook_deliveries"("deliveryId");

-- CreateIndex
CREATE INDEX "botyo_webhook_deliveries_receivedAt_idx" ON "botyo_webhook_deliveries"("receivedAt");

-- CreateIndex
CREATE INDEX "leads_botyoLeadId_idx" ON "leads"("botyoLeadId");

-- CreateIndex
CREATE INDEX "leads_botyoStatus_idx" ON "leads"("botyoStatus");
