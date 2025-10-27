/**
 * Property-Level Insights
 * Analyzes reviews to identify themes and category performance
 */

interface Review {
  id: string;
  rating: number | null;
  text: string;
  categories: string;
}

interface ThemeFrequency {
  theme: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface CategoryScore {
  category: string;
  avgScore: number;
  count: number;
}

export interface PropertyInsights {
  topThemes: ThemeFrequency[];
  categoryScores: CategoryScore[];
  summary: string;
}

const POSITIVE_KEYWORDS = [
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
  'spacious',
  'modern',
  'convenient',
  'responsive',
];

const NEGATIVE_KEYWORDS = [
  'noise',
  'noisy',
  'loud',
  'dirty',
  'broken',
  'issue',
  'problem',
  'small',
  'poor',
  'slow',
  'weak',
  'missing',
  'old',
  'worn',
];

function extractThemes(reviews: Review[]): ThemeFrequency[] {
  const themeCount = new Map<string, { count: number; sentiment: 'positive' | 'negative' }>();

  reviews.forEach((review) => {
    const lowerText = review.text.toLowerCase();

    POSITIVE_KEYWORDS.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        const existing = themeCount.get(keyword) || { count: 0, sentiment: 'positive' as const };
        themeCount.set(keyword, { ...existing, count: existing.count + 1 });
      }
    });

    NEGATIVE_KEYWORDS.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        const existing = themeCount.get(keyword) || { count: 0, sentiment: 'negative' as const };
        themeCount.set(keyword, { ...existing, count: existing.count + 1 });
      }
    });
  });

  return Array.from(themeCount.entries())
    .map(([theme, data]) => ({
      theme: theme.charAt(0).toUpperCase() + theme.slice(1),
      count: data.count,
      sentiment: data.sentiment,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function calculateCategoryScores(reviews: Review[]): CategoryScore[] {
  const categoryData = new Map<string, number[]>();

  reviews.forEach((review) => {
    try {
      const categories = JSON.parse(review.categories);
      categories.forEach((cat: { category: string; rating: number }) => {
        const existing = categoryData.get(cat.category) || [];
        categoryData.set(cat.category, [...existing, cat.rating]);
      });
    } catch {
      // Skip invalid JSON
    }
  });

  return Array.from(categoryData.entries())
    .map(([category, ratings]) => ({
      category: category.replace(/_/g, ' '),
      avgScore: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      count: ratings.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

function generateSummary(themes: ThemeFrequency[], avgRating: number): string {
  const positiveThemes = themes.filter((t) => t.sentiment === 'positive').slice(0, 2);
  const negativeThemes = themes.filter((t) => t.sentiment === 'negative').slice(0, 1);

  if (avgRating >= 4.5 && positiveThemes.length > 0) {
    return `Strong performance with guests highlighting ${positiveThemes.map((t) => t.theme.toLowerCase()).join(' and ')}.`;
  }

  if (avgRating >= 4 && positiveThemes.length > 0 && negativeThemes.length > 0) {
    return `Good ratings overall. Guests appreciate ${positiveThemes[0].theme.toLowerCase()}, though some mention ${negativeThemes[0].theme.toLowerCase()}.`;
  }

  if (avgRating >= 4) {
    return `Consistent performance with positive guest feedback.`;
  }

  if (negativeThemes.length > 0) {
    return `Requires attention. Common concerns include ${negativeThemes.map((t) => t.theme.toLowerCase()).join(' and ')}.`;
  }

  return `Review data available for analysis.`;
}

export function generatePropertyInsights(reviews: Review[]): PropertyInsights {
  const topThemes = extractThemes(reviews);
  const categoryScores = calculateCategoryScores(reviews);

  const avgRating =
    reviews.filter((r) => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) /
    reviews.filter((r) => r.rating).length;

  const summary = generateSummary(topThemes, avgRating);

  return {
    topThemes,
    categoryScores,
    summary,
  };
}
