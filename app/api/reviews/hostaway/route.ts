/**
 * Hostaway Reviews API Route (Required by Assessment)
 * Fetches, normalizes, and returns Hostaway review data
 * Based on architecture@1.0.0#api-contracts.hostaway.v1
 */

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { normalizeHostawayReviews } from '@/lib/normalize';
import { NormalizedReviewSchema, HostawayApiResponseSchema } from '@/lib/schemas';

/**
 * GET /api/reviews/hostaway
 * Returns normalized review data in assessment-required format
 */
export async function GET() {
  try {
    // In production, this would fetch from Hostaway API:
    // const response = await fetch('https://api.hostaway.com/reviews', {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.HOSTAWAY_API_KEY}`,
    //     'X-Account-Id': process.env.HOSTAWAY_ACCOUNT_ID,
    //   },
    // });
    // const data = await response.json();

    // For assessment, use mock data
    const mockDataPath = join(process.cwd(), 'mock-data.json');
    const mockDataRaw = readFileSync(mockDataPath, 'utf-8');
    const mockData = JSON.parse(mockDataRaw);

    // Validate input with Zod
    const validatedInput = HostawayApiResponseSchema.parse(mockData);

    // Normalize each review
    const normalized = normalizeHostawayReviews(validatedInput.result);

    // Validate output with Zod
    const validated = NormalizedReviewSchema.array().parse(normalized);

    // Return normalized array (no wrapper, as per spec)
    return NextResponse.json(validated, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Normalization error:', error);

    // Return proper error response
    return NextResponse.json(
      {
        error: 'Failed to normalize reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Optional: Health check metadata
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-API-Version': '1.0.0',
      'X-Data-Source': 'hostaway-mock',
    },
  });
}
