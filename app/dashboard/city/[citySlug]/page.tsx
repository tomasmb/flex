/**
 * City View Dashboard - Level 2
 * Shows all properties in a specific city with comparison
 * Following Next.js best practices: Server Component with direct DB access
 */

import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { calculatePropertyHealth } from '@/lib/correlation';
import Link from 'next/link';
import {
  Building2,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ citySlug: string }>;
}

export default async function CityViewPage({ params }: PageProps) {
  const { citySlug } = await params;

  // Convert slug back to city name
  const cityName = citySlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Fetch all properties in this city
  const properties = await db.property.findMany({
    where: {
      city: cityName,
    },
    include: {
      reviews: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  if (properties.length === 0) {
    notFound();
  }

  // Calculate metrics for each property
  const propertyMetrics = properties.map((property) => {
    const guestToHostReviews = property.reviews.filter(
      (r) => r.direction === 'guest-to-host'
    );
    const hostToGuestReviews = property.reviews.filter(
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

    const approvedCount = guestToHostReviews.filter((r) => r.isPublished).length;
    const approvalRate =
      guestToHostReviews.length > 0
        ? (approvedCount / guestToHostReviews.length) * 100
        : 0;

    // Determine health status using worst-case severity system
    const propertyHealth = calculatePropertyHealth(guestToHostAvg, hostToGuestAvg);

    return {
      property,
      guestToHostAvg,
      hostToGuestAvg,
      totalReviews: property.reviews.length,
      guestToHostCount: guestToHostReviews.length,
      hostToGuestCount: hostToGuestReviews.length,
      approvedCount,
      approvalRate,
      healthStatus: propertyHealth.quadrant, // Legacy
      worstCaseColor: propertyHealth.worstCase?.color, // NEW: For card color
      propertySeverityLabel: propertyHealth.propertySeverity?.label, // NEW: For tooltip
      guestSeverityLabel: propertyHealth.guestSeverity?.label, // NEW: For tooltip
    };
  });

  // Calculate city-level stats
  const cityStats = {
    totalProperties: properties.length,
    totalReviews: properties.reduce((sum, p) => sum + p.reviews.length, 0),
    avgRating:
      propertyMetrics.reduce((sum, p) => sum + p.guestToHostAvg, 0) /
      propertyMetrics.length,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'green':
        return 'border-green-200 bg-green-50';
      case 'yellow':
        return 'border-yellow-200 bg-yellow-50';
      case 'orange':
        return 'border-orange-200 bg-orange-50';
      case 'red':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityIcon = (color: string) => {
    switch (color) {
      case 'green':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'yellow':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'orange':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'red':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (color: string) => {
    switch (color) {
      case 'green':
        return { label: 'Excellent', color: 'text-green-700' };
      case 'yellow':
        return { label: 'Monitor', color: 'text-yellow-700' };
      case 'orange':
        return { label: 'Warning', color: 'text-orange-700' };
      case 'red':
        return { label: 'Urgent', color: 'text-red-700' };
      default:
        return { label: 'Unknown', color: 'text-gray-700' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Portfolio
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{cityName}</h1>
              <p className="text-gray-600 mt-1">
                {cityStats.totalProperties} properties •{' '}
                {cityStats.totalReviews} reviews • Avg rating{' '}
                {cityStats.avgRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
            <p className="text-gray-600 mt-1">
              Click on a property to manage reviews and view detailed analytics
            </p>
          </div>

          <div className="space-y-4">
            {propertyMetrics.map(({ property, ...metrics }) => {
              // Use worst-case color for card
              const cardColor = getSeverityColor(metrics.worstCaseColor || 'green');

              // Build detailed tooltip showing both metrics independently
              const tooltipText = `Property: ${metrics.guestToHostAvg.toFixed(1)}/5.0 (${metrics.propertySeverityLabel || 'Unknown'})\nGuests: ${metrics.hostToGuestAvg.toFixed(1)}/5.0 (${metrics.guestSeverityLabel || 'Unknown'})\n\nCard color shows worst-case scenario.`;

              return (
                <Link
                  key={property.id}
                  href={`/dashboard/property/${property.slug}`}
                  className={`block border-2 rounded-xl p-6 hover:shadow-md transition-all ${cardColor}`}
                  title={tooltipText}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {property.name}
                      </h3>
                      <p className="text-sm text-gray-600">{property.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(metrics.worstCaseColor || 'green')}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Guest → Host</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <p className="text-lg font-bold text-gray-900">
                        {metrics.guestToHostAvg.toFixed(1)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {metrics.guestToHostCount} reviews
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Host → Guest</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-blue-500" />
                      <p className="text-lg font-bold text-gray-900">
                        {metrics.hostToGuestAvg > 0
                          ? metrics.hostToGuestAvg.toFixed(1)
                          : 'N/A'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {metrics.hostToGuestCount} reviews
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                    <p className="text-lg font-bold text-gray-900">
                      {metrics.totalReviews}
                    </p>
                    <p className="text-xs text-gray-500">All directions</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-lg font-bold text-gray-900">
                      {metrics.approvedCount}
                    </p>
                    <p className="text-xs text-gray-500">Published</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approval Rate</p>
                    <p className="text-lg font-bold text-gray-900">
                      {metrics.approvalRate.toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {metrics.guestToHostCount} total
                    </p>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
