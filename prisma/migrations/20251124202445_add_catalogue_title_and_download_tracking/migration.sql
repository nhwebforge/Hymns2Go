-- AlterTable
ALTER TABLE "Hymn" ADD COLUMN     "arranger" TEXT,
ADD COLUMN     "catalogueTitle" TEXT,
ADD COLUMN     "composer" TEXT,
ADD COLUMN     "copyright" TEXT,
ADD COLUMN     "hymnalCode" TEXT,
ADD COLUMN     "hymnalNumber" TEXT,
ADD COLUMN     "latinTitle" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "powerPointDownloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "proPresenter6Downloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "proPresenter7Downloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publicationDate" TEXT,
ADD COLUMN     "scriptureRefs" TEXT[],
ADD COLUMN     "textBySlideDownloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "textDownloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDownloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tuneKey" TEXT,
ADD COLUMN     "tuneMeter" TEXT,
ADD COLUMN     "tuneName" TEXT,
ADD COLUMN     "tuneSource" TEXT;

-- CreateIndex
CREATE INDEX "Hymn_catalogueTitle_idx" ON "Hymn"("catalogueTitle");

-- CreateIndex
CREATE INDEX "Hymn_firstLine_idx" ON "Hymn"("firstLine");

-- CreateIndex
CREATE INDEX "Hymn_hymnalCode_idx" ON "Hymn"("hymnalCode");

-- CreateIndex
CREATE INDEX "Hymn_createdAt_idx" ON "Hymn"("createdAt");

-- CreateIndex
CREATE INDEX "Hymn_updatedAt_idx" ON "Hymn"("updatedAt");

-- CreateIndex
CREATE INDEX "Hymn_totalDownloads_idx" ON "Hymn"("totalDownloads");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");
