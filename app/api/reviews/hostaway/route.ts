/**
 * Hostaway Reviews API Route (Required by Assessment)
 * Fetches from real Hostaway API, falls back to mock data if empty
 * Based on architecture@1.0.0#api-contracts.hostaway.v1
 */

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { normalizeHostawayReviews } from '@/lib/normalize';
import { NormalizedReviewSchema, HostawayApiResponseSchema } from '@/lib/schemas';

/**
 * GET /api/reviews/hostaway
 * 1. Attempts to fetch from real Hostaway API
 * 2. Falls back to mock data if API returns no reviews (sandboxed)
 * 3. Returns normalized review data in assessment-required format
 */
export async function GET() {
  try {
    let rawData;
    let dataSource = 'hostaway-api';

    // Try to fetch from real Hostaway API first
    const apiKey = process.env.HOSTAWAY_API_KEY;
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;

    if (apiKey && accountId) {
      try {
        console.log('Attempting to fetch from Hostaway API...');

        const response = await fetch('https://api.hostaway.com/v1/reviews', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {
          const apiData = await response.json();

          // Check if API returned any reviews
          if (apiData.result && apiData.result.length > 0) {
            console.log(`✅ Hostaway API returned ${apiData.result.length} reviews`);
            rawData = apiData;
            dataSource = 'hostaway-api-live';
          } else {
            console.log('⚠️ Hostaway API returned no reviews (sandboxed), falling back to mock data');
            // Fall through to mock data
          }
        } else {
          console.log(`⚠️ Hostaway API returned ${response.status}, falling back to mock data`);
          // Fall through to mock data
        }
      } catch (apiError) {
        console.error('Hostaway API error:', apiError);
        console.log('⚠️ Falling back to mock data');
        // Fall through to mock data
      }
    }

    // If no data from API, use mock data
    if (!rawData) {
      console.log('📄 Using mock data from mock-data.json');
      const mockDataPath = join(process.cwd(), 'mock-data.json');
      const mockDataRaw = readFileSync(mockDataPath, 'utf-8');
      rawData = JSON.parse(mockDataRaw);
      dataSource = 'hostaway-mock';
    }

    // Validate input with Zod
    const validatedInput = HostawayApiResponseSchema.parse(rawData);

    // Normalize each review
    const normalized = normalizeHostawayReviews(validatedInput.result);

    // Validate output with Zod
    const validated = NormalizedReviewSchema.array().parse(normalized);

    // Return normalized array with metadata header
    return NextResponse.json(validated, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Data-Source': dataSource,
        'X-Review-Count': validated.length.toString(),
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

// Health check metadata
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-API-Version': '1.0.0',
      'X-Integration': 'hostaway-with-fallback',
    },
  });
}
