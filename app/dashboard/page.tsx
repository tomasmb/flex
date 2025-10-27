/**
 * Portfolio Overview Dashboard - Level 1
 * Shows portfolio-wide KPIs and city breakdown
 * Following Next.js best practices: Server Component with direct DB access
 */

import { db } from '@/lib/db';
import { calculateCityMetrics, calculatePortfolioKPIs } from '@/lib/city-analytics';
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

  // Get health status colors
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'border-green-200 bg-green-50';
      case 'good':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
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

        {/* City Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cities</h2>
            <p className="text-gray-600 mt-1">
              Click on a city to view property-level details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cityMetrics.map((city) => (
              <Link
                key={city.citySlug}
                href={`/dashboard/city/${city.citySlug}`}
                className={`block border-2 rounded-xl p-6 hover:shadow-md transition-all ${getHealthColor(city.healthStatus)}`}
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
                    {getHealthIcon(city.healthStatus)}
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
                    <p className="text-xs text-gray-600 mb-1">Approval</p>
                    <p className="text-lg font-bold text-gray-900">
                      {city.approvalRate.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
