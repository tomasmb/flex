/**
 * AI Insights Panel Component (Server Component)
 * Displays AI-generated insights and recommendations
 * Based on architecture@1.0.0#frontend-composition.dashboard.v1
 */

import { generateAIInsights } from '@/lib/insights';
import { Sparkles, TrendingUp, AlertCircle, MessageSquareQuote } from 'lucide-react';

interface Review {
  id: string;
  overallRating: number | null;
  publicReview: string;
  categories: string;
  approvedForWebsite: boolean;
  listingName: string;
}

interface AIInsightsPanelProps {
  reviews: Review[];
}

export function AIInsightsPanel({ reviews }: AIInsightsPanelProps) {
  // Transform reviews to match the expected format for generateAIInsights
  const transformedReviews = reviews.map(review => ({
    id: review.id,
    rating: review.overallRating,
    text: review.publicReview,
    categories: review.categories,
    isPublished: review.approvedForWebsite,
    listingName: review.listingName,
  }));

  const insights = generateAIInsights(transformedReviews);

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold text-primary">AI Insights</h2>
        <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full">
          BETA
        </span>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <p className="text-text-primary leading-relaxed">{insights.summaryBlurb}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Issues */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-text-primary">Top Themes</h3>
          </div>
          <div className="space-y-2">
            {insights.topIssues.slice(0, 5).map((issue, index) => (
              <div key={index} className="bg-white rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-medium ${
                      issue.sentiment === 'positive'
                        ? 'text-success'
                        : issue.sentiment === 'negative'
                          ? 'text-red-500'
                          : 'text-text-secondary'
                    }`}
                  >
                    {issue.issue}
                  </span>
                  <span className="text-sm text-text-muted">×{issue.frequency}</span>
                </div>
                <p className="text-xs text-text-muted">
                  Mentioned in {issue.affectedProperties.length} properties
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-text-primary">Category Performance</h3>
          </div>
          <div className="space-y-2">
            {insights.categoryInsights.map((cat, index) => (
              <div key={index} className="bg-white rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {cat.category}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      cat.avgScore >= 9
                        ? 'text-success'
                        : cat.avgScore >= 7
                          ? 'text-yellow-600'
                          : 'text-red-500'
                    }`}
                  >
                    {cat.avgScore.toFixed(1)}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      cat.avgScore >= 9
                        ? 'bg-success'
                        : cat.avgScore >= 7
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${(cat.avgScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6">
        <h3 className="font-medium text-text-primary mb-3">💡 Recommendations</h3>
        <div className="space-y-2">
          {insights.recommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-lg p-3 text-sm text-text-secondary">
              {rec}
            </div>
          ))}
        </div>
      </div>

      {/* Highlight Quotes */}
      {insights.highlightQuotes.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareQuote className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-text-primary">Top Reviews</h3>
          </div>
          <div className="space-y-2">
            {insights.highlightQuotes.slice(0, 2).map((quote, index) => (
              <div key={index} className="bg-white rounded-lg p-3 italic text-sm text-text-secondary">
                &quot;{quote}&quot;
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
