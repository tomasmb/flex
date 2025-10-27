/**
 * Manager Dashboard Page
 * Server Component with direct database access
 * Based on architecture@1.0.0#frontend-composition.dashboard.v1
 * Updated with bidirectional analytics per dashboard-metrics@2.0.0
 */

import { db } from '@/lib/db';
import { KPISection } from '@/components/server/KPISection';
import { BidirectionalKPIs } from '@/components/server/BidirectionalKPIs';
import { ReviewTable } from '@/components/client/ReviewTable';
import { FiltersBar } from '@/components/client/FiltersBar';
import { AIInsightsPanel } from '@/components/server/AIInsightsPanel';
import { PropertyHealthWidget } from '@/components/client/PropertyHealthWidget';
import { RatingCharts } from '@/components/client/RatingChartsReviews';
import {
  calculateBidirectionalMetrics,
  calculatePropertyHealthQuadrants,
  calculateTimeSeriesData,
  calculateDistribution,
} from '@/lib/dashboard-analytics';
import Link from 'next/link';

interface SearchParams {
  rating?: string;
  property?: string;
  approved?: string;
  search?: string;
  direction?: string;
  channel?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Build where clause from filters (including NEW bidirectional filters)
  const where: any = {};

  if (params.rating) {
    where.rating = { gte: parseFloat(params.rating) };
  }

  if (params.property && params.property !== 'all') {
    where.property = { name: params.property };
  }

  if (params.approved === 'approved') {
    where.isPublished = true;
  } else if (params.approved === 'unapproved') {
    where.isPublished = false;
  }

  // NEW: Direction filter (CRITICAL for bidirectional analytics)
  if (params.direction && params.direction !== 'all') {
    where.direction = params.direction;
  }

  // NEW: Channel filter (CRITICAL for assessment)
  if (params.channel && params.channel !== 'all') {
    where.channel = params.channel;
  }

  // NEW: Date range filters (CRITICAL for assessment)
  if (params.dateFrom || params.dateTo) {
    where.date = {};
    if (params.dateFrom) {
      where.date.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      where.date.lte = new Date(params.dateTo);
    }
  }

  if (params.search) {
    where.OR = [
      { text: { contains: params.search } },
      { guestName: { contains: params.search } },
      { listingName: { contains: params.search } },
    ];
  }

  // Fetch reviews with filters
  const reviews = await db.review.findMany({
    where,
    include: { property: true },
    orderBy: { date: 'desc' },
  });

  // Fetch ALL properties with reviews for health quadrant calculation
  const allProperties = await db.property.findMany({
    include: {
      reviews: true,
    },
  });

  // Fetch property names for filter dropdown
  const properties = await db.property.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  });

  // Calculate bidirectional metrics
  const bidirectionalMetrics = calculateBidirectionalMetrics(reviews);

  // Calculate property health quadrants
  const healthQuadrants = calculatePropertyHealthQuadrants(allProperties);

  // Calculate time-series data (last 6 months)
  const timeSeriesData = calculateTimeSeriesData(reviews, 6);

  // Calculate rating distribution
  const distributionData = calculateDistribution(reviews);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-border-gray">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Reviews Dashboard</h1>
              <p className="text-text-muted mt-1">
                Manage property reviews and analytics
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                href="/api/reviews/hostaway"
                target="_blank"
                className="px-4 py-2 bg-primary-light text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                View API
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Property Health Widget (NEW - Top Priority) */}
        <PropertyHealthWidget quadrants={healthQuadrants} />

        {/* Bidirectional KPIs (NEW - CRITICAL) */}
        <BidirectionalKPIs metrics={bidirectionalMetrics} />

        {/* Charts Section (NEW - Visualizations) */}
        <RatingCharts timeSeriesData={timeSeriesData} distributionData={distributionData} />

        {/* Legacy KPI Section (Keep for backward compatibility) */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Stats</h2>
          <KPISection reviews={reviews} />
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel reviews={reviews} />

        {/* Filters */}
        <FiltersBar properties={properties.map((p) => p.name)} />

        {/* Reviews Table */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              All Reviews ({reviews.length})
            </h2>
            <p className="text-sm text-text-muted">
              {reviews.filter((r) => r.approvedForWebsite).length} approved
            </p>
          </div>
          <ReviewTable reviews={reviews} />
        </div>
      </main>
    </div>
  );
}
