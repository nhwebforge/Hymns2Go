-- AlterTable
ALTER TABLE "Hymn" ADD COLUMN     "catalogueTitleLower" TEXT;

-- CreateIndex
CREATE INDEX "Hymn_catalogueTitleLower_idx" ON "Hymn"("catalogueTitleLower");
