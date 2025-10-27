/**
 * Property Deep Dive Dashboard - Level 3
 * Shows all reviews for a single property with approval management
 * Following Next.js best practices: Server Component + Server Actions
 */

import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Star,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';
import { ApprovalToggle } from '@/components/client/ApprovalToggle';
import { format } from 'date-fns';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyDeepDivePage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch property with all reviews
  const property = await db.property.findUnique({
    where: { slug },
    include: {
      reviews: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!property) {
    notFound();
  }

  // Separate reviews by direction
  const guestToHostReviews = property.reviews.filter(
    (r) => r.direction === 'guest-to-host'
  );
  const hostToGuestReviews = property.reviews.filter(
    (r) => r.direction === 'host-to-guest'
  );

  // Calculate metrics
  const guestToHostAvg =
    guestToHostReviews.length > 0
      ? guestToHostReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        guestToHostReviews.length
      : 0;

  const hostToGuestAvg =
    hostToGuestReviews.length > 0
      ? hostToGuestReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        hostToGuestReviews.length
      : 0;

  const approvedCount = guestToHostReviews.filter((r) => r.isPublished).length;
  const approvalRate =
    guestToHostReviews.length > 0
      ? (approvedCount / guestToHostReviews.length) * 100
      : 0;

  // Calculate trend (last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentReviews = guestToHostReviews.filter((r) => r.date >= thirtyDaysAgo);
  const previousReviews = guestToHostReviews.filter(
    (r) => r.date >= sixtyDaysAgo && r.date < thirtyDaysAgo
  );

  const recentAvg =
    recentReviews.length > 0
      ? recentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        recentReviews.length
      : guestToHostAvg;

  const previousAvg =
    previousReviews.length > 0
      ? previousReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        previousReviews.length
      : guestToHostAvg;

  const trend = recentAvg - previousAvg;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/dashboard/city/${property.city?.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to {property.city}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <p className="text-gray-600 mt-1">{property.address}</p>
            </div>
            <Link
              href={`/property/${property.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Public Page
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Guest Rating
              </h3>
              <Star className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {guestToHostAvg.toFixed(1)}
              </p>
              {trend !== 0 && (
                <div
                  className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {trend > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(trend).toFixed(1)}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {guestToHostReviews.length} reviews
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Guest Quality
              </h3>
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {hostToGuestAvg > 0 ? hostToGuestAvg.toFixed(1) : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {hostToGuestReviews.length} guest ratings
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Approved
              </h3>
              <Star className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{approvedCount}</p>
            <p className="text-sm text-gray-500 mt-1">Published to website</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Approval Rate
              </h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {approvalRate.toFixed(0)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {guestToHostReviews.length} total
            </p>
          </div>
        </div>

        {/* Guest-to-Host Reviews (Property Reviews) */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Guest Reviews ({guestToHostReviews.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Reviews from guests about this property - manage approval for website
            </p>
          </div>

          {guestToHostReviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No guest reviews yet for this property
            </p>
          ) : (
            <div className="space-y-4">
              {guestToHostReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {review.guestName || 'Anonymous'}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-600">
                          {format(new Date(review.date), 'MMM dd, yyyy')}
                        </p>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {review.channel || 'Direct'}
                        </span>
                      </div>
                      {review.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <ApprovalToggle
                      reviewId={review.id}
                      initialState={review.isPublished}
                    />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Host-to-Guest Reviews (Guest Quality) */}
        {hostToGuestReviews.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Guest Ratings ({hostToGuestReviews.length})
              </h2>
              <p className="text-gray-600 mt-1">
                Your ratings of guests who stayed at this property
              </p>
            </div>

            <div className="space-y-4">
              {hostToGuestReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {review.guestName || 'Anonymous'}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-600">
                          {format(new Date(review.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {review.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
