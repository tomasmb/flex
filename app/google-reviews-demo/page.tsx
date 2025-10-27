/**
 * Google Reviews Integration Demo Page
 * Demonstrates working Google Places API integration
 * Shows real reviews from The Hoxton, Shoreditch
 */

import { Star, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function GoogleReviewsDemo() {
  let reviews = null;
  let error = null;
  let metadata = null;

  // Fetch Google reviews for The Hoxton, Shoreditch (demo property)
  const placeId = 'ChIJJ43m-K8cdkgR16GR7K-QIhQ';

  try {
    // Use absolute URL for server-side fetch in production
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/reviews/google?placeId=${placeId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    reviews = data.reviews;
    metadata = {
      placeName: data.placeName,
      totalRating: data.totalRating,
      totalReviewCount: data.totalReviewCount,
      reviewsReturned: data.reviewsReturned,
    };
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Google Reviews Integration Demo
              </h1>
              <p className="text-gray-600 mt-1">
                Live demonstration of Google Places API integration
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/api/reviews/google?placeId=ChIJJ43m-K8cdkgR16GR7K-QIhQ"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Raw API
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Status Banner */}
        {error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-1">
                  API Error
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  ✅ Google Reviews Integration Working
                </h3>
                <p className="text-green-700">
                  Successfully fetched {metadata?.reviewsReturned} reviews from Google Places API
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        {metadata && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Property Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {metadata.placeName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Google Rating</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <p className="text-lg font-semibold text-gray-900">
                    {metadata.totalRating.toFixed(1)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-lg font-semibold text-gray-900">
                  {metadata.totalReviewCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reviews Returned</p>
                <p className="text-lg font-semibold text-gray-900">
                  {metadata.reviewsReturned} <span className="text-sm text-gray-500">(API limit: 5)</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Live Google Reviews</h2>
              <p className="text-gray-600 mt-1">
                Real reviews fetched from Google Places API (normalized to our format)
              </p>
            </div>

            <div className="space-y-4">
              {reviews.map((review: any, index: number) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-gray-900">
                          {review.guestName}
                        </p>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          Google
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {new Date(review.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.overallRating / 2
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium text-gray-900 ml-1">
                          {review.overallRating}/10
                        </span>
                        <span className="text-sm text-gray-500">
                          (normalized from {review.overallRating / 2}/5)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.publicReview}</p>

                  {/* Normalization Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <strong>Source:</strong> {review.source} |
                      <strong> Channel:</strong> {review.channel} |
                      <strong> Approval Status:</strong> {review.approvedForWebsite ? 'Approved' : 'Pending'} |
                      <strong> ID:</strong> {review.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Implementation Details */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Implementation Details
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ What&apos;s Working</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Google Places API integration via <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">/api/reviews/google</code></li>
                <li>Fetching up to 5 most helpful reviews per place</li>
                <li>Rating conversion: 1-5 scale → 0-10 scale (consistent with Hostaway)</li>
                <li>Date normalization: Unix timestamp → ISO 8601</li>
                <li>Proper source/channel tagging for filtering</li>
                <li>Default <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">approvedForWebsite: false</code> (manager approval required)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📊 Property Used for Demo</h3>
              <p>
                <strong>Name:</strong> The Hoxton, Shoreditch<br />
                <strong>Place ID:</strong> <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">ChIJJ43m-K8cdkgR16GR7K-QIhQ</code><br />
                <strong>Location:</strong> London, UK
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔧 How to Use</h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Add <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">GOOGLE_PLACES_API_KEY</code> to <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">.env</code></li>
                <li>Find a property&apos;s Google Place ID (use Google Place ID Finder)</li>
                <li>Call <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">/api/reviews/google?placeId=YOUR_PLACE_ID</code></li>
                <li>Reviews are normalized and ready to display/store</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">⚠️ Limitations (as documented)</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Maximum 5 reviews per request (Google API limitation)</li>
                <li>No category breakdowns (Google doesn&apos;t provide)</li>
                <li>Rate limits apply (~$17 per 1,000 requests)</li>
                <li>Reviews must be cached to avoid excessive API calls</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
