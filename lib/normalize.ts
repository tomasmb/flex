/**
 * Review Normalization Logic
 * Converts raw Hostaway review data into unified internal format
 * Based on architecture@1.0.0#core-functions.normalize.v1
 */

import type { NormalizedReview, RawHostawayReview, CategoryRating } from './schemas';

/**
 * Calculate average rating from category breakdowns
 */
function calculateAverageFromCategories(categories: CategoryRating[]): number {
  if (categories.length === 0) return 0;
  const sum = categories.reduce((acc, c) => acc + c.rating, 0);
  return Math.round((sum / categories.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Convert Hostaway date format to ISO 8601
 * Input: "2020-08-21 22:45:14"
 * Output: "2020-08-21T22:45:14Z"
 */
function normalizeDate(dateString: string): string {
  try {
    const date = new Date(dateString.replace(' ', 'T') + 'Z');
    return date.toISOString();
  } catch {
    // Fallback to current date if parsing fails
    return new Date().toISOString();
  }
}

/**
 * Main normalization function
 * Handles edge cases: null ratings, missing guest names, malformed dates
 * Supports bidirectional reviews (guest-to-host and host-to-guest)
 */
export function normalizeHostawayReview(raw: RawHostawayReview): NormalizedReview {
  // Calculate overall rating from categories if not provided
  const overallRating = raw.rating ?? calculateAverageFromCategories(raw.reviewCategory);

  return {
    id: raw.id.toString(), // Convert number to string
    direction: raw.type, // "guest-to-host" or "host-to-guest"
    source: 'hostaway',
    listingName: raw.listingName,
    guestName: raw.guestName || 'Anonymous', // Fallback for missing names
    guestEmail: raw.guestEmail,
    guestPlatformId: raw.guestPlatformId,
    submittedAt: normalizeDate(raw.submittedAt),
    channel: raw.channel || 'hostaway',
    overallRating,
    categories: raw.reviewCategory.map((c) => ({
      category: c.category,
      rating: c.rating,
    })),
    publicReview: raw.publicReview,
    approvedForWebsite: false, // Default to not approved
    wouldHostAgain: raw.wouldHostAgain,
    incidentReported: raw.incident !== undefined,
  };
}

/**
 * Batch normalize multiple reviews
 */
export function normalizeHostawayReviews(rawReviews: RawHostawayReview[]): NormalizedReview[] {
  return rawReviews.map(normalizeHostawayReview);
}
