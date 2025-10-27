---
title: "Product Scope & Requirements"
role: "source-of-truth"
version: "1.0.0"
status: "stable"
owner: "tomas@theflex.global"
last_updated: "2025-10-26"
doc_id: "scope@1.0.0"
depends_on: []
provides:
  - "product.vision"
  - "product.actors"
  - "product.surfaces"
  - "success.criteria"
out_of_scope:
  - "authentication"
  - "authorization"
  - "owner reports"
  - "review editing"
  - "review replies"
change_policy: "minor: clarifications; major: scope changes"
---

# Flex Living Reviews Dashboard – Product Scope <!-- id:title.v1 -->

> Source alignment: Build a Reviews Dashboard for Flex Living to help managers assess property performance based on guest reviews.

## 1. Purpose <!-- id:purpose.v1 -->

This document defines the **product scope** for the Flex Living Reviews Dashboard, including:
- Target users (actors)
- Surfaces (what we're building)
- Core data model
- Success criteria
- Explicit non-goals

## 2. Actors / Users <!-- id:actors.v1 -->

### Manager (internal user) <!-- id:actors.manager.v1 -->

**Needs:**
- **MUST** understand how each property is performing
- **MUST** spot issues fast (cleanliness, communication, etc.)
- **MUST** approve which reviews appear publicly
- **SHOULD** filter/sort reviews by rating, category, channel, and time

**Context:**
- Internal/trusted user
- No authentication required for demo
- Single-role access pattern

### Prospect / Guest (public user) <!-- id:actors.guest.v1 -->

**Needs:**
- **MUST** see only approved, high-quality reviews
- **SHOULD** see reviews that reinforce brand quality
- **MUST NOT** see unapproved or low-quality reviews

**Context:**
- Browsing Flex Living property pages
- Read-only access
- Public-facing surface

## 3. Surfaces (What We're Building) <!-- id:surfaces.v1 -->

### A. Manager Dashboard (internal/admin surface) <!-- id:surfaces.dashboard.v1 -->

**Core abilities (MVP):**
- **MUST** view all properties with performance indicators
- **MUST** filter by rating, category, channel, and time range
- **MUST** sort reviews by various criteria
- **MUST** spot trends or recurring issues
- **MUST** toggle "Approved for website" per review
- **MUST** display source/channel, text, and category ratings per review

**Stretch / differentiator:**
- **MAY** include AI Insights panel per property
- **MAY** summarize: top recurring complaints, positive highlights, trend warnings

### B. Public Property Page Reviews Section (customer-facing surface) <!-- id:surfaces.public.v1 -->

**Requirements:**
- **MUST** replicate the Flex Living website property details layout
- **MUST** display only `approvedForWebsite === true` reviews
- **MUST** match Flex Living brand styling
- **SHOULD** show 4-6 most recent approved reviews
- **MAY** include "Show all reviews" expansion

**Implementation:**
- React component on property detail page
- Fetch reviews with approval filter
- Style with Flex Living design tokens (see `design-system@1.0.0`)

## 4. Key Data Concepts <!-- id:data-concepts.v1 -->

### Normalized Review (canonical internal shape) <!-- id:data-concepts.normalized-review.v1 -->

```ts
// purpose: types; id: types.normalized-review.v1; source: scope@1.0.0
export interface NormalizedReview {
  id: string;
  source: "hostaway" | "google" | "other";
  listingName: string;
  guestName?: string;
  submittedAt: string; // ISO 8601 timestamp
  channel?: string;
  overallRating?: number;
  categories: Array<{ category: string; rating: number }>;
  publicReview: string;
  approvedForWebsite: boolean;
}
```

**Schema notes:**
- `source`: Indicates review origin (Hostaway, Google, etc.)
- `listingName`: Property identifier from source API
- `approvedForWebsite`: Default `false`, manager toggles to `true`
- `categories`: Array of rating breakdowns (cleanliness, communication, etc.)

## 5. Success Criteria <!-- id:success-criteria.v1 -->

**Technical:**
- **MUST** `/api/reviews/hostaway` return normalized data
- **MUST** dashboard support filtering and approval toggles
- **MUST** public page display only approved reviews
- **MUST** handle edge cases (null ratings, missing names)

**Product:**
- **MUST** clean, intuitive UI consistent with Flex Living brand
- **SHOULD** AI Insights panel differentiate solution
- **MAY** include Google Reviews findings documentation

**Delivery:**
- **MUST** be deployable to Vercel with zero config
- **MUST** run locally with `npm install && npm run dev`
- **SHOULD** include basic test coverage for normalization

## 6. Non-goals <!-- id:non-goals.v1 -->

**Explicitly out of scope for this assessment:**
- ❌ Authentication / RBAC (trusted internal demo)
- ❌ Owner reports / exports (not in assessment requirements)
- ❌ Alerts / notifications (future enhancement)
- ❌ Editing reviews (read-only from sources)
- ❌ Replies to reviews (not requested)
- ❌ Multi-language support
- ❌ Mobile app (web only)

## 7. Guiding Principles <!-- id:principles.v1 -->

1. **Think like a PM and engineer** – Balance product vision with technical feasibility
2. **Prioritize clarity and delivery speed** – Simple, working solution over complex architecture
3. **Use Next.js monolith for simplicity** – Avoid microservices complexity
4. **Keep infra cheap and scalable** – Free tier Vercel + SQLite locally
5. **Focus on code quality** – This is an assessment, not a production deployment

## 8. Dependencies <!-- id:dependencies.v1 -->

This document references:
- Data model details → `architecture@1.0.0#data-model.v1`
- UI specifications → `design-system@1.0.0`
- API contracts → `architecture@1.0.0#api-contracts.v1`
- Dashboard metrics → `dashboard-metrics@1.0.0`

## References <!-- id:references.v1 -->

| ref | target | purpose |
|-----|--------|---------|
| R1 | `dashboard-metrics@1.0.0` | Detailed feature requirements |
| R2 | `architecture@1.0.0` | Technical implementation |
| R3 | `design-system@1.0.0` | UI/UX specifications |

