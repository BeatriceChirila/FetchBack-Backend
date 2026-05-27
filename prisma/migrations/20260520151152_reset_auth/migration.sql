-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "gender" TEXT NOT NULL DEFAULT 'Unknown',
    "coatColour" TEXT NOT NULL,
    "eyeColour" TEXT NOT NULL,
    "traits" TEXT,
    "age" INTEGER,
    "microchip" TEXT NOT NULL DEFAULT 'no',
    "healthState" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Unidentified',
    "image" TEXT,
    "dateAdmitted" TEXT NOT NULL,
    "clinicId" INTEGER,
    CONSTRAINT "Pet_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pet" ("age", "breed", "clinicId", "coatColour", "dateAdmitted", "eyeColour", "gender", "healthState", "id", "image", "microchip", "species", "status", "traits") SELECT "age", "breed", "clinicId", "coatColour", "dateAdmitted", "eyeColour", "gender", "healthState", "id", "image", "microchip", "species", "status", "traits" FROM "Pet";
DROP TABLE "Pet";
ALTER TABLE "new_Pet" RENAME TO "Pet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
