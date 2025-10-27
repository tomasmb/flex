---
title: "Property Rating Thresholds Research"
role: "research"
version: "1.0.0"
status: "stable"
owner: "tomas@theflex.global"
last_updated: "2025-10-27"
doc_id: "rating-thresholds-research@1.0.0"
provides:
  - "thresholds.rating.guest-to-host"
  - "thresholds.rating.host-to-guest"
  - "research.industry-benchmarks"
change_policy: "major: threshold changes based on new research"
---

# Property Rating Thresholds: Research & Rationale

## Executive Summary

This document provides research-backed thresholds for property health assessment in the Flex Living Reviews Dashboard. Based on analysis of industry standards from Airbnb, Booking.com, and vacation rental industry data, we establish evidence-based rating thresholds for flagging property performance.

## Research Methodology

Research conducted: October 27, 2025

Sources analyzed:
- Airbnb Superhost requirements and performance data
- Booking.com guest review scoring system
- Vacation rental industry benchmarks and performance reports
- Academic research on hospitality rating impacts

## Rating Scale System

### Mixed Scale Architecture

⚠️ **IMPORTANT:** The Flex Living review system uses a **mixed scale approach** common in the vacation rental industry:

- **Overall Ratings:** **5-point scale (0-5.0)** — Used for property/guest quality assessment
- **Category Ratings:** **10-point scale (0-10)** — Used for detailed breakdowns (cleanliness, communication, etc.)

**Example from Hostaway API:**
```json
{
  "rating": 4,  // ← 5-point overall rating
  "reviewCategory": [
    { "category": "cleanliness", "rating": 9 },    // ← 10-point detailed
    { "category": "communication", "rating": 10 }  // ← 10-point detailed
  ]
}
```

### Scale Conversion Logic

When `rating` is null, we calculate from categories and **convert to 5-point scale**:

```typescript
// Example:
// Categories: [9, 10, 9, 8] (10-point scale)
// Average: (9 + 10 + 9 + 8) / 4 = 9.0 (10-point)
// Convert to 5-point: 9.0 / 2 = 4.5
// Final: 4.5 (5-point scale)
```

**Implementation:** See `lib/normalize.ts:15-24`

### Why This Matters for Thresholds

All thresholds in this document (4.7, 4.5, 4.0) are based on **5-point scale** to match:
- ✅ Airbnb Superhost requirements (5-point system)
- ✅ Booking.com ratings (converted from 10-point to 5-point)
- ✅ Industry standard guest ratings (5-star system)
- ✅ User expectations (5-star reviews)

**Critical Fix (Oct 27, 2025):** Updated normalization logic to properly convert 10-point category averages to 5-point scale. Previous versions incorrectly left calculated ratings on 10-point scale, causing threshold mismatches.

## Industry Standards

### Airbnb (5-point scale)

**Superhost Requirements:**
- Minimum rating: **4.8/5.0** (actually 4.75+)
- Required to maintain elite status
- Associated with 7.7% higher daily rates and 18.2% higher revenue

**Performance Distribution:**
- **96%** of listings have ≥4.0 rating
- **86%** of listings have ≥4.5 rating
- Properties with 4.9+ rating achieve optimal performance
- Below 4.0 is bottom 4% (significant concern)

**Key Insight:** 4.5 is the competitive baseline; 4.8+ is premium tier.

### Booking.com (10-point scale)

**Rating Categories:**
- **9.5-10** (Exceptional): Top tier
- **9.0-9.4** (Excellent): High quality
- **8.0-8.9** (Very Good): Above average
- **7.0-7.9** (Good): Acceptable
- **<7.0** (Poor): Quality concerns

**Converted to 5-point scale:**
- 9.5-10 → **4.75-5.0** (Exceptional)
- 9.0-9.4 → **4.5-4.7** (Excellent)
- 8.0-8.9 → **4.0-4.45** (Very Good)
- 7.0-7.9 → **3.5-3.95** (Good)
- <7.0 → **<3.5** (Poor)

**Key Insight:** Below 8.0 (4.0 on 5-point) raises doubts about quality.

### Vacation Rental Industry Benchmarks

**Market Standards:**
- Average property rating: 4.5+ stars
- Premium properties: 4.8-5.0 stars
- Competitive visibility requires: 4.5+ stars
- Below 4.0 significantly hurts search ranking and booking conversion

**Revenue Impact:**
- 4.9+ rating: +18.2% revenue vs lower tiers
- 4.5-4.8 rating: Competitive baseline
- 4.0-4.5 rating: Below market average
- <4.0 rating: Significant revenue loss

## Recommended Thresholds

Based on industry research and Flex Living's positioning as a premium property management company, we recommend the following thresholds:

### Guest-to-Host Ratings (Property Quality)

| Rating Range | Classification | Industry Benchmark | Action Required |
|--------------|----------------|-------------------|-----------------|
| **≥4.7** | **Excellent** | Approaching Airbnb Superhost tier | Maintain standards, showcase reviews |
| **4.0-4.69** | **Good** | Competitive baseline (86th-96th percentile) | Monitor trends, minor improvements |
| **<4.0** | **Poor** | Bottom 4% of market | Urgent intervention required |

**Rationale:**
- **4.7 threshold (High)**: Aligns with Airbnb Superhost standard (4.8), provides buffer for occasional lower ratings
- **4.0 threshold (Low)**: Represents bottom 4% of Airbnb listings, below this indicates serious quality issues

### Host-to-Guest Ratings (Guest Quality)

| Rating Range | Classification | Risk Level | Action Required |
|--------------|----------------|-----------|-----------------|
| **≥4.5** | **Excellent Guests** | Low risk | Standard acceptance process |
| **4.0-4.49** | **Acceptable Guests** | Medium risk | Review guest history, consider screening |
| **<4.0** | **Problematic Guests** | High risk | Require deposit, strict screening, or decline |

**Rationale:**
- **4.5 threshold (High)**: Represents competitive baseline for guest behavior
- **4.0 threshold (Low)**: Below this, guests consistently cause issues that negatively impact properties

## Property Health: Worst-Case Flagging System

**Philosophy:** Flag individual problems independently. Don't let issues slip because the other metric is good.

### Independent Metric Evaluation

Each metric is evaluated on its own severity scale:

**Property Rating (Guest-to-Host):**
| Rating | Severity | Color | Meaning |
|--------|----------|-------|---------|
| **≥4.7** | Level 0 | 🟢 Green | Excellent (Superhost tier) |
| **4.0-4.69** | Level 1 | 🟡 Yellow | Needs Improvement (below premium) |
| **<4.0** | Level 2 | 🔴 Red | Critical (bottom 4% of market) |

**Guest Quality (Host-to-Guest):**
| Rating | Severity | Color | Meaning |
|--------|----------|-------|---------|
| **≥4.5** | Level 0 | 🟢 Green | Excellent guests |
| **4.0-4.49** | Level 1 | 🟠 Orange | Screening needed |
| **<4.0** | Level 2 | 🔴 Red | Critical (problematic guests) |

### Worst-Case Card Coloring

**Card color = Worst of the two metrics**

Examples:
- Property 3.8 (🔴 Red), Guests 4.8 (🟢 Green) → **Card is RED**
- Property 4.5 (🟡 Yellow), Guests 4.2 (🟠 Orange) → **Card is ORANGE**
- Property 4.8 (🟢 Green), Guests 4.2 (🟠 Orange) → **Card is ORANGE**
- Property 4.8 (🟢 Green), Guests 4.8 (🟢 Green) → **Card is GREEN**

**Why this works:**
- ✅ Individual problems never get hidden
- ✅ Property at 3.8 (bottom 4%) is ALWAYS flagged red, even with perfect guests
- ✅ Guest quality issues always show, even with perfect property
- ✅ Managers see worst-case first, details in tooltip

### Edge Cases: "Gray Zone" Properties

Properties with ratings between 4.0-4.69 (guest-to-host) or 4.0-4.49 (host-to-guest) fall into a "monitor closely" category:
- Not urgent intervention required
- Trending direction matters (improving vs declining)
- Category-specific issues may reveal root cause
- Should aim to reach "Excellent" tier within 2-3 months

## Validation Against Flex Living Portfolio

**TODO (Future):** Once sufficient review data is collected:
1. Analyze distribution of Flex properties across quadrants
2. Validate if thresholds correctly identify known good/poor performers
3. Adjust thresholds if portfolio skews significantly different from market
4. Track threshold effectiveness over time

## Alternative Threshold Considerations

### More Conservative (Stricter)

If Flex Living wants to position as ultra-premium:
- High: ≥4.8 (Airbnb Superhost exact)
- Low: <4.2 (stricter intervention threshold)

**Pros:** Drives higher quality standards
**Cons:** May flag too many properties unnecessarily

### More Lenient

If market conditions or portfolio maturity require it:
- High: ≥4.5 (86th percentile)
- Low: <3.5 (serious quality issues only)

**Pros:** Fewer false alarms
**Cons:** May miss declining properties before they become critical

## Monitoring and Updates

This research should be revisited:
- **Quarterly:** Check if industry standards have shifted
- **When portfolio reaches 50+ properties:** Validate against actual data
- **When major platforms change algorithms:** Re-assess benchmarks
- **Annually:** Full research refresh

## References

1. **Airbnb Superhost Requirements** (2025):
   - https://www.airbnb.com/help/article/829
   - Minimum 4.8 rating required

2. **Booking.com Guest Review Scoring**:
   - https://partner.booking.com/en-us/help/guest-reviews/general/everything-you-need-know-about-guest-review-scores
   - Rating tiers: 9.5 (Exceptional), 9.0 (Excellent), 8.0 (Very Good), 7.0 (Good)

3. **Vacation Rental Industry Performance**:
   - Hostaway Blog: Airbnb Star Ratings Impact
   - 86% of Airbnb listings ≥4.5 stars
   - Revenue impact: 4.9+ rating = +18.2% revenue

4. **Academic Research**:
   - Effects of online rating systems on booking behavior (ScienceDirect)
   - Rating inflation and standardization in hospitality

## Implementation

See:
- `lib/correlation.ts` — Threshold constants and health calculation
- `docs/10-dashboard-metrics.md` — Dashboard functional specification
- `app/dashboard/page.tsx` — Property health visualization

## Change Log

| Date | Change | Rationale |
|------|--------|-----------|
| 2025-10-27 | Initial research and thresholds established | Based on Airbnb, Booking.com, and industry data |
| — | Future: Threshold adjustment | After portfolio validation with real data |
