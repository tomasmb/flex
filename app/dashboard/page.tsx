/**
 * Portfolio Overview Dashboard - Level 1
 * Shows portfolio-wide KPIs and city breakdown
 * Following Next.js best practices: Server Component with direct DB access
 */

import { db } from '@/lib/db';
import { calculateCityMetrics, calculatePortfolioKPIs } from '@/lib/city-analytics';
import { HealthStatusGuide } from '@/components/client/HealthStatusGuide';
import Link from 'next/link';
import {
  Building2,
  Star,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  MapPin,
} from 'lucide-react';

export default async function PortfolioOverviewPage() {
  // Fetch all properties with their reviews
  const properties = await db.property.findMany({
    include: {
      reviews: true,
    },
  });

  // Calculate portfolio-wide KPIs
  const portfolioKPIs = calculatePortfolioKPIs(properties);

  // Calculate city-level metrics
  const cityMetrics = calculateCityMetrics(properties);

  // Get health status colors based on worst-case severity
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
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Overview</h1>
              <p className="text-gray-600 mt-1">
                Manage your property portfolio across all cities
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                href="/api/reviews/hostaway"
                target="_blank"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View API
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Portfolio KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Total Properties
              </h3>
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {portfolioKPIs.totalProperties}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Across {cityMetrics.length} cities
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Property Rating
              </h3>
              <Star className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {portfolioKPIs.guestToHostAvg.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {portfolioKPIs.guestToHostCount} guest reviews
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Guest Quality
              </h3>
              <Star className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {portfolioKPIs.hostToGuestAvg.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {portfolioKPIs.hostToGuestCount} host reviews
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Approved Reviews
              </h3>
              <Star className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {portfolioKPIs.approvedCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Published on website
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Properties At Risk
              </h3>
              <AlertCircle className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {portfolioKPIs.propertiesAtRisk}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Low ratings (30 days)
            </p>
          </div>
        </div>

        {/* Health Status Guide (Collapsible) */}
        <HealthStatusGuide />

        {/* City Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cities</h2>
            <p className="text-gray-600 mt-1">
              Click on a city to view property-level details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cityMetrics.map((city) => {
              // Use worst-case color for card border/background
              const cardColor = getSeverityColor(city.worstCaseColor || 'green');

              // Build detailed tooltip showing both metrics
              const tooltipText = `Property: ${city.guestToHostAvg.toFixed(1)}/5.0 (${city.propertySeverityLabel || 'Unknown'})\nGuests: ${city.hostToGuestAvg.toFixed(1)}/5.0 (${city.guestSeverityLabel || 'Unknown'})\n\nCard color shows worst-case scenario.`;

              return (
                <Link
                  key={city.citySlug}
                  href={`/dashboard/city/${city.citySlug}`}
                  className={`block border-2 rounded-xl p-6 hover:shadow-md transition-all ${cardColor}`}
                  title={tooltipText}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {city.cityName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {city.propertyCount} {city.propertyCount === 1 ? 'property' : 'properties'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(city.worstCaseColor || 'green')}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Property Rating</p>
                    <p className="text-lg font-bold text-gray-900">
                      {city.guestToHostAvg.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Guest Quality</p>
                    <p className="text-lg font-bold text-gray-900">
                      {city.hostToGuestAvg.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Reviews</p>
                    <p className="text-lg font-bold text-gray-900">
                      {city.totalReviews}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">At Risk</p>
                    <p className={`text-lg font-bold ${city.propertiesAtRisk > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {city.propertiesAtRisk}
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
