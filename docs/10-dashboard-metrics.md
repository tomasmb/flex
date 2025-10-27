---
title: "Dashboard Functional Specification"
role: "source-of-truth"
version: "2.0.0"
status: "stable"
owner: "tomas@theflex.global"
last_updated: "2025-10-26"
doc_id: "dashboard-metrics@2.0.0"
depends_on:
  - "scope@1.0.0"
  - "architecture@1.0.0"
provides:
  - "requirements.dashboard"
  - "features.kpis.guest-to-host"
  - "features.kpis.host-to-guest"
  - "features.correlation-analysis"
  - "features.guest-screening"
  - "features.risk-management"
  - "features.filters"
  - "features.visualization"
  - "workflows.guest-screening"
  - "workflows.root-cause-diagnosis"
out_of_scope:
  - "mobile app features"
  - "email reports"
  - "automated alerts"
change_policy: "minor: feature additions; major: breaking UI changes or data model changes"
---

# Property Manager Reviews Dashboard — Functional Spec <!-- id:title.v1 -->

> This spec consolidates the features and metrics recommended in the "Designing a Guest Review Analytics Dashboard for Property Managers" assessment PDF, extended to cover **bidirectional reviews** for comprehensive property management.

## Purpose <!-- id:purpose.v1 -->

Define the complete functional requirements for the manager-facing dashboard, including:
- Portfolio navigation patterns
- **Bidirectional review analytics** (guest-to-host AND host-to-guest)
- Core KPIs and metrics for both review types
- Filtering and search capabilities
- Visualization requirements
- Review management workflows
- Guest screening and risk management
- Correlation analysis between property performance and guest quality

## 0. Review Types & Directionality <!-- id:review-types.v1 -->

### Guest-to-Host Reviews <!-- id:review-types.guest-to-host.v1 -->

Reviews **from guests about properties**. Covers:
- Property quality (cleanliness, location, amenities)
- Host communication and support
- Check-in/check-out experience
- Value for money

**Purpose:** Identify property issues, improve service, showcase quality to future guests

### Host-to-Guest Reviews <!-- id:review-types.host-to-guest.v1 -->

Reviews **from hosts about guests**. Covers:
- Guest behavior and house rules compliance
- Cleanliness (state of property after stay)
- Communication responsiveness
- Damage or issues during stay

**Purpose:** Screen future guests, identify problematic patterns, calibrate host expectations

### Correlation Analysis <!-- id:review-types.correlation.v1 -->

**MUST** support analysis across both review types:
- Properties with low guest-to-host ratings AND high host-to-guest complaints → Property issues masked by blaming guests
- Properties with high guest-to-host ratings AND high host-to-guest complaints → Attracting wrong guest demographic or unrealistic host expectations
- Properties with balanced positive reviews in both directions → Well-managed property with good guest screening

**Data model:**
```ts
// purpose: types; id: types.review-direction.v1; source: dashboard-metrics@1.0.0
type ReviewDirection = "guest-to-host" | "host-to-guest";

interface BidirectionalMetrics {
  guestToHost: {
    averageRating: number;
    reviewCount: number;
    categoryScores: CategoryScores;
  };
  hostToGuest: {
    averageRating: number;
    reviewCount: number;
    behaviorScores: BehaviorScores;
  };
  correlation: {
    // Negative correlation = potential issue
    score: number; // -1 to 1
    insight: string; // e.g., "Low property ratings + high guest complaints = screening issue"
  };
}
```

## 1. Portfolio & Navigation <!-- id:portfolio.v1 -->

### Portfolio Overview <!-- id:portfolio.overview.v1 -->

**MUST** display all properties with:
- Overall guest-to-host rating (property quality)
- Overall host-to-guest rating (guest quality)
- Total review count (both directions)
- Recent trend indicators for both metrics
- **Risk indicator:** Flag properties with divergent ratings (e.g., low property rating + many guest complaints)

**SHOULD** support:
- Table view (default) or card grid view
- Sorting by either rating type, review count, or trend
- Color coding: Green (balanced positive), Yellow (needs attention), Red (divergent/problematic)

### Drill-down View <!-- id:portfolio.drill-down.v1 -->

**MUST** provide per-property view showing:
- All guest-to-host KPIs (see Section 2)
- All host-to-guest KPIs (see Section 2A)
- Correlation insights (see Section 2B)
- Charts and visualizations for both review types (see Section 4)
- Recent reviews list (tabbed or segmented by direction)
- Approval management interface
- **Guest screening insights** (patterns in problematic guests)

### Multi-property Benchmarking <!-- id:portfolio.benchmarking.v1 -->

**MAY** support side-by-side property comparison:
- Compare guest-to-host ratings across properties
- Compare host-to-guest ratings across properties
- Compare category scores (e.g., cleanliness)
- Identify underperforming properties
- **Identify properties attracting problematic guests** (high host complaint rate)

## 2. Guest-to-Host Review KPIs (Property Performance) <!-- id:kpis.v1 -->

> **Scope:** Metrics for reviews FROM guests ABOUT properties

### Overall Rating Score <!-- id:kpis.overall-rating.v1 -->

**MUST** calculate:
- Average rating across all guest-to-host reviews
- Period-over-period comparison (e.g., "this month vs last month")

**Display format:**
```ts
// purpose: types; id: types.kpi-overall-rating.v1; source: dashboard-metrics@1.0.0
interface OverallRatingKPI {
  current: number;        // e.g., 4.8
  previous: number;       // e.g., 4.6
  delta: number;          // e.g., +0.2
  trend: "up" | "down" | "stable";
}
```

### Category/Sub-rating Averages <!-- id:kpis.category-ratings.v1 -->

**MUST** display average ratings for:
- Cleanliness
- Communication
- Check-in / Accuracy
- Location
- Value
- (Other categories from source data)

**SHOULD** highlight:
- Categories below target threshold (e.g., < 8.0)
- Categories with negative trends

### Review Count & Distribution <!-- id:kpis.review-count.v1 -->

**MUST** show:
- Total review count
- Review volume over time (monthly/quarterly)
- Rating distribution (% of 1★, 2★, 3★, 4★, 5★ reviews)

**Format:**
```ts
// purpose: types; id: types.kpi-distribution.v1; source: dashboard-metrics@1.0.0
interface RatingDistribution {
  totalReviews: number;
  distribution: {
    "1": number;  // Count or percentage
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}
```

### Recent Trends Over Time <!-- id:kpis.trends.v1 -->

**MUST** display:
- Rating trajectory by month/quarter
- Period comparisons ("this quarter vs last quarter")

**SHOULD** support:
- Customizable date ranges
- Trend line visualization

### Review Source (Channel) Breakdown <!-- id:kpis.channels.v1 -->

**MUST** segment reviews by source:
- Hostaway
- Google
- Direct site
- (Other channels as configured)

**Display:**
- Count per channel
- Average rating per channel
- Channel mix percentage

### Sentiment & Keyword Analysis <!-- id:kpis.sentiment.v1 -->

**SHOULD** provide:
- Top recurring keywords/phrases from review text
- Sentiment score (positive/neutral/negative)
- Sentiment trend over time
- Keyword frequency segmented by sentiment

**MAY** use AI/NLP for:
- Automatic keyword extraction
- Sentiment classification
- Theme clustering

### Response Management <!-- id:kpis.response.v1 -->

**MAY** track (if responses are supported):
- Response rate (% of reviews replied to)
- Average response time

**Note:** Response functionality is out of scope for MVP (see `scope@1.0.0#non-goals.v1`)

### Composite "Guest Satisfaction Index" <!-- id:kpis.satisfaction-index.v1 -->

**MAY** calculate composite score combining:
- Overall rating
- Sentiment score
- Category balance
- Response rate (if applicable)

**Purpose:** Quick benchmarking across properties

## 2A. Host-to-Guest Review KPIs (Guest Quality & Risk Management) <!-- id:kpis.host-to-guest.v1 -->

> **Scope:** Metrics for reviews FROM hosts ABOUT guests

### Overall Guest Rating Score <!-- id:kpis.guest-rating.v1 -->

**MUST** calculate:
- Average guest rating across all host-to-guest reviews for the property
- Period-over-period comparison
- **Distribution:** % of guests rated < 3 stars (high-risk guests)

**Display format:**
```ts
// purpose: types; id: types.kpi-guest-rating.v1; source: dashboard-metrics@1.0.0
interface GuestRatingKPI {
  current: number;          // e.g., 4.2
  previous: number;         // e.g., 4.5
  delta: number;            // e.g., -0.3 (negative = worse guests recently)
  trend: "up" | "down" | "stable";
  highRiskGuestRate: number; // % of guests rated < 3.0
}
```

### Guest Behavior Category Ratings <!-- id:kpis.guest-categories.v1 -->

**MUST** display average ratings for guest behaviors:
- **Cleanliness** — Condition of property after checkout
- **Respect for house rules** — Noise, smoking, parties, etc.
- **Communication** — Responsiveness during booking and stay
- **Honesty** — Accurate guest count, damage reporting
- **Check-out adherence** — Left on time, followed checkout instructions

**SHOULD** highlight:
- Categories below threshold (e.g., Cleanliness < 4.0)
- Recurring problematic behavior patterns

**Format:**
```ts
// purpose: types; id: types.guest-behavior-scores.v1; source: dashboard-metrics@1.0.0
interface GuestBehaviorScores {
  cleanliness: number;
  houseRules: number;
  communication: number;
  honesty: number;
  checkoutAdherence: number;
}
```

### Damage & Incident Tracking <!-- id:kpis.damage.v1 -->

**MUST** track:
- Total reported damages/incidents
- Damage cost (if available)
- Incident rate (incidents per 100 bookings)
- Repeat offender rate

**SHOULD** support:
- Tagging damage types (furniture, appliance, stains, etc.)
- Linking incidents to specific guests for screening

**Display:**
```ts
// purpose: types; id: types.damage-tracking.v1; source: dashboard-metrics@1.0.0
interface DamageTracking {
  totalIncidents: number;
  incidentRate: number;        // per 100 bookings
  totalCost: number;            // if tracked
  topDamageTypes: string[];     // ["furniture", "stains", "missing items"]
  repeatOffenderCount: number;  // guests with 2+ incidents
}
```

### Guest Source & Screening Effectiveness <!-- id:kpis.guest-source.v1 -->

**SHOULD** segment by booking channel:
- Direct bookings vs platform bookings (Airbnb, Booking.com, etc.)
- Average guest rating by channel
- Incident rate by channel

**Purpose:** Identify if certain channels attract lower-quality guests

**MAY** track:
- Guest screening criteria effectiveness
- Correlation: Guest's previous rating history → actual behavior
- "Do guests with < 4.0 rating cause more issues?"

### Host Expectation Calibration <!-- id:kpis.host-calibration.v1 -->

**SHOULD** provide diagnostic metrics:
- **Severity distribution:** How harsh are host reviews?
  - If most guests rated < 4.0 but property rating is high → Host may have unrealistic expectations
- **Comparison to portfolio average:** This property's guest ratings vs other properties
  - If ONE property consistently rates guests lower → Property-specific issue or host calibration needed

**Display:**
```ts
// purpose: types; id: types.host-calibration.v1; source: dashboard-metrics@1.0.0
interface HostCalibration {
  propertyGuestAverage: number;     // This property's avg guest rating
  portfolioGuestAverage: number;    // All properties' avg guest rating
  delta: number;                    // Difference
  insight: string;                  // e.g., "This property rates guests 0.8 stars lower than portfolio average"
}
```

### Guest Screening Risk Score <!-- id:kpis.screening-risk.v1 -->

**MAY** calculate composite risk score:
- Guest's historical ratings from other hosts
- Behavioral flags (cancellations, complaints, damages)
- Communication quality during booking
- Predictive score: "Likelihood of problematic stay"

**Purpose:** Pre-booking decision support

**Display:**
```ts
// purpose: types; id: types.guest-risk-score.v1; source: dashboard-metrics@1.0.0
interface GuestRiskScore {
  score: number;              // 0-100, higher = riskier
  riskLevel: "low" | "medium" | "high";
  flags: string[];            // ["Low cleanliness history", "2 damage reports"]
  recommendation: "Accept" | "Review carefully" | "Decline";
}
```

## 2B. Correlation & Cross-Analysis KPIs <!-- id:kpis.correlation.v1 -->

> **Scope:** Metrics combining BOTH review directions to identify systemic issues

### Property vs Guest Quality Matrix <!-- id:kpis.matrix.v1 -->

**MUST** categorize each property into quadrants:

| Guest-to-Host Rating | Host-to-Guest Rating | Interpretation | Action |
|---------------------|---------------------|----------------|--------|
| High (>4.5) | High (>4.5) | ✅ **Well-managed** | Maintain standards |
| High (>4.5) | Low (<4.0) | ⚠️ **Screening issue** | Review acceptance criteria |
| Low (<4.0) | High (>4.5) | ⚠️ **Property issue** | Fix property problems |
| Low (<4.0) | Low (<4.0) | 🚨 **Systemic failure** | Urgent intervention |

**Purpose:** Quick diagnostic for property health

### Problem Guest Pattern Detection <!-- id:kpis.problem-patterns.v1 -->

**SHOULD** identify:
- Properties that consistently attract low-rated guests
- Correlation between property amenities and guest quality
  - E.g., "Properties with party-friendly features attract riskier guests"
- Seasonal patterns (summer vs winter guest quality)

### Root Cause Analysis Support <!-- id:kpis.root-cause.v1 -->

**SHOULD** help managers answer:
- "Why is this property getting bad reviews?"
  - Check host-to-guest reviews: Are guests behaving poorly? → Screening issue
  - Check guest-to-host reviews: Valid complaints? → Fix property
- "Why are we getting so many problematic guests at Property X?"
  - Check listing description: Misleading?
  - Check pricing: Too low, attracting price-sensitive guests?
  - Check booking requirements: Too lenient?

## 3. Filters, Sorting, and Search <!-- id:filters.v1 -->

### Global Filters <!-- id:filters.global.v1 -->

**MUST** support filtering by:
- **Review direction** — Guest-to-Host, Host-to-Guest, Both
- **Date range** — Custom start/end dates
- **Property** — Single property or all properties
- **Rating** — Minimum rating threshold (e.g., "4+ stars")
- **Approval status** — Approved, Not Approved, All (for guest-to-host reviews)
- **Channel source** — Hostaway, Google, Direct, All

**SHOULD** support (Guest-to-Host specific):
- **Sentiment** — Positive, Neutral, Negative
- **Category threshold** — e.g., "Cleanliness < 8"

**SHOULD** support (Host-to-Guest specific):
- **Guest risk level** — High risk, Medium risk, Low risk, All
- **Damage incidents** — With damage, Without damage, All
- **Guest behavior issues** — Specific categories (house rules violations, cleanliness issues, etc.)
- **Guest source** — Platform (Airbnb, Booking.com) vs Direct bookings

**SHOULD** support (Cross-analysis):
- **Property health quadrant** — Well-managed, Screening issue, Property issue, Systemic failure (see Section 2B)

### Sorting Options <!-- id:filters.sorting.v1 -->

**MUST** allow sorting by:
- **Date** (newest first / oldest first)
- **Rating** (highest first / lowest first) — Toggle between guest-to-host or host-to-guest
- **Property name** (alphabetical)

**SHOULD** allow sorting by:
- **Weakest category** — Properties with lowest score in any category (guest-to-host)
- **Review count** — Most reviewed first
- **Guest risk score** — Highest risk first (for host-to-guest reviews)
- **Incident rate** — Most incidents first
- **Property health** — Systemic failure → Property issue → Screening issue → Well-managed

### Keyword Search <!-- id:filters.search.v1 -->

**SHOULD** support:
- Full-text search across review text (both directions)
- Common search terms (guest-to-host): "wifi", "parking", "noise", "clean", "location"
- Common search terms (host-to-guest): "damage", "party", "smoking", "late checkout", "dirty"
- Highlight matching terms in results
- Filter by review direction for targeted search

**Purpose:** Surface recurring issues quickly across both property and guest quality

## 4. Visualization <!-- id:visualization.v1 -->

### Time Series Charts <!-- id:visualization.time-series.v1 -->

**MUST** display:
- Average guest-to-host rating over time (line chart)
- Average host-to-guest rating over time (line chart)
- Supports portfolio view (all properties) or single property view
- **Dual-axis chart:** Show both ratings on same chart for correlation analysis

**Configuration:**
- X-axis: Time (monthly/quarterly buckets)
- Y-axis: Average rating (0-10 scale)
- Colors:
  - Guest-to-host: Primary brand color (#284E4C)
  - Host-to-guest: Secondary accent color (e.g., #D97706 orange)
- **Divergence indicator:** Highlight periods where ratings diverge significantly

### Rating Distribution Charts <!-- id:visualization.distribution.v1 -->

**MUST** display:
- Bar or pie chart of 1★–5★ distribution (separate for guest-to-host and host-to-guest)
- Shows percentage or count within selected date range
- **Side-by-side comparison:** Guest-to-host distribution vs Host-to-guest distribution
  - Helps identify: "Are we harsher on guests than they are on us?"

### Category Comparison Charts <!-- id:visualization.category-comparison.v1 -->

**MUST** support:
- **Single property**: Bar chart of category averages
  - X-axis: Categories (Cleanliness, Communication, etc.)
  - Y-axis: Average rating (0-10)
- **Cross-property**: Compare single category across properties
  - E.g., "Cleanliness scores for all properties"

### Category Trend Lines <!-- id:visualization.category-trends.v1 -->

**SHOULD** display:
- Line chart of category rating over time
- E.g., "Cleanliness trend over last 6 months"

### Comparative Charts <!-- id:visualization.comparative.v1 -->

**MAY** support:
- Scatter plot: Review count vs average rating
- Bubble chart: Property size comparison

### Bidirectional Correlation Charts <!-- id:visualization.bidirectional.v1 -->

**MUST** support:
- **Scatter plot:** Guest-to-host rating (X-axis) vs Host-to-guest rating (Y-axis)
  - Each property is a point
  - **Quadrant overlay:** Visual quadrants matching Section 2B matrix
  - Color-coded by health status (green/yellow/red)

**SHOULD** support:
- **Heat map:** Properties × Time showing property health status evolution
  - Columns: Time periods (months)
  - Rows: Properties
  - Cell color: Health quadrant (green/yellow/red)
  - **Purpose:** Spot properties declining over time

### Guest Risk Visualization <!-- id:visualization.guest-risk.v1 -->

**SHOULD** support:
- **Risk distribution chart:** % of guests by risk level (low/medium/high)
- **Incident timeline:** Track damage/incident occurrences over time
- **Guest behavior radar chart:** Multi-axis chart showing average scores for:
  - Cleanliness, House Rules, Communication, Honesty, Checkout Adherence

### Property Health Dashboard Widget <!-- id:visualization.health-widget.v1 -->

**MUST** include prominent dashboard widget:
- Large 2×2 grid showing property count in each quadrant
- Click to filter properties by quadrant
- **Example:**
  ```
  ┌─────────────────┬─────────────────┐
  │ Well-managed    │ Screening issue │
  │ ✅ 12 properties│ ⚠️ 3 properties │
  ├─────────────────┼─────────────────┤
  │ Property issue  │ Systemic failure│
  │ ⚠️ 2 properties │ 🚨 1 property   │
  └─────────────────┴─────────────────┘
  ```

### Color Cues <!-- id:visualization.color-cues.v1 -->

**SHOULD** use semantic colors:
- **Green** (#25D366) — Above target
- **Yellow** (#FFF9E9 background) — At target
- **Red** (rgba(255, 0, 0, 0.08) background) — Below target

## 5. Alerts & Flags <!-- id:alerts.v1 -->

**Note:** Automated alerts are out of scope for MVP. Manual review spotting **MUST** be supported via UI indicators.

### New Critical Review Alert (Guest-to-Host) <!-- id:alerts.critical-review.v1 -->

**MAY** flag guest-to-host reviews with:
- Rating < 3 (very low)
- Contains negative keywords ("dirty", "broken", "unsafe", "terrible")

### New Critical Guest Alert (Host-to-Guest) <!-- id:alerts.critical-guest.v1 -->

**SHOULD** flag host-to-guest reviews with:
- Guest rating < 3 (problematic guest)
- Contains damage/incident keywords ("damage", "broken", "party", "smoking", "police")
- **Action required:** Review for potential blacklist or stricter screening

### Category Threshold Alert <!-- id:alerts.category-threshold.v1 -->

**SHOULD** highlight:
- Any property category < configured target (e.g., Cleanliness < 8.0)
- Any guest behavior category < threshold (e.g., House Rules < 4.0)
- Visual indicator: Red background or warning icon

### Trend-shift Alert <!-- id:alerts.trend-shift.v1 -->

**MAY** detect:
- Guest-to-host rating drop > 0.5 stars in current period vs previous
- Host-to-guest rating drop > 0.5 stars (declining guest quality)
- Category score degradation in either direction

### Property Health Degradation Alert <!-- id:alerts.health-degradation.v1 -->

**SHOULD** flag properties that:
- Move from "Well-managed" → "Screening issue" or "Property issue" quadrant
- Experience divergence between guest-to-host and host-to-guest ratings
- **Visual:** Timeline annotation showing when degradation occurred

### High-Risk Guest Pattern Alert <!-- id:alerts.risk-pattern.v1 -->

**MAY** detect:
- Single property consistently attracting low-rated guests (> 20% of guests rated < 3.5)
- Spike in damage incidents at specific property
- **Recommended action:** Review listing description, pricing, or screening criteria

## 6. Review Management & Public Display <!-- id:review-management.v1 -->

### Review List Display <!-- id:review-management.list.v1 -->

**MUST** show per review:
- Review text (publicReview)
- Overall rating
- Sub-ratings (category breakdown)
- Channel/source
- Submission date
- Guest name (if available)

### Show/Hide Toggle <!-- id:review-management.approval.v1 -->

**MUST** implement:
- Toggle button per review: "Approved for Website"
- Default state: **false** (new reviews hidden until approved)
- Visual indicator: Green checkmark (approved) or gray circle (not approved)

**SHOULD** support:
- Bulk approval actions (e.g., "Approve all 5★ reviews")
- Configurable auto-approval rules (future enhancement)

### Owner/Team Sharing <!-- id:review-management.sharing.v1 -->

**MAY** support:
- Copy review text to clipboard
- Export selected reviews to CSV
- Share review permalink with team

**Purpose:** Training, recognition, or issue escalation

## 7. Exports & Reporting <!-- id:exports.v1 -->

**Note:** Advanced reporting is out of scope for MVP. Basic export **MAY** be included.

### Data Export <!-- id:exports.data.v1 -->

**MAY** support:
- CSV export of filtered review list
- Includes all fields (ratings, text, metadata)

### PDF Report <!-- id:exports.pdf.v1 -->

**MAY** generate:
- Monthly/quarterly summary report
- Includes: KPIs, charts, top reviews

### Scheduled Email Reports <!-- id:exports.scheduled.v1 -->

**Out of scope** — Future enhancement

## 8. Mobile & Usability <!-- id:usability.v1 -->

### Responsive Design <!-- id:usability.responsive.v1 -->

**MUST** support:
- Phone (< 768px): Single column, stacked layout
- Tablet (768px - 1024px): Two-column grid
- Desktop (> 1024px): Full dashboard layout with sidebar

### Familiar UI Patterns <!-- id:usability.patterns.v1 -->

**SHOULD** use:
- Standard table interactions (sortable headers, row selection)
- Filter chips (removable pills)
- Clear visual hierarchy (headings, spacing, borders)

**Reference:** See `design-system@1.0.0` for component patterns

## 9. Turning Insights into Action (Workflows) <!-- id:workflows.v1 -->

### Guest Screening Workflow (Pre-Booking) <!-- id:workflows.guest-screening.v1 -->

**MUST** support pre-booking decision flow:

1. **Booking inquiry received**
2. **Dashboard lookup:** Search guest by name/email or platform ID
3. **Risk assessment display:**
   - Guest's historical rating from other hosts
   - Damage/incident history
   - Behavioral flags (if any)
   - Automatic risk score
4. **Decision support:**
   - **Low risk (>4.5 avg):** Auto-approve or quick accept
   - **Medium risk (3.5-4.5):** Manual review recommended
   - **High risk (<3.5):** Show specific concerns, suggest decline or require deposit
5. **Override capability:** Manager can accept despite risk score with note

**Purpose:** Prevent problematic guests proactively

### Post-Stay Guest Review Workflow <!-- id:workflows.guest-review.v1 -->

**SHOULD** streamline host-to-guest review submission:

1. **After checkout:** Dashboard prompts for guest review
2. **Pre-filled template:** Common categories (cleanliness, rules, communication)
3. **Incident linking:** If damage reported during stay, auto-attach to review
4. **Severity tagging:** Flag as "Would host again" / "Acceptable" / "Do not rebook"
5. **Automatic sync:** Push review to platform (Airbnb, etc.) if integrated

**Purpose:** Build comprehensive guest history for future screening

### Recurring Theme Detection <!-- id:workflows.themes.v1 -->

**SHOULD** help managers:
- Identify recurring keywords in guest-to-host reviews (e.g., "noise", "wifi", "cleanliness")
- Identify recurring issues in host-to-guest reviews (e.g., "late checkout", "smoking", "damage")
- Group reviews by theme
- Prioritize action based on frequency

### Category-driven Actioning <!-- id:workflows.category-action.v1 -->

**Workflow:**
1. Manager spots low category score (e.g., Cleanliness = 7.5)
2. Filters reviews by that category
3. Reads related comments
4. Assigns fixes to property team (manual process)

### Before/After Tracking <!-- id:workflows.before-after.v1 -->

**SHOULD** allow:
- Compare metrics before/after intervention
- E.g., "Cleanliness rating before/after deep clean schedule change"

### Benchmarking <!-- id:workflows.benchmarking.v1 -->

**SHOULD** enable:
- Spot underperforming properties vs portfolio average
- Compare to market analogs (if external data available)
- **Bidirectional benchmarking:** Compare both guest-to-host AND host-to-guest metrics

### Root Cause Diagnosis Workflow <!-- id:workflows.root-cause.v1 -->

**MUST** support diagnostic flow for poor performance:

**Scenario: Property has low guest-to-host rating**
1. Check property health quadrant
2. **If also high host-to-guest complaints:**
   - **Diagnosis:** Screening issue (wrong guests)
   - **Action:** Tighten booking criteria, review pricing, check listing accuracy
3. **If host-to-guest ratings are good:**
   - **Diagnosis:** Legitimate property issues
   - **Action:** Fix property problems (cleanliness, maintenance, amenities)

**Scenario: Property consistently attracts problematic guests**
1. Review listing description for misleading language
2. Check pricing vs market (too low attracts budget guests?)
3. Review booking requirements (instant book enabled? minimum stay?)
4. Check historical patterns (seasonal? specific platforms?)

**Purpose:** Systematic problem-solving instead of guesswork

### Property Health Recovery Workflow <!-- id:workflows.recovery.v1 -->

**SHOULD** guide managers through recovery process:

1. **Identify issue:** Dashboard flags property moving to worse quadrant
2. **Diagnose root cause:** Use correlation analysis (see above workflow)
3. **Create action plan:**
   - Property issue → Maintenance/upgrade plan
   - Screening issue → Update booking criteria
   - Both → Comprehensive intervention
4. **Track progress:**
   - Set target date
   - Monitor rating trends weekly
   - Compare before/after metrics
5. **Verify recovery:** Property moves back to "Well-managed" quadrant

**Purpose:** Structured recovery with measurable outcomes

### Guest Blacklist/Watchlist Management <!-- id:workflows.blacklist.v1 -->

**MAY** support:
- **Blacklist:** Guests who should never be accepted again
  - Criteria: Damage >$X, police involvement, safety issues
  - Automatic rejection if they attempt to rebook
- **Watchlist:** Guests requiring extra scrutiny
  - Criteria: Rating < 3.5, previous minor issues
  - Require manager approval + security deposit
- **Review cycle:** Quarterly review of watchlist (guests may improve over time)

## 10. Motivation & Team Enablement <!-- id:motivation.v1 -->

### Recognition <!-- id:motivation.recognition.v1 -->

**MAY** include:
- "Top Rated Property this Month" badge
- Leaderboard (optional, if multiple properties)

### Shareable Praise/Complaints <!-- id:motivation.sharing.v1 -->

**SHOULD** support:
- Export positive reviews for recognition
- Flag negative reviews for coaching

### Goal Tracking <!-- id:motivation.goals.v1 -->

**MAY** track:
- Target goals (e.g., "Raise Cleanliness from 8.5 → 9.0 next quarter")
- Progress indicator on dashboard
- Historical goal achievement

## Data Model Sketch (for clarity) <!-- id:data-model-sketch.v1 -->

**Reference:** See `architecture@1.0.0#data-model.v1` for full schema.

**Minimal entities:**

```prisma
// purpose: schema; id: schema.dashboard-entities.v1; source: dashboard-metrics@1.0.0

model Property {
  id                    String   @id @default(cuid())
  name                  String
  location              String?
  guestToHostReviews    Review[] @relation("PropertyReviews")
  hostToGuestReviews    Review[] @relation("GuestReviews")

  // Booking configuration
  minStayNights         Int?
  requireDeposit        Boolean  @default(false)
  instantBookEnabled    Boolean  @default(true)
  acceptanceRate        Float?   // % of bookings accepted
}

model Guest {
  id                    String   @id @default(cuid())
  name                  String
  email                 String?
  platformId            String?  // External ID from Airbnb, Booking.com, etc.
  platform              String?  // "airbnb", "booking.com", etc.

  reviews               Review[] @relation("GuestReviews")
  incidents             Incident[]

  // Risk scoring
  averageRating         Float?
  totalStays            Int      @default(0)
  riskScore             Float?   // 0-100
  riskLevel             String?  // "low", "medium", "high"

  // Blacklist management
  isBlacklisted         Boolean  @default(false)
  isWatchlisted         Boolean  @default(false)
  blacklistReason       String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Review {
  id                    String   @id @default(cuid())

  // Core fields
  direction             String   // "guest-to-host" or "host-to-guest"
  date                  DateTime
  channel               String   // "hostaway", "google", "direct", etc.
  rating                Float?
  text                  String

  // Relationships
  propertyId            String
  property              Property @relation("PropertyReviews", fields: [propertyId], references: [id])

  guestId               String?
  guest                 Guest?   @relation("GuestReviews", fields: [guestId], references: [id])

  // Guest-to-Host specific (reviews OF properties)
  guestToHostSubRatings Json?    // { cleanliness: 9, communication: 10, location: 8, value: 9 }
  sentimentScore        Float?
  keywords              Json?    // ["wifi", "clean", "helpful"]
  isPublished           Boolean  @default(false)  // For public website display

  // Host-to-Guest specific (reviews OF guests)
  hostToGuestBehaviorRatings Json?  // { cleanliness: 8, houseRules: 9, communication: 10, honesty: 9, checkoutAdherence: 8 }
  wouldHostAgain        Boolean?
  incidentReported      Boolean  @default(false)

  // Response management
  responseText          String?
  respondedAt           DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Incident {
  id                    String   @id @default(cuid())

  guestId               String
  guest                 Guest    @relation(fields: [guestId], references: [id])

  propertyId            String

  date                  DateTime
  type                  String   // "damage", "noise_complaint", "rule_violation", "police_involved", etc.
  description           String
  cost                  Float?   // Damage cost if applicable
  resolved              Boolean  @default(false)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

**Derived metrics** (calculated in application):

**Guest-to-Host metrics:**
- `overallRating`: Average of all guest-to-host reviews
- `categoryAverages`: Average per category (cleanliness, communication, etc.)
- `ratingDistribution`: Count per star rating
- `trends`: Time-series data
- `responseRate`: % of reviews with response
- `avgResponseTime`: Average time to respond
- `satisfactionIndex`: Composite score

**Host-to-Guest metrics:**
- `guestRatingAverage`: Average of all host-to-guest reviews
- `guestBehaviorAverages`: Average per behavior category
- `incidentRate`: Incidents per 100 bookings
- `highRiskGuestRate`: % of guests rated < 3.0
- `damageRate`: % of stays with damage
- `averageDamageCost`: Average cost when damage occurs

**Correlation metrics:**
- `propertyHealthQuadrant`: "well-managed" | "screening-issue" | "property-issue" | "systemic-failure"
- `ratingDivergence`: abs(guestToHostAvg - hostToGuestAvg)
- `correlationScore`: Statistical correlation between both ratings (-1 to 1)

**Guest risk scoring:**
- `guestRiskScore`: Calculated from historical ratings, incidents, flags
- `guestRiskLevel`: "low" (>4.5) | "medium" (3.5-4.5) | "high" (<3.5)

## References <!-- id:references.v1 -->

| ref | target | purpose |
|-----|--------|---------|
| R1 | `scope@1.0.0#actors.manager.v1` | Manager user requirements |
| R2 | `architecture@1.0.0#data-model.v1` | Database schema details |
| R3 | `design-system@1.0.0` | UI component specifications |
| R4 | `architecture@1.0.0#api-contracts.v1` | API endpoint definitions |
