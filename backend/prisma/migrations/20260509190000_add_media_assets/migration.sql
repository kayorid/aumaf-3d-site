-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "originalName" TEXT NOT NULL,
    "alt" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_key_key" ON "media_assets"("key");

-- CreateIndex
CREATE INDEX "media_assets_createdAt_idx" ON "media_assets"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
