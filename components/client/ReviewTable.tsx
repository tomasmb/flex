/**
 * Review Table Component (Client Component)
 * Interactive table with sorting and approval management
 * Based on dashboard-metrics@2.0.0#review-management.v1
 */

'use client';

import { useState } from 'react';
import { ApprovalToggle } from './ApprovalToggle';
import { Star, ArrowUpDown, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Property {
  name: string;
  slug: string;
}

interface Review {
  id: string;
  source: string;
  listingName: string;
  guestName: string | null;
  date: Date;
  rating: number | null;
  categories: string;
  text: string;
  isPublished: boolean;
  property: Property;
}

interface ReviewTableProps {
  reviews: Review[];
}

type SortKey = 'date' | 'rating' | 'property' | 'guest';
type SortDirection = 'asc' | 'desc';

export function ReviewTable({ reviews }: ReviewTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortKey) {
      case 'date':
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
        break;
      case 'rating':
        aVal = a.rating || 0;
        bVal = b.rating || 0;
        break;
      case 'property':
        aVal = a.property.name;
        bVal = b.property.name;
        break;
      case 'guest':
        aVal = a.guestName || '';
        bVal = b.guestName || '';
        break;
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-text-muted">N/A</span>;

    const stars = Math.round(rating / 2); // Convert 10-point scale to 5-point
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-text-secondary">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-gray">
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('date')}
                className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary"
              >
                Date
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('property')}
                className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary"
              >
                Property
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('guest')}
                className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary"
              >
                Guest
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('rating')}
                className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary"
              >
                Rating
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-sm font-medium text-text-muted">Review</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-sm font-medium text-text-muted">Status</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedReviews.map((review) => (
            <tr
              key={review.id}
              className="border-b border-border-subtle hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4 text-sm text-text-secondary">
                {format(new Date(review.date), 'MMM d, yyyy')}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">
                    {review.property.name}
                  </span>
                  <a
                    href={`/property/${review.property.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-text-primary">
                {review.guestName || 'Anonymous'}
              </td>
              <td className="px-4 py-4">{renderStars(review.rating)}</td>
              <td className="px-4 py-4">
                <div className="max-w-md">
                  <p
                    className={`text-sm text-text-secondary ${
                      expandedReview === review.id ? '' : 'line-clamp-2'
                    }`}
                  >
                    {review.text}
                  </p>
                  {review.text.length > 100 && (
                    <button
                      onClick={() =>
                        setExpandedReview(expandedReview === review.id ? null : review.id)
                      }
                      className="text-xs text-primary hover:text-primary-dark mt-1"
                    >
                      {expandedReview === review.id ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <ApprovalToggle reviewId={review.id} initialState={review.isPublished} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">No reviews found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
