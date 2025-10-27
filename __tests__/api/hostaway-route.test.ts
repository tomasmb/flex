/**
 * API Route Tests
 * Tests the required /api/reviews/hostaway endpoint
 * Based on nextjs-best-practices@1.0.0#testing.api-tests.v1
 */

import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/reviews/hostaway/route';

describe('/api/reviews/hostaway', () => {
  it('returns 200 status', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('returns array of normalized reviews', async () => {
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each review has required fields', async () => {
    const response = await GET();
    const data = await response.json();

    const firstReview = data[0];

    // Check all required fields exist
    expect(firstReview).toHaveProperty('id');
    expect(firstReview).toHaveProperty('source');
    expect(firstReview).toHaveProperty('listingName');
    expect(firstReview).toHaveProperty('submittedAt');
    expect(firstReview).toHaveProperty('publicReview');
    expect(firstReview).toHaveProperty('approvedForWebsite');
    expect(firstReview).toHaveProperty('categories');

    // Validate field types
    expect(typeof firstReview.id).toBe('string');
    expect(firstReview.source).toBe('hostaway');
    expect(typeof firstReview.listingName).toBe('string');
    expect(typeof firstReview.publicReview).toBe('string');
    expect(typeof firstReview.approvedForWebsite).toBe('boolean');
    expect(Array.isArray(firstReview.categories)).toBe(true);
  });

  it('categories are properly structured', async () => {
    const response = await GET();
    const data = await response.json();

    const reviewWithCategories = data.find((r: any) => r.categories.length > 0);

    if (reviewWithCategories) {
      const category = reviewWithCategories.categories[0];
      expect(category).toHaveProperty('category');
      expect(category).toHaveProperty('rating');
      expect(typeof category.category).toBe('string');
      expect(typeof category.rating).toBe('number');
    }
  });

  it('submittedAt is valid ISO 8601 date', async () => {
    const response = await GET();
    const data = await response.json();

    const firstReview = data[0];

    // Check ISO 8601 format
    expect(firstReview.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

    // Check it can be parsed as valid date
    const date = new Date(firstReview.submittedAt);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  it('approvedForWebsite defaults to false', async () => {
    const response = await GET();
    const data = await response.json();

    // All reviews from mock data should default to false
    data.forEach((review: any) => {
      expect(review.approvedForWebsite).toBe(false);
    });
  });

  it('returns correct number of reviews from mock data', async () => {
    const response = await GET();
    const data = await response.json();

    // Mock data has 44 reviews
    expect(data.length).toBe(44);
  });
});
