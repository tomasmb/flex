/*
  Warnings:

  - Added the required column `direction` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "platformId" TEXT,
    "platform" TEXT,
    "averageRating" REAL,
    "totalStays" INTEGER NOT NULL DEFAULT 0,
    "riskScore" REAL,
    "riskLevel" TEXT,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "isWatchlisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" REAL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Incident_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT,
    "amenities" TEXT,
    "address" TEXT,
    "minStayNights" INTEGER,
    "requireDeposit" BOOLEAN NOT NULL DEFAULT false,
    "instantBookEnabled" BOOLEAN NOT NULL DEFAULT true,
    "acceptanceRate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Property" ("address", "amenities", "createdAt", "description", "id", "images", "name", "slug", "updatedAt") SELECT "address", "amenities", "createdAt", "description", "id", "images", "name", "slug", "updatedAt" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
CREATE INDEX "Property_slug_idx" ON "Property"("slug");
CREATE INDEX "Property_name_idx" ON "Property"("name");
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "direction" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL,
    "channel" TEXT,
    "overallRating" REAL,
    "publicReview" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "guestId" TEXT,
    "source" TEXT NOT NULL,
    "listingName" TEXT NOT NULL,
    "guestName" TEXT,
    "guestToHostSubRatings" JSONB,
    "categories" TEXT NOT NULL,
    "sentimentScore" REAL,
    "keywords" JSONB,
    "approvedForWebsite" BOOLEAN NOT NULL DEFAULT false,
    "hostToGuestBehaviorRatings" JSONB,
    "wouldHostAgain" BOOLEAN,
    "incidentReported" BOOLEAN NOT NULL DEFAULT false,
    "responseText" TEXT,
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("approvedForWebsite", "categories", "createdAt", "guestName", "id", "listingName", "overallRating", "propertyId", "publicReview", "source", "submittedAt", "updatedAt") SELECT "approvedForWebsite", "categories", "createdAt", "guestName", "id", "listingName", "overallRating", "propertyId", "publicReview", "source", "submittedAt", "updatedAt" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_propertyId_approvedForWebsite_idx" ON "Review"("propertyId", "approvedForWebsite");
CREATE INDEX "Review_propertyId_submittedAt_idx" ON "Review"("propertyId", "submittedAt");
CREATE INDEX "Review_listingName_idx" ON "Review"("listingName");
CREATE INDEX "Review_source_idx" ON "Review"("source");
CREATE INDEX "Review_submittedAt_idx" ON "Review"("submittedAt");
CREATE INDEX "Review_direction_idx" ON "Review"("direction");
CREATE INDEX "Review_guestId_idx" ON "Review"("guestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Guest_email_idx" ON "Guest"("email");

-- CreateIndex
CREATE INDEX "Guest_platformId_idx" ON "Guest"("platformId");

-- CreateIndex
CREATE INDEX "Guest_riskLevel_idx" ON "Guest"("riskLevel");

-- CreateIndex
CREATE INDEX "Guest_isBlacklisted_idx" ON "Guest"("isBlacklisted");

-- CreateIndex
CREATE INDEX "Incident_guestId_idx" ON "Incident"("guestId");

-- CreateIndex
CREATE INDEX "Incident_propertyId_idx" ON "Incident"("propertyId");

-- CreateIndex
CREATE INDEX "Incident_type_idx" ON "Incident"("type");

-- CreateIndex
CREATE INDEX "Incident_resolved_idx" ON "Incident"("resolved");
