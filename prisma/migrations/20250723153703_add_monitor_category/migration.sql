-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Monitor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Uncategorized',
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "port" INTEGER,
    "interval" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastCheckedAt" DATETIME
);
INSERT INTO "new_Monitor" ("createdAt", "id", "interval", "lastCheckedAt", "name", "port", "status", "target", "type", "updatedAt") SELECT "createdAt", "id", "interval", "lastCheckedAt", "name", "port", "status", "target", "type", "updatedAt" FROM "Monitor";
DROP TABLE "Monitor";
ALTER TABLE "new_Monitor" RENAME TO "Monitor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
