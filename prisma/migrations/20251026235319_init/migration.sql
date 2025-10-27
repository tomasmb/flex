-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT,
    "amenities" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "listingName" TEXT NOT NULL,
    "guestName" TEXT,
    "submittedAt" DATETIME NOT NULL,
    "overallRating" REAL,
    "categories" TEXT NOT NULL,
    "publicReview" TEXT NOT NULL,
    "approvedForWebsite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_slug_idx" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_name_idx" ON "Property"("name");

-- CreateIndex
CREATE INDEX "Review_propertyId_approvedForWebsite_idx" ON "Review"("propertyId", "approvedForWebsite");

-- CreateIndex
CREATE INDEX "Review_propertyId_submittedAt_idx" ON "Review"("propertyId", "submittedAt");

-- CreateIndex
CREATE INDEX "Review_listingName_idx" ON "Review"("listingName");

-- CreateIndex
CREATE INDEX "Review_source_idx" ON "Review"("source");

-- CreateIndex
CREATE INDEX "Review_submittedAt_idx" ON "Review"("submittedAt");
