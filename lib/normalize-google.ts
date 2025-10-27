/**
 * Google Reviews Normalization
 * Converts Google Places API review format to our standard NormalizedReview format
 * Based on google-reviews-findings.md specification
 */

import { NormalizedReview } from './schemas';

interface GoogleReview {
  author_name: string;
  rating: number; // 1-5 scale
  text: string;
  time: number; // Unix timestamp
  profile_photo_url?: string;
  relative_time_description?: string;
}

/**
 * Normalizes Google Places API reviews to our standard format
 *
 * Key transformations:
 * - Rating: 1-5 scale → 0-10 scale (multiply by 2)
 * - Date: Unix timestamp → ISO 8601
 * - Direction: Always "guest-to-host" (property reviews)
 * - Channel: Always "google"
 * - Source: Always "google"
 * - Categories: Google doesn't provide category breakdowns, use empty array
 */
export function normalizeGoogleReviews(
  reviews: GoogleReview[],
  listingName: string,
  placeId: string
): NormalizedReview[] {
  return reviews.map((review, index) => {
    // Convert Unix timestamp to ISO 8601
    const submittedAt = new Date(review.time * 1000).toISOString();

    // Convert 1-5 rating to 0-10 scale
    const overallRating = review.rating * 2;

    return {
      id: `google-${placeId}-${review.time}-${index}`,
      direction: 'guest-to-host' as const, // Google reviews are always property reviews
      source: 'google' as const,
      listingName,
      guestName: review.author_name,
      submittedAt,
      channel: 'google',
      overallRating,
      categories: [], // Google doesn't provide category breakdowns
      publicReview: review.text,
      approvedForWebsite: false, // Default to false, manager must approve
    };
  });
}
