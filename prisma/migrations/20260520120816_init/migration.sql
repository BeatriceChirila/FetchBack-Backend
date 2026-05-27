-- CreateTable
CREATE TABLE "Clinic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "mapUrl" TEXT
);

-- CreateTable
CREATE TABLE "Pet" (
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
    "clinicId" INTEGER NOT NULL,
    CONSTRAINT "Pet_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
