-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Version" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "versionNo" INTEGER NOT NULL,
    "prompt" TEXT,
    "planJson" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Version_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromptRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "versionId" INTEGER,
    "intent" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "provider" TEXT,
    "model" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromptRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromptRun_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Version_projectId_idx" ON "Version"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Version_projectId_versionNo_key" ON "Version"("projectId", "versionNo");

-- CreateIndex
CREATE INDEX "PromptRun_projectId_idx" ON "PromptRun"("projectId");

-- CreateIndex
CREATE INDEX "PromptRun_versionId_idx" ON "PromptRun"("versionId");
