-- CreateTable
CREATE TABLE "CachedData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "fipsCode" TEXT,
    "mobility" BOOLEAN NOT NULL DEFAULT false,
    "inclusion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedData_key_key" ON "CachedData"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_state_key" ON "Location"("name", "state");
