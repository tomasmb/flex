/**
 * Filters Bar Component (Client Component)
 * Filter controls using URL search params
 * Based on nextjs-best-practices@1.0.0#state-management.filters.v1
 */

'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';

interface FiltersBarProps {
  properties: string[];
}

export function FiltersBar({ properties }: FiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === '' || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(url as any);
  };

  const clearFilters = () => {
    router.push(pathname as any);
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
      </div>

      {/* Row 1: Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search reviews..."
              defaultValue={searchParams.get('search') || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Property */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Property</label>
          <select
            value={searchParams.get('property') || 'all'}
            onChange={(e) => updateFilter('property', e.target.value)}
            className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Properties</option>
            {properties.map((property) => (
              <option key={property} value={property}>
                {property}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Minimum Rating
          </label>
          <select
            value={searchParams.get('rating') || 'all'}
            onChange={(e) => updateFilter('rating', e.target.value)}
            className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>

        {/* Approval Status */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Status</label>
          <select
            value={searchParams.get('approved') || 'all'}
            onChange={(e) => updateFilter('approved', e.target.value)}
            className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved Only</option>
            <option value="unapproved">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Row 2: Advanced Filters (Bidirectional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Review Direction (NEW - CRITICAL) */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Review Direction
          </label>
          <select
            value={searchParams.get('direction') || 'all'}
            onChange={(e) => updateFilter('direction', e.target.value)}
            className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Reviews</option>
            <option value="guest-to-host">Guest-to-Host (Property Reviews)</option>
            <option value="host-to-guest">Host-to-Guest (Guest Reviews)</option>
          </select>
        </div>

        {/* Channel (NEW - CRITICAL) */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Channel</label>
          <select
            value={searchParams.get('channel') || 'all'}
            onChange={(e) => updateFilter('channel', e.target.value)}
            className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Channels</option>
            <option value="hostaway">Hostaway</option>
            <option value="airbnb">Airbnb</option>
            <option value="booking.com">Booking.com</option>
            <option value="direct">Direct</option>
            <option value="google">Google</option>
          </select>
        </div>

        {/* Date From (NEW - CRITICAL) */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">From Date</label>
          <input
            type="date"
            value={searchParams.get('dateFrom') || ''}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Date To (NEW - CRITICAL) */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">To Date</label>
          <input
            type="date"
            value={searchParams.get('dateTo') || ''}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
