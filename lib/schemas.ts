/**
 * Zod Validation Schemas
 * Runtime type validation for API boundaries
 * Based on architecture@1.0.0#core-functions.zod-schemas.v1
 */

import { z } from 'zod';

// Raw Hostaway API response schema (matches actual API structure)
export const RawHostawayReviewSchema = z.object({
  id: z.number(),
  type: z.enum(['guest-to-host', 'host-to-guest']), // Review direction
  status: z.string(), // "published"
  rating: z.number().nullable(), // Overall rating (null if not provided)
  publicReview: z.string(),
  reviewCategory: z.array(
    z.object({
      category: z.string(),
      rating: z.number(),
    })
  ),
  submittedAt: z.string(), // Format: "2020-08-21 22:45:14"
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPlatformId: z.string().optional(),
  listingName: z.string(),
  channel: z.string().optional(),
  wouldHostAgain: z.boolean().optional(), // Host-to-guest only
  incident: z.object({
    type: z.string(),
    description: z.string(),
    cost: z.number(),
    resolved: z.boolean(),
  }).optional(),
});

// Hostaway API wrapper schema
export const HostawayApiResponseSchema = z.object({
  status: z.string(),
  result: z.array(RawHostawayReviewSchema),
  incidents: z.array(z.object({
    guestPlatformId: z.string(),
    propertyName: z.string(),
    date: z.string(),
    type: z.string(),
    description: z.string(),
    cost: z.number(),
    resolved: z.boolean(),
  })).optional(),
});

// Normalized internal schema (your unified format)
export const NormalizedReviewSchema = z.object({
  id: z.string(),
  direction: z.enum(['guest-to-host', 'host-to-guest']),
  source: z.enum(['hostaway', 'google']),
  listingName: z.string(),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPlatformId: z.string().optional(),
  submittedAt: z.string().datetime(), // ISO 8601 format
  channel: z.string().optional(),
  overallRating: z.number().min(0).max(10).optional(),
  categories: z.array(
    z.object({
      category: z.string(),
      rating: z.number(),
    })
  ),
  publicReview: z.string(),
  approvedForWebsite: z.boolean(),
  wouldHostAgain: z.boolean().optional(), // Host-to-guest only
  incidentReported: z.boolean().optional(), // Host-to-guest only
});

// TypeScript types derived from schemas (single source of truth)
export type RawHostawayReview = z.infer<typeof RawHostawayReviewSchema>;
export type HostawayApiResponse = z.infer<typeof HostawayApiResponseSchema>;
export type NormalizedReview = z.infer<typeof NormalizedReviewSchema>;

// Category rating type
export type CategoryRating = {
  category: string;
  rating: number;
};

// Bidirectional metrics types (from spec)
export type ReviewDirection = 'guest-to-host' | 'host-to-guest';

export interface GuestBehaviorScores {
  cleanliness: number;
  houseRules: number;
  communication: number;
  honesty: number;
  checkoutAdherence: number;
}

export interface CategoryScores {
  cleanliness: number;
  communication: number;
  check_in: number;
  location: number;
  accuracy: number;
  value: number;
}

export interface BidirectionalMetrics {
  guestToHost: {
    averageRating: number;
    reviewCount: number;
    categoryScores: Partial<CategoryScores>;
  };
  hostToGuest: {
    averageRating: number;
    reviewCount: number;
    behaviorScores: Partial<GuestBehaviorScores>;
  };
  correlation: {
    score: number; // -1 to 1
    insight: string;
  };
}

export type PropertyHealthQuadrant =
  | 'well-managed'
  | 'screening-issue'
  | 'property-issue'
  | 'systemic-failure'
  | 'needs-improvement';

export interface MetricSeverity {
  level: number; // 0=excellent, 1=warning, 2=critical
  color: string; // 'green', 'yellow', 'orange', 'red'
  label: string; // Human-readable status
  description: string; // Full explanation for tooltips
}

export interface PropertyHealth {
  quadrant: PropertyHealthQuadrant;
  guestToHostRating: number;
  hostToGuestRating: number;
  recommendation: string;
  propertySeverity?: MetricSeverity; // Independent property evaluation
  guestSeverity?: MetricSeverity;    // Independent guest evaluation
  worstCase?: MetricSeverity;        // Worst of the two (for card color)
}
