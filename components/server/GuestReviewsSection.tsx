/**
 * Guest Reviews Section Component (Server Component)
 * Displays approved reviews on public property pages
 * Based on design-system@1.0.0#property-review-display.reviews-section.v1
 */

import { Star } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  guestName: string | null;
  date: Date; // Prisma client field name
  rating: number | null; // Prisma client field name
  text: string; // Prisma client field name
  categories: string;
}

interface GuestReviewsSectionProps {
  reviews: Review[];
  avgRating: number;
}

export function GuestReviewsSection({ reviews, avgRating }: GuestReviewsSectionProps) {
  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    const stars = Math.round(rating / 2); // Convert 10-point to 5-point scale

    return (
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-text-secondary">Guest Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(avgRating / 2)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold text-text-secondary">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-sm text-text-muted">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => {
          // Parse categories for display (optional)
          let categoryTags: string[] = [];
          try {
            const categories = JSON.parse(review.categories);
            // Get top 2 highest-rated categories
            const topCategories = categories
              .sort((a: any, b: any) => b.rating - a.rating)
              .slice(0, 2)
              .map((c: any) => c.category);
            categoryTags = topCategories;
          } catch {
            // Skip if JSON parse fails
          }

          return (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-transparent hover:border-primary transition-all"
            >
              {/* Star Rating */}
              {renderStars(review.rating)}

              {/* Review Text */}
              <p className="text-base text-text-primary leading-relaxed mb-4">
                {review.text}
              </p>

              {/* Guest Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-text-secondary">
                    {(review.guestName || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {review.guestName || 'Anonymous'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {format(new Date(review.date), 'MMMM yyyy')}
                  </p>
                </div>
              </div>

              {/* Category Tags */}
              {categoryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {categoryTags.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-3 py-1 bg-surface-yellow text-text-secondary rounded-full text-xs font-medium"
                    >
                      {category.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More Button (if there are many reviews) */}
      {reviews.length >= 6 && (
        <div className="text-center">
          <button className="px-8 py-3 border-2 border-primary text-primary rounded-xl font-medium hover:bg-primary hover:text-white transition-colors">
            Show all reviews
          </button>
        </div>
      )}
    </section>
  );
}
