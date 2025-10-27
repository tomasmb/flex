/**
 * AI Insights Generation (Mocked)
 * Analyzes reviews and generates actionable insights
 * Based on architecture@1.0.0#core-functions.ai-insights.v1
 */

interface Review {
  id: string;
  rating: number | null;
  text: string;
  categories: string;
  isPublished: boolean;
  listingName: string;
}

export interface TopIssue {
  issue: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  affectedProperties: string[];
}

export interface AIInsights {
  topIssues: TopIssue[];
  summaryBlurb: string;
  highlightQuotes: string[];
  recommendations: string[];
  categoryInsights: {
    category: string;
    trend: 'improving' | 'declining' | 'stable';
    avgScore: number;
  }[];
}

/**
 * Extract keywords from review text
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  const lowerText = text.toLowerCase();

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
  ];

  const negativeKeywords = [
    'noise',
    'loud',
    'dirty',
    'broken',
    'issue',
    'problem',
    'failed',
    'slow',
    'weak',
    'missing',
  ];

  const found: string[] = [];

  positiveKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      found.push(keyword);
    }
  });

  negativeKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      found.push(keyword);
    }
  });

  return found;
}

/**
 * Determine sentiment from rating and keywords
 */
function determineSentiment(
  rating: number | null,
  keywords: string[]
): 'positive' | 'negative' | 'neutral' {
  const negativeWords = ['noise', 'loud', 'dirty', 'broken', 'issue', 'problem', 'failed'];

  if (rating && rating >= 4) return 'positive';
  if (rating && rating <= 2) return 'negative';

  const hasNegative = keywords.some((k) => negativeWords.includes(k));
  if (hasNegative) return 'negative';

  return 'neutral';
}

/**
 * Generate AI insights from reviews (mocked implementation)
 */
export function generateAIInsights(reviews: Review[]): AIInsights {
  // Extract all keywords and their frequencies
  const keywordFrequency = new Map<string, { count: number; properties: Set<string> }>();
  const issuesByProperty = new Map<string, string[]>();

  reviews.forEach((review) => {
    const keywords = extractKeywords(review.text);

    keywords.forEach((keyword) => {
      const existing = keywordFrequency.get(keyword) || { count: 0, properties: new Set() };
      existing.count++;
      existing.properties.add(review.listingName);
      keywordFrequency.set(keyword, existing);
    });

    // Track issues by property
    const negativeKeywords = keywords.filter((k) =>
      ['noise', 'loud', 'dirty', 'broken', 'issue', 'problem'].includes(k)
    );
    if (negativeKeywords.length > 0) {
      const existing = issuesByProperty.get(review.listingName) || [];
      issuesByProperty.set(review.listingName, [...existing, ...negativeKeywords]);
    }
  });

  // Build top issues
  const topIssues: TopIssue[] = Array.from(keywordFrequency.entries())
    .filter(([keyword, data]) => data.count >= 2) // Only issues mentioned 2+ times
    .map(([keyword, data]) => ({
      issue: keyword.charAt(0).toUpperCase() + keyword.slice(1),
      frequency: data.count,
      sentiment: determineSentiment(null, [keyword]),
      affectedProperties: Array.from(data.properties),
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Calculate category insights
  const categoryScores = new Map<string, number[]>();
  reviews.forEach((review) => {
    try {
      const categories = JSON.parse(review.categories);
      categories.forEach((cat: { category: string; rating: number }) => {
        const existing = categoryScores.get(cat.category) || [];
        categoryScores.set(cat.category, [...existing, cat.rating]);
      });
    } catch {
      // Skip invalid JSON
    }
  });

  const categoryInsights = Array.from(categoryScores.entries())
    .map(([category, ratings]) => ({
      category: category.replace(/_/g, ' '),
      avgScore: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      trend: 'stable' as const, // In real implementation, compare to previous period
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  // Generate summary
  const avgRating =
    reviews.filter((r) => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) /
    reviews.filter((r) => r.rating).length;

  const summaryBlurb =
    avgRating >= 4.5
      ? `Excellent performance with ${avgRating.toFixed(1)}/10 average rating. ${reviews.filter((r) => r.isPublished).length} reviews approved for public display.`
      : avgRating >= 3.5
        ? `Good performance with ${avgRating.toFixed(1)}/10 average rating. Some areas for improvement identified.`
        : `Below target with ${avgRating.toFixed(1)}/10 average rating. Immediate action recommended.`;

  // Get highlight quotes (top 3 positive reviews)
  const highlightQuotes = reviews
    .filter((r) => r.rating && r.rating >= 5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3)
    .map((r) => r.text);

  // Generate recommendations
  const recommendations: string[] = [];

  if (topIssues.some((i) => i.issue.toLowerCase().includes('noise'))) {
    recommendations.push('🔊 Review noise insulation and add soundproofing where needed');
  }

  if (topIssues.some((i) => i.issue.toLowerCase().includes('wifi'))) {
    recommendations.push('📶 Upgrade WiFi routers and test connection speeds');
  }

  const lowestCategory = categoryInsights[categoryInsights.length - 1];
  if (lowestCategory && lowestCategory.avgScore < 8) {
    recommendations.push(`⚠️ Focus on improving ${lowestCategory.category} (${lowestCategory.avgScore}/10)`);
  }

  const approvalRate = (reviews.filter((r) => r.isPublished).length / reviews.length) * 100;
  if (approvalRate < 50) {
    recommendations.push('✅ Review pending reviews - only ' + Math.round(approvalRate) + '% approved');
  }

  if (recommendations.length === 0) {
    recommendations.push('✨ Keep up the excellent work! All metrics are strong.');
  }

  return {
    topIssues,
    summaryBlurb,
    highlightQuotes,
    recommendations,
    categoryInsights: categoryInsights.slice(0, 5), // Top 5 categories
  };
}
