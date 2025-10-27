/**
 * Google Reviews API Route
 * Fetches reviews from Google Places API and normalizes them
 * Based on google-reviews-findings.md implementation plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { normalizeGoogleReviews } from '@/lib/normalize-google';

/**
 * GET /api/reviews/google?placeId={PLACE_ID}
 * Fetches and normalizes Google reviews for a specific place
 */
export async function GET(request: NextRequest) {
  try {
    const placeId = request.nextUrl.searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    // Fetch place details with reviews from Google Places API
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'name,rating,reviews,user_ratings_total');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.status !== 'OK') {
      return NextResponse.json(
        {
          error: 'Google Places API error',
          status: data.status,
          message: data.error_message || 'Unknown error'
        },
        { status: 400 }
      );
    }

    // Normalize reviews to our standard format
    const normalized = normalizeGoogleReviews(
      data.result.reviews || [],
      data.result.name,
      placeId
    );

    return NextResponse.json({
      success: true,
      placeId,
      placeName: data.result.name,
      totalRating: data.result.rating,
      totalReviewCount: data.result.user_ratings_total,
      reviewsReturned: normalized.length,
      reviews: normalized,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Google Reviews API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch Google reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-API-Version': '1.0.0',
      'X-Data-Source': 'google-places',
    },
  });
}
