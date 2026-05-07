-- CreateTable
CREATE TABLE "integration_secrets" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ciphertext" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "authTag" BYTEA NOT NULL,
    "isSensitive" BOOLEAN NOT NULL DEFAULT true,
    "lastFour" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_secrets_provider_idx" ON "integration_secrets"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "integration_secrets_provider_key_key" ON "integration_secrets"("provider", "key");
