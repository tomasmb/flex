-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT,
    "amenities" TEXT,
    "address" TEXT,
    "city" TEXT,
    "googlePlaceId" TEXT,
    "googleRating" DOUBLE PRECISION,
    "googleReviewCount" INTEGER,
    "minStayNights" INTEGER,
    "requireDeposit" BOOLEAN NOT NULL DEFAULT false,
    "instantBookEnabled" BOOLEAN NOT NULL DEFAULT true,
    "acceptanceRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "platformId" TEXT,
    "platform" TEXT,
    "averageRating" DOUBLE PRECISION,
    "totalStays" INTEGER NOT NULL DEFAULT 0,
    "riskScore" DOUBLE PRECISION,
    "riskLevel" TEXT,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "isWatchlisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "channel" TEXT,
    "overallRating" DOUBLE PRECISION,
    "publicReview" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "guestId" TEXT,
    "source" TEXT NOT NULL,
    "listingName" TEXT NOT NULL,
    "guestName" TEXT,
    "guestToHostSubRatings" JSONB,
    "categories" TEXT NOT NULL,
    "sentimentScore" DOUBLE PRECISION,
    "keywords" JSONB,
    "approvedForWebsite" BOOLEAN NOT NULL DEFAULT false,
    "hostToGuestBehaviorRatings" JSONB,
    "wouldHostAgain" BOOLEAN,
    "incidentReported" BOOLEAN NOT NULL DEFAULT false,
    "responseText" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_slug_idx" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_name_idx" ON "Property"("name");

-- CreateIndex
CREATE INDEX "Guest_email_idx" ON "Guest"("email");

-- CreateIndex
CREATE INDEX "Guest_platformId_idx" ON "Guest"("platformId");

-- CreateIndex
CREATE INDEX "Guest_riskLevel_idx" ON "Guest"("riskLevel");

-- CreateIndex
CREATE INDEX "Guest_isBlacklisted_idx" ON "Guest"("isBlacklisted");

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

-- CreateIndex
CREATE INDEX "Review_direction_idx" ON "Review"("direction");

-- CreateIndex
CREATE INDEX "Review_guestId_idx" ON "Review"("guestId");

-- CreateIndex
CREATE INDEX "Incident_guestId_idx" ON "Incident"("guestId");

-- CreateIndex
CREATE INDEX "Incident_propertyId_idx" ON "Incident"("propertyId");

-- CreateIndex
CREATE INDEX "Incident_type_idx" ON "Incident"("type");

-- CreateIndex
CREATE INDEX "Incident_resolved_idx" ON "Incident"("resolved");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
