-- LGPD compliance: registros de consentimento, solicitações de titular e
-- consentimento de marketing em leads. Plano: docs/plans/2026-05-12-lgpd-compliance-plan.md

-- AlterTable: leads.marketingConsent (default false; rows existentes herdam false).
ALTER TABLE "leads" ADD COLUMN "marketingConsent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: consent_logs
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL,
    "userIdHash" TEXT,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "categories" JSONB NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "consent_logs_createdAt_idx" ON "consent_logs"("createdAt");
CREATE INDEX "consent_logs_userIdHash_idx" ON "consent_logs"("userIdHash");

-- CreateTable: data_subject_requests
CREATE TABLE "data_subject_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "requestType" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_verification',
    "verificationToken" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_subject_requests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "data_subject_requests_verificationToken_key" ON "data_subject_requests"("verificationToken");
CREATE INDEX "data_subject_requests_email_idx" ON "data_subject_requests"("email");
CREATE INDEX "data_subject_requests_status_idx" ON "data_subject_requests"("status");
CREATE INDEX "data_subject_requests_createdAt_idx" ON "data_subject_requests"("createdAt");
