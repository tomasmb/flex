/**
 * Database Seed Script
 * Populates database with mock Hostaway review data
 * Supports bidirectional reviews (guest-to-host and host-to-guest)
 * Based on infrastructure@1.0.0#local-setup.v1
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { normalizeHostawayReview } from '../lib/normalize';
import { HostawayApiResponseSchema } from '../lib/schemas';
import { findOrCreateProperty } from '../lib/property';
import { calculateGuestRiskScore } from '../lib/correlation';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Read mock data
  const mockDataPath = join(process.cwd(), 'mock-data.json');
  const mockDataRaw = readFileSync(mockDataPath, 'utf-8');
  const mockData = JSON.parse(mockDataRaw);

  // Validate with Zod
  const validatedData = HostawayApiResponseSchema.parse(mockData);
  console.log(`✅ Validated ${validatedData.result.length} reviews from mock data`);

  // Normalize reviews
  const normalizedReviews = validatedData.result.map(normalizeHostawayReview);
  console.log(`✅ Normalized ${normalizedReviews.length} reviews`);

  // Step 1: Create Guest records
  console.log('\n👥 Creating guests...');
  const guestMap = new Map<string, string>(); // platformId -> guestId

  for (const review of normalizedReviews) {
    if (review.guestPlatformId && !guestMap.has(review.guestPlatformId)) {
      const platform = review.guestPlatformId.split('_')[0]; // Extract platform from ID

      const guest = await prisma.guest.create({
        data: {
          name: review.guestName || 'Anonymous',
          email: review.guestEmail,
          platformId: review.guestPlatformId,
          platform,
        },
      });

      guestMap.set(review.guestPlatformId, guest.id);
      console.log(`  ✅ Created guest: ${guest.name} (${guest.platformId})`);
    }
  }

  console.log(`\n✅ Created ${guestMap.size} unique guests`);

  // Step 2: Create Incidents
  console.log('\n⚠️  Creating incidents...');
  let incidentCount = 0;

  if (validatedData.incidents) {
    for (const incident of validatedData.incidents) {
      const guestId = guestMap.get(incident.guestPlatformId);
      if (!guestId) {
        console.warn(`  ⚠️  Skipping incident: Guest not found for ${incident.guestPlatformId}`);
        continue;
      }

      // Find property by name
      const propertyId = await findOrCreateProperty(incident.propertyName);

      await prisma.incident.create({
        data: {
          guestId,
          propertyId,
          date: new Date(incident.date),
          type: incident.type,
          description: incident.description,
          cost: incident.cost,
          resolved: incident.resolved,
        },
      });

      incidentCount++;
      console.log(`  ✅ Created incident: ${incident.type} for ${incident.propertyName}`);
    }
  }

  console.log(`\n✅ Created ${incidentCount} incidents`);

  // Step 3: Create Properties and Reviews
  console.log('\n🏠 Creating properties and reviews...');

  const reviewsByProperty = new Map<string, typeof normalizedReviews>();
  normalizedReviews.forEach((review) => {
    const existing = reviewsByProperty.get(review.listingName) || [];
    reviewsByProperty.set(review.listingName, [...existing, review]);
  });

  console.log(`✅ Found ${reviewsByProperty.size} unique properties`);

  let totalCreated = 0;
  for (const [listingName, reviews] of reviewsByProperty.entries()) {
    console.log(`\n📍 Processing property: ${listingName}`);

    // Find or create property
    const propertyId = await findOrCreateProperty(listingName);

    // Create reviews for this property
    for (const review of reviews) {
      const guestId = review.guestPlatformId ? guestMap.get(review.guestPlatformId) : undefined;

      await prisma.review.create({
        data: {
          id: review.id,
          direction: review.direction,
          propertyId,
          guestId,
          source: review.source,
          listingName: review.listingName,
          guestName: review.guestName,
          date: new Date(review.submittedAt),
          channel: review.channel,
          rating: review.overallRating,
          text: review.publicReview,
          categories: JSON.stringify(review.categories),
          isPublished: review.approvedForWebsite,
          wouldHostAgain: review.wouldHostAgain,
          incidentReported: review.incidentReported,
        },
      });
      totalCreated++;
    }

    console.log(`  ✅ Created ${reviews.length} reviews`);
  }

  console.log(`\n🎉 Seed completed! Created ${totalCreated} reviews for ${reviewsByProperty.size} properties`);

  // Step 4: Calculate and update guest risk scores
  console.log('\n🎯 Calculating guest risk scores...');

  for (const [platformId, guestId] of guestMap.entries()) {
    // Get guest reviews (host-to-guest)
    const guestReviews = await prisma.review.findMany({
      where: {
        guestId,
        direction: 'host-to-guest',
      },
    });

    // Get guest incidents
    const incidents = await prisma.incident.findMany({
      where: { guestId },
    });

    const damageIncidents = incidents.filter((i) => i.type === 'damage');
    const totalDamageCost = damageIncidents.reduce((sum, i) => sum + (i.cost || 0), 0);

    const averageRating =
      guestReviews.length > 0
        ? guestReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / guestReviews.length
        : 5.0; // Default to neutral

    const riskData = calculateGuestRiskScore({
      averageRating,
      totalStays: guestReviews.length,
      incidentCount: incidents.length,
      damageCount: damageIncidents.length,
      totalDamageCost,
    });

    await prisma.guest.update({
      where: { id: guestId },
      data: {
        averageRating,
        totalStays: guestReviews.length,
        riskScore: riskData.score,
        riskLevel: riskData.level,
      },
    });

    console.log(
      `  ✅ ${platformId}: Risk ${riskData.level.toUpperCase()} (score: ${riskData.score}, avg rating: ${averageRating.toFixed(1)})`
    );
  }

  // Show summary stats
  console.log('\n📊 Summary Statistics:');

  const reviewStats = await prisma.review.groupBy({
    by: ['direction'],
    _count: true,
  });

  console.log('\nReviews by direction:');
  reviewStats.forEach((stat) => {
    console.log(`  - ${stat.direction}: ${stat._count} reviews`);
  });

  const channelStats = await prisma.review.groupBy({
    by: ['channel'],
    _count: true,
  });

  console.log('\nReviews by channel:');
  channelStats.forEach((stat) => {
    console.log(`  - ${stat.channel || 'unknown'}: ${stat._count} reviews`);
  });

  const riskStats = await prisma.guest.groupBy({
    by: ['riskLevel'],
    _count: true,
  });

  console.log('\nGuests by risk level:');
  riskStats.forEach((stat) => {
    console.log(`  - ${stat.riskLevel || 'unknown'}: ${stat._count} guests`);
  });

  console.log('\n✨ Seed complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
