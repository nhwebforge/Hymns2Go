-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hymn" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "year" INTEGER,
    "rawText" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "isPublicDomain" BOOLEAN NOT NULL DEFAULT false,
    "publisher" TEXT,
    "ccliNumber" TEXT,
    "firstLine" TEXT,
    "meter" TEXT,
    "language" TEXT DEFAULT 'English',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hymn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HymnTag" (
    "hymnId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "HymnTag_pkey" PRIMARY KEY ("hymnId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Hymn_title_idx" ON "Hymn"("title");

-- CreateIndex
CREATE INDEX "Hymn_author_idx" ON "Hymn"("author");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");

-- CreateIndex
CREATE INDEX "HymnTag_hymnId_idx" ON "HymnTag"("hymnId");

-- CreateIndex
CREATE INDEX "HymnTag_tagId_idx" ON "HymnTag"("tagId");

-- AddForeignKey
ALTER TABLE "HymnTag" ADD CONSTRAINT "HymnTag_hymnId_fkey" FOREIGN KEY ("hymnId") REFERENCES "Hymn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HymnTag" ADD CONSTRAINT "HymnTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
