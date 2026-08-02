-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN "familyId" TEXT;
ALTER TABLE "RefreshToken" ADD COLUMN "usedAt" TIMESTAMP(3);

-- Backfill: existing rows get their own id as familyId (they're each the head of their own chain)
UPDATE "RefreshToken" SET "familyId" = "id" WHERE "familyId" IS NULL;

-- Now enforce NOT NULL after backfill
ALTER TABLE "RefreshToken" ALTER COLUMN "familyId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "RefreshToken_familyId_idx" ON "RefreshToken"("familyId");
