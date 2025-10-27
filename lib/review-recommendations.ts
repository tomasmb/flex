/**
 * Review Approval Recommendations
 * Suggests which reviews should be approved for the website
 */

interface Review {
  id: string;
  rating: number | null;
  text: string;
  isPublished: boolean;
}

interface ReviewRecommendation {
  reviewId: string;
  shouldApprove: boolean;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Check if review contains positive keywords
 */
function hasPositiveKeywords(text: string): boolean {
  const positiveKeywords = [
    'clean',
    'spotless',
    'great',
    'perfect',
    'excellent',
    'lovely',
    'beautiful',
    'comfortable',
    'amazing',
    'fantastic',
    'wonderful',
    'love',
    'recommend',
  ];
  const lowerText = text.toLowerCase();
  return positiveKeywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Check if review contains negative keywords
 */
function hasNegativeKeywords(text: string): boolean {
  const negativeKeywords = [
    'noise',
    'loud',
    'dirty',
    'broken',
    'issue',
    'problem',
    'failed',
    'terrible',
    'awful',
    'worst',
    'never',
    'disappointed',
  ];
  const lowerText = text.toLowerCase();
  return negativeKeywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Check if review is detailed enough
 */
function isDetailedReview(text: string): boolean {
  // A review is considered detailed if it has at least 30 characters and 5 words
  return text.length >= 30 && text.split(' ').length >= 5;
}

/**
 * Generate recommendations for which reviews to approve
 */
export function generateReviewRecommendations(
  reviews: Review[]
): ReviewRecommendation[] {
  const recommendations: ReviewRecommendation[] = [];

  reviews.forEach((review) => {
    const rating = review.rating || 0;
    const hasPositive = hasPositiveKeywords(review.text);
    const hasNegative = hasNegativeKeywords(review.text);
    const isDetailed = isDetailedReview(review.text);

    // High priority: Excellent reviews with positive content
    if (rating >= 4.5 && hasPositive && !review.isPublished) {
      recommendations.push({
        reviewId: review.id,
        shouldApprove: true,
        reason: 'Excellent rating with positive feedback',
        priority: 'high',
      });
    }
    // High priority: Any 5-star review not published
    else if (rating === 5 && !review.isPublished) {
      recommendations.push({
        reviewId: review.id,
        shouldApprove: true,
        reason: 'Perfect 5-star rating',
        priority: 'high',
      });
    }
    // Medium priority: Good reviews
    else if (rating >= 4 && !hasNegative && !review.isPublished) {
      recommendations.push({
        reviewId: review.id,
        shouldApprove: true,
        reason: 'Good rating and constructive feedback',
        priority: 'medium',
      });
    }
    // High priority: Remove poor reviews
    else if (rating < 3 && review.isPublished) {
      recommendations.push({
        reviewId: review.id,
        shouldApprove: false,
        reason: 'Low rating - consider removing from public view',
        priority: 'high',
      });
    }
    // Medium priority: Reviews with negative keywords
    else if (hasNegative && rating < 4 && review.isPublished) {
      recommendations.push({
        reviewId: review.id,
        shouldApprove: false,
        reason: 'Contains negative feedback',
        priority: 'medium',
      });
    }
  });

  // Sort by priority
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
