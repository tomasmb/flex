/**
 * Bidirectional KPIs Component (Server Component)
 * Displays separate metrics for guest-to-host AND host-to-guest reviews
 * Based on dashboard-metrics@2.0.0#kpis.v1 and #kpis.host-to-guest.v1
 */

import { TrendingUp, TrendingDown, Minus, Star, Users, AlertTriangle } from 'lucide-react';

interface BidirectionalMetrics {
  guestToHost: {
    averageRating: number;
    reviewCount: number;
    approvedCount: number;
    trend: { trend: 'up' | 'down' | 'stable'; delta: number };
  };
  hostToGuest: {
    averageRating: number;
    reviewCount: number;
    highRiskRate: number;
    trend: { trend: 'up' | 'down' | 'stable'; delta: number };
  };
}

interface BidirectionalKPIsProps {
  metrics: BidirectionalMetrics;
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up')
    return <TrendingUp className="w-5 h-5 text-success" aria-label="Trending up" />;
  if (trend === 'down')
    return <TrendingDown className="w-5 h-5 text-red-500" aria-label="Trending down" />;
  return <Minus className="w-5 h-5 text-text-muted" aria-label="Stable" />;
}

export function BidirectionalKPIs({ metrics }: BidirectionalKPIsProps) {
  const { guestToHost, hostToGuest } = metrics;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Bidirectional Analytics</h2>
        <p className="text-text-muted">
          Track both property performance (guest ratings) and guest quality (host ratings)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guest-to-Host KPIs (Property Performance) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6 text-[#284E4C]" />
            <h3 className="text-xl font-semibold text-[#284E4C]">
              Guest-to-Host Reviews
            </h3>
          </div>
          <p className="text-sm text-text-muted mb-4">
            How guests rate your properties (property quality, amenities, service)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Average Property Rating */}
            <div className="bg-white rounded-2xl p-6 shadow-card border-2 border-[#284E4C]/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-text-muted uppercase tracking-wide">
                  Property Rating
                </h4>
                <TrendIcon trend={guestToHost.trend.trend} />
              </div>
              <p className="text-4xl font-bold text-[#284E4C] mb-1">
                {guestToHost.averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-text-muted">
                <span
                  className={
                    guestToHost.trend.trend === 'up'
                      ? 'text-success'
                      : guestToHost.trend.trend === 'down'
                        ? 'text-red-500'
                        : 'text-text-muted'
                  }
                >
                  {guestToHost.trend.delta > 0 && '+'}
                  {guestToHost.trend.delta.toFixed(1)}
                </span>{' '}
                vs last 30 days
              </p>
            </div>

            {/* Review Count */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-text-muted uppercase tracking-wide">
                  Total Reviews
                </h4>
                <Star className="w-5 h-5 text-[#284E4C]" />
              </div>
              <p className="text-4xl font-bold text-text-primary mb-1">
                {guestToHost.reviewCount}
              </p>
              <p className="text-xs text-text-muted">
                {guestToHost.approvedCount} approved for website
              </p>
            </div>
          </div>
        </div>

        {/* Host-to-Guest KPIs (Guest Quality) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-[#D97706]" />
            <h3 className="text-xl font-semibold text-[#D97706]">
              Host-to-Guest Reviews
            </h3>
          </div>
          <p className="text-sm text-text-muted mb-4">
            How you rate guests (behavior, cleanliness, house rules compliance)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Average Guest Rating */}
            <div className="bg-white rounded-2xl p-6 shadow-card border-2 border-[#D97706]/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-text-muted uppercase tracking-wide">
                  Guest Quality
                </h4>
                <TrendIcon trend={hostToGuest.trend.trend} />
              </div>
              <p className="text-4xl font-bold text-[#D97706] mb-1">
                {hostToGuest.averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-text-muted">
                <span
                  className={
                    hostToGuest.trend.trend === 'up'
                      ? 'text-success'
                      : hostToGuest.trend.trend === 'down'
                        ? 'text-red-500'
                        : 'text-text-muted'
                  }
                >
                  {hostToGuest.trend.delta > 0 && '+'}
                  {hostToGuest.trend.delta.toFixed(1)}
                </span>{' '}
                vs last 30 days
              </p>
            </div>

            {/* High Risk Rate */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-text-muted uppercase tracking-wide">
                  High Risk Guests
                </h4>
                <AlertTriangle
                  className={`w-5 h-5 ${hostToGuest.highRiskRate > 20 ? 'text-red-500' : 'text-yellow-500'}`}
                />
              </div>
              <p className="text-4xl font-bold text-text-primary mb-1">
                {hostToGuest.highRiskRate}%
              </p>
              <p className="text-xs text-text-muted">
                {hostToGuest.reviewCount} total guest reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Insight */}
      <div className="bg-gradient-to-r from-[#284E4C]/5 to-[#D97706]/5 rounded-2xl p-6 border border-border-subtle">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Correlation Insight</h4>
            <p className="text-sm text-text-secondary">
              {guestToHost.averageRating >= 4.5 && hostToGuest.averageRating >= 4.5
                ? '✅ Well-managed: Both property quality and guest quality are excellent. Maintain current standards!'
                : guestToHost.averageRating >= 4.5 && hostToGuest.averageRating < 4.0
                  ? '⚠️ Screening Issue: Property quality is high but guest quality is low. Review your booking acceptance criteria.'
                  : guestToHost.averageRating < 4.0 && hostToGuest.averageRating >= 4.5
                    ? '⚠️ Property Issue: Guest quality is high but property ratings are low. Focus on property improvements and service quality.'
                    : '🚨 Systemic Failure: Both metrics need attention. Urgent intervention required for property AND guest screening.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
