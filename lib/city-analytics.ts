/**
 * City-Level Analytics Functions
 * Calculate metrics aggregated by city for portfolio overview
 */

import { Property, Review } from '@prisma/client';

export interface CityMetrics {
  cityName: string;
  citySlug: string;
  propertyCount: number;
  totalReviews: number;
  averageRating: number;
  approvalRate: number;
  healthStatus: 'excellent' | 'good' | 'warning' | 'critical';
  guestToHostAvg: number;
  hostToGuestAvg: number;
}

type PropertyWithReviews = Property & {
  reviews: Review[];
};

/**
 * Calculate metrics for each city in the portfolio
 */
export function calculateCityMetrics(
  properties: PropertyWithReviews[]
): CityMetrics[] {
  // Group properties by city
  const citiesMap = new Map<string, PropertyWithReviews[]>();

  properties.forEach((property) => {
    const city = property.city || 'Unknown';
    if (!citiesMap.has(city)) {
      citiesMap.set(city, []);
    }
    citiesMap.get(city)!.push(property);
  });

  // Calculate metrics for each city
  const cityMetrics: CityMetrics[] = [];

  citiesMap.forEach((cityProperties, cityName) => {
    const allReviews = cityProperties.flatMap((p) => p.reviews);
    const guestToHostReviews = allReviews.filter(
      (r) => r.direction === 'guest-to-host'
    );
    const hostToGuestReviews = allReviews.filter(
      (r) => r.direction === 'host-to-guest'
    );

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

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          allReviews.length
        : 0;

    const approvedCount = guestToHostReviews.filter((r) => r.isPublished).length;
    const approvalRate =
      guestToHostReviews.length > 0
        ? (approvedCount / guestToHostReviews.length) * 100
        : 0;

    // Determine health status
    let healthStatus: CityMetrics['healthStatus'] = 'excellent';
    if (guestToHostAvg < 4.0 || hostToGuestAvg < 4.0) {
      healthStatus = 'critical';
    } else if (guestToHostAvg < 4.5 || hostToGuestAvg < 4.5) {
      healthStatus = 'warning';
    } else if (guestToHostAvg >= 4.8 && hostToGuestAvg >= 4.8) {
      healthStatus = 'excellent';
    } else {
      healthStatus = 'good';
    }

    cityMetrics.push({
      cityName,
      citySlug: cityName.toLowerCase().replace(/\s+/g, '-'),
      propertyCount: cityProperties.length,
      totalReviews: allReviews.length,
      averageRating,
      approvalRate,
      healthStatus,
      guestToHostAvg,
      hostToGuestAvg,
    });
  });

  // Sort by property count descending
  return cityMetrics.sort((a, b) => b.propertyCount - a.propertyCount);
}

/**
 * Calculate portfolio-wide KPIs
 */
export function calculatePortfolioKPIs(properties: PropertyWithReviews[]) {
  const allReviews = properties.flatMap((p) => p.reviews);
  const guestToHostReviews = allReviews.filter(
    (r) => r.direction === 'guest-to-host'
  );
  const hostToGuestReviews = allReviews.filter(
    (r) => r.direction === 'host-to-guest'
  );

  const totalProperties = properties.length;
  const totalReviews = allReviews.length;

  const averageRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        allReviews.length
      : 0;

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

  // Count properties with recent low ratings in last 30 days
  // Guest-to-host: < 4.0 on 5-point scale (< 4 stars)
  // Host-to-guest: < 8.0 on 10-point scale (< 4 stars equivalent)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const propertiesAtRisk = properties.filter((property) => {
    const recentGuestToHost = property.reviews.filter(
      (r) => r.direction === 'guest-to-host' && r.date >= thirtyDaysAgo
    );
    const recentHostToGuest = property.reviews.filter(
      (r) => r.direction === 'host-to-guest' && r.date >= thirtyDaysAgo
    );

    let hasLowGuestToHost = false;
    let hasLowHostToGuest = false;

    // Check guest-to-host ratings (5-point scale)
    if (recentGuestToHost.length > 0) {
      const guestToHostAvg =
        recentGuestToHost.reduce((sum, r) => sum + (r.rating || 0), 0) /
        recentGuestToHost.length;
      hasLowGuestToHost = guestToHostAvg < 4.0;
    }

    // Check host-to-guest ratings (10-point scale)
    if (recentHostToGuest.length > 0) {
      const hostToGuestAvg =
        recentHostToGuest.reduce((sum, r) => sum + (r.rating || 0), 0) /
        recentHostToGuest.length;
      hasLowHostToGuest = hostToGuestAvg < 8.0;
    }

    // Property is at risk if either rating is low
    return hasLowGuestToHost || hasLowHostToGuest;
  }).length;

  return {
    totalProperties,
    totalReviews,
    averageRating,
    guestToHostAvg,
    hostToGuestAvg,
    approvedCount,
    propertiesAtRisk,
    guestToHostCount: guestToHostReviews.length,
    hostToGuestCount: hostToGuestReviews.length,
  };
}
