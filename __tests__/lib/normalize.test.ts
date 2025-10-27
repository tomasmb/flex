/**
 * Normalization Logic Tests
 * Tests edge cases for Hostaway review normalization
 * Based on nextjs-best-practices@1.0.0#testing.normalization-tests.v1
 */

import { describe, it, expect } from 'vitest';
import { normalizeHostawayReview } from '@/lib/normalize';
import type { RawHostawayReview } from '@/lib/schemas';

describe('normalizeHostawayReview', () => {
  it('handles missing guest name gracefully', () => {
    const raw: RawHostawayReview = {
      id: 123,
      type: 'guest-to-host',
      status: 'published',
      rating: null,
      publicReview: 'Anonymous review',
      reviewCategory: [],
      submittedAt: '2020-01-01 00:00:00',
      listingName: 'Test Property',
      // guestName is missing
    };

    const normalized = normalizeHostawayReview(raw);

    expect(normalized.guestName).toBe('Anonymous');
  });

  it('handles null ratings by calculating from categories', () => {
    const raw: RawHostawayReview = {
      id: 456,
      type: 'guest-to-host',
      status: 'published',
      rating: null, // No overall rating
      publicReview: 'No rating provided',
      reviewCategory: [
        { category: 'cleanliness', rating: 8 },
        { category: 'communication', rating: 10 },
      ],
      submittedAt: '2020-01-01 00:00:00',
      guestName: 'Jane Doe',
      listingName: 'Test Property',
    };

    const normalized = normalizeHostawayReview(raw);

    // Should calculate from categories and convert to 5-point scale:
    // (8 + 10) / 2 = 9 (10-point) → 9 / 2 = 4.5 (5-point)
    expect(normalized.overallRating).toBe(4.5);
  });

  it('converts date format to ISO 8601', () => {
    const raw: RawHostawayReview = {
      id: 789,
      type: 'guest-to-host',
      status: 'published',
      rating: 5,
      publicReview: 'Test review',
      reviewCategory: [{ category: 'cleanliness', rating: 10 }],
      submittedAt: '2020-08-21 22:45:14', // Hostaway format
      guestName: 'John Smith',
      listingName: 'Test Property',
    };

    const normalized = normalizeHostawayReview(raw);

    // Should be ISO 8601 format
    expect(normalized.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(normalized.submittedAt).toContain('2020-08-21');
  });

  it('sets source to hostaway', () => {
    const raw: RawHostawayReview = {
      id: 999,
      type: 'guest-to-host',
      status: 'published',
      rating: 4,
      publicReview: 'Test',
      reviewCategory: [],
      submittedAt: '2020-01-01 00:00:00',
      guestName: 'Test User',
      listingName: 'Test Property',
    };

    const normalized = normalizeHostawayReview(raw);

    expect(normalized.source).toBe('hostaway');
  });

  it('defaults approvedForWebsite to false', () => {
    const raw: RawHostawayReview = {
      id: 111,
      type: 'guest-to-host',
      status: 'published',
      rating: 5,
      publicReview: 'Test',
      reviewCategory: [],
      submittedAt: '2020-01-01 00:00:00',
      guestName: 'Test User',
      listingName: 'Test Property',
    };

    const normalized = normalizeHostawayReview(raw);

    expect(normalized.approvedForWebsite).toBe(false);
  });

  it('preserves all category ratings', () => {
    const raw: RawHostawayReview = {
      id: 222,
      type: 'guest-to-host',
      status: 'published',
      rating: 5,
      publicReview: 'Test',
      reviewCategory: [
        { category: 'cleanliness', rating: 10 },
        { category: 'communication', rating: 9 },
        { category: 'location', rating: 8 },
      ],
      submittedAt: '2020-01-01 00:00:00',
      guestName: 'Test User',
      listingName: 'Test Property',
    };

    const normalized = normalizeHostawayReview(raw);

    expect(normalized.categories).toHaveLength(3);
    expect(normalized.categories[0].category).toBe('cleanliness');
    expect(normalized.categories[0].rating).toBe(10);
  });

  it('converts id from number to string', () => {
    const raw: RawHostawayReview = {
      id: 8000,
      type: 'guest-to-host',
      status: 'published',
      rating: 5,
      publicReview: 'Test',
      reviewCategory: [],
      submittedAt: '2020-01-01 00:00:00',
      guestName: 'Test User',
      listingName: 'Test Property',
    };

    const normalized = normalizeHostawayReview(raw);

    expect(typeof normalized.id).toBe('string');
    expect(normalized.id).toBe('8000');
  });
});
