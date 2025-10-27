---
title: "Threshold Display UX Research"
role: "research"
version: "1.0.0"
status: "stable"
owner: "tomas@theflex.global"
last_updated: "2025-10-27"
doc_id: "threshold-display-ux@1.0.0"
---

# Threshold Display UX: Tooltips vs Info Panels

## Research Question

How should we display property health thresholds (4.7, 4.5, 4.0) in the Flex Living property management dashboard?

## Research Summary (October 27, 2025)

### Sources
- Nielsen Norman Group (NN/G) - Dashboard design principles
- Smashing Magazine - Real-time dashboard UX strategies (2025)
- UXPin, DesignRush, Chameleon - Contextual help patterns
- Multiple UX design best practice guides (2025)

## Key Findings

### 1. Tooltips - On-Demand Explanations

**Best for:**
- ✅ Brief context (1-2 sentences)
- ✅ Immediate rationale ("Why is this red?")
- ✅ Space-constrained areas
- ✅ Hover-triggered information
- ✅ Definitions and quick explanations

**Nielsen Norman Group:**
> "Interactive tooltips ensure visual transparency by explaining the rationale behind alerts and flagged data points, giving users immediate context such as why a lab value is marked critical."

**2025 Dashboard UX Consensus:**
> "Use interactive elements like tooltips or drill-downs to provide additional information on demand, rather than displaying everything upfront."

### 2. Info Panels - Progressive Disclosure

**Best for:**
- ✅ Substantial secondary information
- ✅ Educational content requiring multiple paragraphs
- ✅ Complex threshold tables/comparisons
- ✅ Reference material users may revisit
- ✅ Collapsible sections that reduce clutter

**Progressive Disclosure Principle:**
> "The most critical data points should be placed at the top of the dashboard, while secondary metrics and supporting information should be positioned below or within interactive panels that users can expand as needed."

### 3. Cognitive Load Management

**Nielsen Norman Group Definition:**
> "Cognitive load is the sense of intimidation that a user often feels when presented with large amounts of data all at once. Information should be presented in a simple way that can be read and understood at a glance."

**Implication:**
- Persistent information panels increase cognitive load
- On-demand patterns (tooltips, expandable sections) reduce overwhelm
- Users prefer "pull" (I request info) over "push" (forced info display)

### 4. Property Management Dashboard Specifics

**Domain-Specific Needs:**
- Property managers need **actionable insights** at a glance
- Thresholds should explain **why** action is needed, not just **what** the numbers are
- Context must be **immediately accessible** without disrupting workflow

**Visual Hierarchy:**
- Primary: Property health status (color-coded badges)
- Secondary: Brief explanation (tooltip on hover)
- Tertiary: Full threshold reference (collapsible panel or legend)

## Recommendation: Hybrid Approach

### Option A: Tooltips + Collapsible Legend (Recommended)

**Implementation:**
1. **Color-coded badges** with health status visible by default
2. **Tooltips on hover** showing brief rationale
3. **Collapsible "Understanding Health Status" panel** at dashboard top
4. **Inline help icons** (ⓘ) next to metric headers

**Example Tooltip:**
```
🟢 Well-Managed
Property: 4.8/5.0 (Excellent, Superhost tier)
Guests: 4.6/5.0 (High quality)
```

**Example Collapsible Panel:**
```
📊 Health Status Guide (click to expand)

Based on industry research (Airbnb, Booking.com):

✅ Well-Managed (Green)
  Property ≥4.7 + Guests ≥4.5
  Action: Maintain standards, showcase reviews

⚠️ Screening Issue (Orange)
  Property ≥4.7 + Guests <4.5
  Action: Review guest acceptance criteria

[... full table ...]
```

### Why This Works

✅ **Reduces cognitive load** - Info hidden by default
✅ **On-demand access** - Users choose when to learn
✅ **Progressive disclosure** - Basic → Detailed as needed
✅ **Persistent reference** - Collapsible panel stays available
✅ **Immediate context** - Tooltips for quick "why is this X?"

### Alternative: Persistent Legend (Not Recommended)

**Why not:**
- ❌ Increases visual clutter
- ❌ Takes up valuable dashboard real estate
- ❌ Users ignore persistent info after initial view
- ❌ Reduces space for actionable data

**When it's acceptable:**
- Dashboard has abundant whitespace
- Legend is very minimal (2-3 items max)
- Users are new and need constant reference

## Implementation Plan

### Phase 1: Tooltips (Quick Win)
1. Add tooltips to health status badges
2. Show threshold + brief rationale
3. Use consistent format across all views

### Phase 2: Collapsible Legend (Enhanced)
1. Add expandable panel at top of dashboard
2. Full threshold table with research sources
3. "Learn more" links to rating-thresholds-research.md

### Phase 3: Contextual Help Icons (Polish)
1. Add (ⓘ) icons next to KPI headers
2. Tooltips explain "Property Rating" vs "Guest Quality"
3. Link to help docs

## UI Components to Update

| Component | Pattern | Priority |
|-----------|---------|----------|
| City health badges | Tooltip on hover | P0 |
| Property health badges | Tooltip on hover | P0 |
| Dashboard KPI cards | Help icon with tooltip | P1 |
| Collapsible legend | Expandable panel | P1 |
| Property detail view | Inline explanation text | P2 |

## Tooltip Content Template

### Format:
```
[Icon] [Status Name]
Property: [X.X]/5.0 ([Benchmark])
Guests: [X.X]/5.0 ([Benchmark])
Action: [Brief recommendation]
```

### Examples:

**Well-Managed:**
```
✅ Well-Managed
Property: 4.8/5.0 (Superhost tier)
Guests: 4.7/5.0 (Excellent)
Action: Maintain standards
```

**Screening Issue:**
```
⚠️ Screening Issue
Property: 4.8/5.0 (Excellent)
Guests: 4.2/5.0 (Below baseline)
Action: Review guest acceptance criteria
```

**Needs Improvement:**
```
🔍 Needs Improvement
Property: 4.3/5.0 (Below premium tier)
Guests: 4.6/5.0 (Good)
Action: Work toward ≥4.7 rating
```

## References

1. Nielsen Norman Group - "Dashboards: Making Charts and Graphs Easier to Understand"
2. Smashing Magazine - "From Data To Decisions: UX Strategies For Real-Time Dashboards" (2025)
3. Chameleon - "Top 8 UX Patterns to Deliver Contextual Help Within Your Product"
4. UXPin - "Effective Dashboard Design Principles for 2025"

## Next Steps

1. ✅ Choose hybrid approach (tooltips + collapsible legend)
2. ⏳ Implement tooltips on all health badges
3. ⏳ Add collapsible "Health Status Guide" panel
4. ⏳ Test with property managers (if possible)
5. ⏳ Iterate based on usage patterns

---

**Decision:** Implement **Hybrid Approach** (Tooltips + Collapsible Legend)
**Rationale:** Balances immediate context with comprehensive reference, follows 2025 UX best practices, reduces cognitive load
