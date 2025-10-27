/**
 * KPI Section Component (Server Component)
 * Displays key performance indicators
 * Based on dashboard-metrics@2.0.0#kpis.v1
 */

import { TrendingUp, TrendingDown, Star, CheckCircle2, Clock } from 'lucide-react';

interface Review {
  id: string;
  overallRating: number | null;
  approvedForWebsite: boolean;
  submittedAt: Date;
  categories: string;
}

interface KPISectionProps {
  reviews: Review[];
}

function calculateAverageRating(reviews: Review[]): number {
  const ratingsWithValue = reviews.filter((r) => r.overallRating !== null);
  if (ratingsWithValue.length === 0) return 0;

  const sum = ratingsWithValue.reduce((acc, r) => acc + (r.overallRating || 0), 0);
  return Math.round((sum / ratingsWithValue.length) * 10) / 10;
}

function getRatingTrend(reviews: Review[]): { trend: 'up' | 'down' | 'stable'; delta: number } {
  // Compare last 30 days vs previous 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recent = reviews.filter((r) => r.submittedAt >= thirtyDaysAgo);
  const previous = reviews.filter(
    (r) => r.submittedAt >= sixtyDaysAgo && r.submittedAt < thirtyDaysAgo
  );

  const recentAvg = calculateAverageRating(recent);
  const previousAvg = calculateAverageRating(previous);

  const delta = Math.round((recentAvg - previousAvg) * 10) / 10;

  if (delta > 0.1) return { trend: 'up', delta };
  if (delta < -0.1) return { trend: 'down', delta };
  return { trend: 'stable', delta };
}

export function KPISection({ reviews }: KPISectionProps) {
  const avgRating = calculateAverageRating(reviews);
  const approvedCount = reviews.filter((r) => r.approvedForWebsite).length;
  const pendingCount = reviews.length - approvedCount;
  const ratingTrend = getRatingTrend(reviews);

  // Calculate category averages
  const categoryScores = new Map<string, number[]>();
  reviews.forEach((review) => {
    try {
      const categories = JSON.parse(review.categories);
      categories.forEach((cat: { category: string; rating: number }) => {
        const existing = categoryScores.get(cat.category) || [];
        categoryScores.set(cat.category, [...existing, cat.rating]);
      });
    } catch {
      // Skip invalid JSON
    }
  });

  const avgCategoryScores = Array.from(categoryScores.entries())
    .map(([category, ratings]) => ({
      category,
      avg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
    }))
    .sort((a, b) => b.avg - a.avg);

  const lowestCategory = avgCategoryScores[avgCategoryScores.length - 1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Average Rating */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
            Average Rating
          </h3>
          {ratingTrend.trend === 'up' ? (
            <TrendingUp className="w-5 h-5 text-success" />
          ) : ratingTrend.trend === 'down' ? (
            <TrendingDown className="w-5 h-5 text-red-500" />
          ) : (
            <Star className="w-5 h-5 text-yellow-400" />
          )}
        </div>
        <p className="text-4xl font-bold text-text-primary mb-1">{avgRating.toFixed(1)}</p>
        <p className="text-xs text-text-muted">
          <span
            className={
              ratingTrend.trend === 'up'
                ? 'text-success'
                : ratingTrend.trend === 'down'
                  ? 'text-red-500'
                  : 'text-text-muted'
            }
          >
            {ratingTrend.delta > 0 && '+'}
            {ratingTrend.delta.toFixed(1)}
          </span>{' '}
          vs previous period
        </p>
      </div>

      {/* Total Reviews */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
            Total Reviews
          </h3>
          <Star className="w-5 h-5 text-primary" />
        </div>
        <p className="text-4xl font-bold text-text-primary mb-1">{reviews.length}</p>
        <p className="text-xs text-text-muted">
          From {new Set(reviews.map((r) => r.id.split('-')[0])).size} properties
        </p>
      </div>

      {/* Approved Reviews */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
            Approved
          </h3>
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>
        <p className="text-4xl font-bold text-text-primary mb-1">{approvedCount}</p>
        <p className="text-xs text-text-muted">
          {Math.round((approvedCount / reviews.length) * 100)}% of total
        </p>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
            Pending Review
          </h3>
          <Clock className="w-5 h-5 text-yellow-500" />
        </div>
        <p className="text-4xl font-bold text-text-primary mb-1">{pendingCount}</p>
        {lowestCategory && (
          <p className="text-xs text-text-muted">
            Lowest: {lowestCategory.category} ({lowestCategory.avg.toFixed(1)})
          </p>
        )}
      </div>
    </div>
  );
}
