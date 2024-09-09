-- CreateTable
CREATE TABLE "ArticleView" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,

    CONSTRAINT "ArticleView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirdropView" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "airdropId" INTEGER NOT NULL,

    CONSTRAINT "AirdropView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleView_userId_articleId_key" ON "ArticleView"("userId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "AirdropView_userId_airdropId_key" ON "AirdropView"("userId", "airdropId");

-- AddForeignKey
ALTER TABLE "ArticleView" ADD CONSTRAINT "ArticleView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleView" ADD CONSTRAINT "ArticleView_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirdropView" ADD CONSTRAINT "AirdropView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirdropView" ADD CONSTRAINT "AirdropView_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "Airdrop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
