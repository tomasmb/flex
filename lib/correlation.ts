/**
 * Correlation Analysis & Guest Risk Scoring
 * Implements bidirectional review analytics from spec Section 2B
 * Based on dashboard-metrics@2.0.0#kpis.correlation.v1
 *
 * Thresholds based on industry research (rating-thresholds-research@1.0.0):
 * - Guest-to-Host: ≥4.7 (Excellent), 4.0-4.69 (Good), <4.0 (Poor)
 * - Host-to-Guest: ≥4.5 (Excellent), <4.5 (Needs screening attention)
 *
 * Research sources: Airbnb Superhost (4.8 req), Booking.com (9.0+ = Excellent),
 * Industry data (86% of properties ≥4.5, 96% ≥4.0)
 */

// Research-backed thresholds (see rating-thresholds-research@1.0.0)
const THRESHOLDS = {
  guestToHost: {
    excellent: 4.7,  // Approaching Airbnb Superhost standard (4.8)
    poor: 4.0,       // Below this = bottom 4% of market
  },
  hostToGuest: {
    excellent: 4.5,  // Quality guests, low risk
    concerning: 4.0, // Below this requires intervention
  },
} as const;

import type {
  BidirectionalMetrics,
  PropertyHealthQuadrant,
  PropertyHealth,
  CategoryScores,
  GuestBehaviorScores,
  MetricSeverity,
} from './schemas';

/**
 * Evaluate property rating severity independently
 */
function evaluatePropertySeverity(rating: number): MetricSeverity {
  if (rating >= THRESHOLDS.guestToHost.excellent) {
    return {
      level: 0,
      color: 'green',
      label: 'Excellent',
      description: `Property rating ${rating.toFixed(1)}/5.0 is at Superhost tier (≥4.7). Maintain standards.`,
    };
  }
  if (rating >= THRESHOLDS.guestToHost.poor) {
    return {
      level: 1,
      color: 'yellow',
      label: 'Needs Improvement',
      description: `Property rating ${rating.toFixed(1)}/5.0 is acceptable but below premium (4.0-4.69). Work toward ≥4.7.`,
    };
  }
  return {
    level: 2,
    color: 'red',
    label: 'Critical',
    description: `Property rating ${rating.toFixed(1)}/5.0 is in bottom 4% of market (<4.0). URGENT: Fix immediately.`,
  };
}

/**
 * Evaluate guest quality severity independently
 */
function evaluateGuestSeverity(rating: number): MetricSeverity {
  if (rating >= THRESHOLDS.hostToGuest.excellent) {
    return {
      level: 0,
      color: 'green',
      label: 'Excellent Guests',
      description: `Guest quality ${rating.toFixed(1)}/5.0 is excellent (≥4.5). No screening issues.`,
    };
  }
  if (rating >= THRESHOLDS.hostToGuest.concerning) {
    return {
      level: 1,
      color: 'orange',
      label: 'Screening Needed',
      description: `Guest quality ${rating.toFixed(1)}/5.0 needs attention (4.0-4.49). Review acceptance criteria.`,
    };
  }
  return {
    level: 2,
    color: 'red',
    label: 'Critical Guests',
    description: `Guest quality ${rating.toFixed(1)}/5.0 is critical (<4.0). URGENT: Tighten screening immediately.`,
  };
}

/**
 * Calculate property health using WORST-CASE independent flagging
 * Each metric (property, guests) is evaluated independently
 * The worse of the two determines the overall flag color
 *
 * Philosophy: Flag individual problems, don't let them slip because the other side is good
 *
 * Examples:
 * - Property 3.8 (Red), Guests 4.8 (Green) → Red card
 * - Property 4.5 (Yellow), Guests 4.2 (Orange) → Orange card
 * - Property 4.8 (Green), Guests 4.2 (Orange) → Orange card
 */
export function calculatePropertyHealth(
  guestToHostRating: number,
  hostToGuestRating: number
): PropertyHealth {
  // Evaluate each metric independently
  const propertySeverity = evaluatePropertySeverity(guestToHostRating);
  const guestSeverity = evaluateGuestSeverity(hostToGuestRating);

  // Determine worst case (higher level = more severe)
  const worstCase = propertySeverity.level >= guestSeverity.level
    ? propertySeverity
    : guestSeverity;

  // Map to quadrant for backward compatibility
  let quadrant: PropertyHealthQuadrant;
  if (propertySeverity.level === 2 && guestSeverity.level === 2) {
    quadrant = 'systemic-failure';
  } else if (propertySeverity.level === 2) {
    quadrant = 'property-issue';
  } else if (guestSeverity.level >= 1 && propertySeverity.level === 0) {
    quadrant = 'screening-issue';
  } else if (propertySeverity.level === 1 || guestSeverity.level === 1) {
    quadrant = 'needs-improvement';
  } else {
    quadrant = 'well-managed';
  }

  // Build recommendation based on individual issues
  let recommendation = '';
  if (propertySeverity.level >= 1 && guestSeverity.level >= 1) {
    recommendation = `BOTH metrics need attention: ${propertySeverity.description} AND ${guestSeverity.description}`;
  } else if (propertySeverity.level >= 1) {
    recommendation = `Property needs attention: ${propertySeverity.description}`;
  } else if (guestSeverity.level >= 1) {
    recommendation = `Guests need attention: ${guestSeverity.description}`;
  } else {
    recommendation = 'Excellent performance on both property quality and guest screening. Maintain current standards.';
  }

  return {
    quadrant,
    guestToHostRating,
    hostToGuestRating,
    recommendation,
    propertySeverity, // NEW: expose individual severities
    guestSeverity,    // NEW: expose individual severities
    worstCase,        // NEW: expose worst case for UI
  };
}

/**
 * Calculate correlation score between guest-to-host and host-to-guest ratings
 * Returns -1 (negative correlation) to 1 (positive correlation)
 * Negative correlation indicates potential screening issues
 */
export function calculateCorrelationScore(
  guestToHostRatings: number[],
  hostToGuestRatings: number[]
): number {
  if (guestToHostRatings.length !== hostToGuestRatings.length || guestToHostRatings.length === 0) {
    return 0;
  }

  const n = guestToHostRatings.length;
  const meanX = guestToHostRatings.reduce((a, b) => a + b, 0) / n;
  const meanY = hostToGuestRatings.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sumSquaredX = 0;
  let sumSquaredY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = guestToHostRatings[i] - meanX;
    const diffY = hostToGuestRatings[i] - meanY;
    numerator += diffX * diffY;
    sumSquaredX += diffX * diffX;
    sumSquaredY += diffY * diffY;
  }

  const denominator = Math.sqrt(sumSquaredX * sumSquaredY);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Generate correlation insight based on score
 */
export function getCorrelationInsight(
  score: number,
  guestToHostAvg: number,
  hostToGuestAvg: number
): string {
  if (score < -0.3) {
    if (guestToHostAvg < 4.0 && hostToGuestAvg >= 4.5) {
      return 'Low property ratings + high guest ratings = Property has issues that need fixing';
    }
    return 'Negative correlation detected: Investigate divergent trends';
  }

  if (score > 0.6) {
    return 'Strong positive correlation: Property and guest quality move together';
  }

  return 'Moderate correlation: Property and guest quality are somewhat independent';
}

/**
 * Calculate guest risk score (0-100, higher = riskier)
 * Based on spec lines 351-370
 */
export function calculateGuestRiskScore(guestData: {
  averageRating: number;
  totalStays: number;
  incidentCount: number;
  damageCount: number;
  totalDamageCost: number;
}): {
  score: number;
  level: 'low' | 'medium' | 'high';
  flags: string[];
  recommendation: 'Accept' | 'Review carefully' | 'Decline';
} {
  const flags: string[] = [];
  let score = 50; // Baseline

  // Factor 1: Average rating (0-40 points)
  if (guestData.averageRating >= 4.5) {
    score -= 30; // Excellent guest
  } else if (guestData.averageRating >= 4.0) {
    score -= 15; // Good guest
  } else if (guestData.averageRating >= 3.5) {
    score += 10; // Below average
    flags.push('Below average rating history');
  } else {
    score += 30; // Poor rating
    flags.push('Poor rating history (<3.5)');
  }

  // Factor 2: Incident history (0-30 points)
  if (guestData.incidentCount > 2) {
    score += 30;
    flags.push(`${guestData.incidentCount} previous incidents`);
  } else if (guestData.incidentCount > 0) {
    score += 15;
    flags.push(`${guestData.incidentCount} previous incident(s)`);
  }

  // Factor 3: Damage history (0-20 points)
  if (guestData.damageCount > 0) {
    score += 20;
    flags.push(`${guestData.damageCount} damage report(s), £${guestData.totalDamageCost} total`);
  }

  // Factor 4: Experience factor (slight bonus for many stays)
  if (guestData.totalStays > 10 && guestData.averageRating >= 4.0) {
    score -= 10; // Experienced, good guest
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine level and recommendation
  let level: 'low' | 'medium' | 'high';
  let recommendation: 'Accept' | 'Review carefully' | 'Decline';

  if (score < 30) {
    level = 'low';
    recommendation = 'Accept';
  } else if (score < 60) {
    level = 'medium';
    recommendation = 'Review carefully';
  } else {
    level = 'high';
    recommendation = 'Decline';
  }

  return { score, level, flags, recommendation };
}

/**
 * Calculate bidirectional metrics for a property
 * From spec lines 80-97
 */
export function calculateBidirectionalMetrics(reviews: {
  guestToHost: Array<{ rating: number; categories: Array<{ category: string; rating: number }> }>;
  hostToGuest: Array<{ rating: number; categories: Array<{ category: string; rating: number }> }>;
}): BidirectionalMetrics {
  // Guest-to-Host metrics
  const gthRatings = reviews.guestToHost.map((r) => r.rating).filter((r) => r !== null) as number[];
  const gthAvg = gthRatings.length > 0 ? gthRatings.reduce((a, b) => a + b, 0) / gthRatings.length : 0;

  const categoryScores: Partial<CategoryScores> = {};
  const categoryTotals: Record<string, { sum: number; count: number }> = {};

  reviews.guestToHost.forEach((review) => {
    review.categories.forEach((cat) => {
      if (!categoryTotals[cat.category]) {
        categoryTotals[cat.category] = { sum: 0, count: 0 };
      }
      categoryTotals[cat.category].sum += cat.rating;
      categoryTotals[cat.category].count += 1;
    });
  });

  Object.entries(categoryTotals).forEach(([category, data]) => {
    const key = category as keyof CategoryScores;
    categoryScores[key] = data.sum / data.count;
  });

  // Host-to-Guest metrics
  const htgRatings = reviews.hostToGuest.map((r) => r.rating).filter((r) => r !== null) as number[];
  const htgAvg = htgRatings.length > 0 ? htgRatings.reduce((a, b) => a + b, 0) / htgRatings.length : 0;

  const behaviorScores: Partial<GuestBehaviorScores> = {};
  const behaviorTotals: Record<string, { sum: number; count: number }> = {};

  reviews.hostToGuest.forEach((review) => {
    review.categories.forEach((cat) => {
      if (!behaviorTotals[cat.category]) {
        behaviorTotals[cat.category] = { sum: 0, count: 0 };
      }
      behaviorTotals[cat.category].sum += cat.rating;
      behaviorTotals[cat.category].count += 1;
    });
  });

  Object.entries(behaviorTotals).forEach(([category, data]) => {
    // Map category names to behavior score keys
    const keyMap: Record<string, keyof GuestBehaviorScores> = {
      cleanliness: 'cleanliness',
      communication: 'communication',
      respect_house_rules: 'houseRules',
      honesty: 'honesty',
      checkout_adherence: 'checkoutAdherence',
    };
    const key = keyMap[category];
    if (key) {
      behaviorScores[key] = data.sum / data.count;
    }
  });

  // Correlation
  const correlationScore =
    gthRatings.length > 0 && htgRatings.length > 0
      ? calculateCorrelationScore(gthRatings, htgRatings)
      : 0;

  const insight = getCorrelationInsight(correlationScore, gthAvg, htgAvg);

  return {
    guestToHost: {
      averageRating: Math.round(gthAvg * 10) / 10,
      reviewCount: reviews.guestToHost.length,
      categoryScores,
    },
    hostToGuest: {
      averageRating: Math.round(htgAvg * 10) / 10,
      reviewCount: reviews.hostToGuest.length,
      behaviorScores,
    },
    correlation: {
      score: Math.round(correlationScore * 100) / 100,
      insight,
    },
  };
}
