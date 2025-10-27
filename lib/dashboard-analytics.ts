/**
 * Dashboard Analytics Helper Library
 * Calculates bidirectional metrics, property health, time-series data
 * Based on dashboard-metrics@2.0.0 spec
 */

interface Review {
  id: string;
  direction: string;
  overallRating: number | null;
  submittedAt: Date;
  approvedForWebsite: boolean;
  channel: string | null;
  propertyId: string;
  property?: { name: string };
}

interface Property {
  id: string;
  name: string;
  reviews?: Review[];
}

/**
 * Calculate bidirectional metrics (guest-to-host AND host-to-guest)
 * Spec: dashboard-metrics@2.0.0#kpis.v1
 */
export function calculateBidirectionalMetrics(reviews: Review[]) {
  const guestToHostReviews = reviews.filter((r) => r.direction === 'guest-to-host');
  const hostToGuestReviews = reviews.filter((r) => r.direction === 'host-to-guest');

  const guestToHost = {
    averageRating: calculateAverage(guestToHostReviews),
    reviewCount: guestToHostReviews.length,
    approvedCount: guestToHostReviews.filter((r) => r.approvedForWebsite).length,
    trend: calculateTrend(guestToHostReviews),
  };

  const hostToGuest = {
    averageRating: calculateAverage(hostToGuestReviews),
    reviewCount: hostToGuestReviews.length,
    highRiskRate: calculateHighRiskRate(hostToGuestReviews),
    trend: calculateTrend(hostToGuestReviews),
  };

  return { guestToHost, hostToGuest };
}

/**
 * Calculate property health quadrants
 * Spec: dashboard-metrics@2.0.0#kpis.matrix.v1
 */
export function calculatePropertyHealthQuadrants(properties: Property[]) {
  const quadrants = {
    wellManaged: 0,
    screeningIssue: 0,
    propertyIssue: 0,
    systemicFailure: 0,
  };

  properties.forEach((property) => {
    if (!property.reviews || property.reviews.length === 0) return;

    const guestToHostReviews = property.reviews.filter((r) => r.direction === 'guest-to-host');
    const hostToGuestReviews = property.reviews.filter((r) => r.direction === 'host-to-guest');

    const guestToHostAvg = calculateAverage(guestToHostReviews);
    const hostToGuestAvg = calculateAverage(hostToGuestReviews);

    // Quadrant logic (spec lines 377-385)
    if (guestToHostAvg >= 4.5 && hostToGuestAvg >= 4.5) {
      quadrants.wellManaged++;
    } else if (guestToHostAvg >= 4.5 && hostToGuestAvg < 4.0) {
      quadrants.screeningIssue++;
    } else if (guestToHostAvg < 4.0 && hostToGuestAvg >= 4.5) {
      quadrants.propertyIssue++;
    } else if (guestToHostAvg < 4.0 && hostToGuestAvg < 4.0) {
      quadrants.systemicFailure++;
    }
  });

  return quadrants;
}

/**
 * Calculate time-series data for charts
 * Spec: dashboard-metrics@2.0.0#visualization.time-series.v1
 */
export function calculateTimeSeriesData(reviews: Review[], monthsBack: number = 6) {
  const now = new Date();
  const months: { month: string; guestToHost: number[]; hostToGuest: number[] }[] = [];

  // Generate last N months
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months.push({
      month: monthName,
      guestToHost: [],
      hostToGuest: [],
    });
  }

  // Group reviews by month
  reviews.forEach((review) => {
    if (!review.overallRating) return;

    const reviewDate = new Date(review.submittedAt);
    const monthDiff =
      (now.getFullYear() - reviewDate.getFullYear()) * 12 +
      (now.getMonth() - reviewDate.getMonth());

    if (monthDiff >= 0 && monthDiff < monthsBack) {
      const monthIndex = monthsBack - 1 - monthDiff;
      if (months[monthIndex]) {
        if (review.direction === 'guest-to-host') {
          months[monthIndex].guestToHost.push(review.overallRating);
        } else {
          months[monthIndex].hostToGuest.push(review.overallRating);
        }
      }
    }
  });

  // Calculate averages
  return months.map((m) => ({
    month: m.month,
    guestToHost: m.guestToHost.length > 0 ? average(m.guestToHost) : 0,
    hostToGuest: m.hostToGuest.length > 0 ? average(m.hostToGuest) : 0,
  }));
}

/**
 * Calculate rating distribution (1-5 stars)
 * Spec: dashboard-metrics@2.0.0#visualization.distribution.v1
 */
export function calculateDistribution(reviews: Review[]) {
  const distribution = [
    { rating: '1 Star', guestToHost: 0, hostToGuest: 0 },
    { rating: '2 Stars', guestToHost: 0, hostToGuest: 0 },
    { rating: '3 Stars', guestToHost: 0, hostToGuest: 0 },
    { rating: '4 Stars', guestToHost: 0, hostToGuest: 0 },
    { rating: '5 Stars', guestToHost: 0, hostToGuest: 0 },
  ];

  reviews.forEach((review) => {
    if (!review.overallRating) return;

    // Map 0-10 scale to 1-5 stars
    const stars = Math.ceil(review.overallRating / 2);
    if (stars >= 1 && stars <= 5) {
      if (review.direction === 'guest-to-host') {
        distribution[stars - 1].guestToHost++;
      } else {
        distribution[stars - 1].hostToGuest++;
      }
    }
  });

  return distribution;
}

/**
 * Calculate channel breakdown
 * Spec: dashboard-metrics@2.0.0#kpis.channels.v1
 */
export function calculateChannelBreakdown(reviews: Review[]) {
  const channels = new Map<string, { count: number; ratings: number[] }>();

  reviews.forEach((review) => {
    const channel = review.channel || 'unknown';
    const existing = channels.get(channel) || { count: 0, ratings: [] };
    existing.count++;
    if (review.overallRating) {
      existing.ratings.push(review.overallRating);
    }
    channels.set(channel, existing);
  });

  return Array.from(channels.entries()).map(([channel, data]) => ({
    channel,
    count: data.count,
    averageRating: data.ratings.length > 0 ? average(data.ratings) : 0,
  }));
}

/**
 * Helper: Calculate average rating
 */
function calculateAverage(reviews: Review[]): number {
  const ratingsWithValue = reviews.filter((r) => r.overallRating !== null);
  if (ratingsWithValue.length === 0) return 0;

  const sum = ratingsWithValue.reduce((acc, r) => acc + (r.overallRating || 0), 0);
  return Math.round((sum / ratingsWithValue.length) * 10) / 10;
}

/**
 * Helper: Calculate trend (up/down/stable)
 */
function calculateTrend(reviews: Review[]): { trend: 'up' | 'down' | 'stable'; delta: number } {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recent = reviews.filter((r) => r.submittedAt >= thirtyDaysAgo);
  const previous = reviews.filter(
    (r) => r.submittedAt >= sixtyDaysAgo && r.submittedAt < thirtyDaysAgo
  );

  const recentAvg = calculateAverage(recent);
  const previousAvg = calculateAverage(previous);

  const delta = Math.round((recentAvg - previousAvg) * 10) / 10;

  if (delta > 0.1) return { trend: 'up', delta };
  if (delta < -0.1) return { trend: 'down', delta };
  return { trend: 'stable', delta };
}

/**
 * Helper: Calculate high risk rate (% of guests rated < 3.0)
 */
function calculateHighRiskRate(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const lowRated = reviews.filter((r) => r.overallRating && r.overallRating < 3.0);
  return Math.round((lowRated.length / reviews.length) * 100);
}

/**
 * Helper: Calculate average of array
 */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}
