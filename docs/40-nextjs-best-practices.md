---
title: "Next.js Best Practices & Implementation Guide"
role: "source-of-truth"
version: "1.0.0"
status: "stable"
owner: "tomas@theflex.global"
last_updated: "2025-10-26"
doc_id: "nextjs-best-practices@1.0.0"
depends_on:
  - "architecture@1.0.0"
  - "scope@1.0.0"
provides:
  - "patterns.nextjs"
  - "patterns.validation"
  - "patterns.testing"
  - "patterns.server-actions"
out_of_scope:
  - "react native patterns"
  - "webpack configuration"
change_policy: "minor: pattern updates; major: framework version changes"
---

# Next.js Best Practices – Flex Living Reviews Dashboard <!-- id:title.v1 -->

**Goal:** Provide consistent engineering standards for building a maintainable, scalable Next.js monolith.

---

## 1. Project Setup <!-- id:project-setup.v1 -->

### Recommended Config <!-- id:project-setup.config.v1 -->

**MUST** use:
- Framework: **Next.js 15+ (App Router)**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- ORM: **Prisma**
- DB: **SQLite (local), Postgres (prod)**

**SHOULD** include:
- Package Manager: **npm or pnpm**
- Linting: **ESLint + Prettier**
- Version Control: **GitHub**
- Deploy: **Vercel or GCP Cloud Run**

```bash
# purpose: setup; id: setup.init.v1; source: nextjs-best-practices@1.0.0
npx create-next-app@latest flex-reviews --typescript --tailwind
npm install @prisma/client prisma
npm install lucide-react recharts
```

---

## 2. Folder Structure <!-- id:folder-structure.v1 -->

**MUST** use the App Router for modern conventions:

```text
/app
  /dashboard
    page.tsx
  /api
    /reviews
      /hostaway
        route.ts
  /public
    /PropertyReviews
      page.tsx
/components
  KPISection.tsx
  ReviewTable.tsx
  AIInsightsPanel.tsx
/lib
  normalize.ts
  insights.ts
/prisma
  schema.prisma
/docs
  *.md
```

**Rules:**
- ✅ Keep `/lib` for business logic and pure functions
- ✅ Keep `/components` for UI only (no data fetching inside unless via hooks)
- ✅ Use `/api` for all server-side data ops

---

## 3. Data Handling <!-- id:data-handling.v1 -->

**MUST**:
- Always **normalize external data** before using in UI
- Return typed responses in API routes
- Handle missing/null gracefully (no crashes on undefined)
- Use **TypeScript interfaces** for consistent contracts between layers

**Example:**

```ts
// purpose: types; id: types.normalized-review.v1; source: nextjs-best-practices@1.0.0
export interface NormalizedReview {
  id: string;
  source: string;
  listingName: string;
  guestName?: string;
  submittedAt: string;
  overallRating?: number;
  categories: { category: string; rating: number }[];
  publicReview: string;
  approvedForWebsite: boolean;
}
```

---

## 3.5. Data Validation with Zod <!-- id:data-validation.v1 -->

**Oct 2025 Best Practice**: **MUST** use Zod for runtime type validation at all API boundaries.

### Why Zod? <!-- id:data-validation.why-zod.v1 -->

- ✅ Runtime type safety (TypeScript only validates at compile time)
- ✅ Automatic type inference (no duplicate type definitions)
- ✅ Clear error messages for debugging
- ✅ Parse, validate, and transform in one step
- ✅ Industry standard for Next.js apps

### Installation <!-- id:data-validation.installation.v1 -->

```bash
# purpose: setup; id: setup.zod.v1; source: nextjs-best-practices@1.0.0
npm install zod
```

### Schema Definition <!-- id:data-validation.schema-definition.v1 -->

```ts
// purpose: schema; id: schema.validation.v1; source: nextjs-best-practices@1.0.0
// lib/schemas.ts
import { z } from 'zod';

// Raw Hostaway API response schema
export const RawHostawayReviewSchema = z.object({
  id: z.number(),
  type: z.string(),
  status: z.string(),
  rating: z.number().nullable(),
  publicReview: z.string(),
  reviewCategory: z.array(
    z.object({
      category: z.string(),
      rating: z.number().min(0).max(10),
    })
  ),
  submittedAt: z.string(),
  guestName: z.string().optional(),
  listingName: z.string(),
  channel: z.string().optional(),
});

// Normalized internal schema
export const NormalizedReviewSchema = z.object({
  id: z.string().cuid(),
  source: z.enum(['hostaway', 'google']),
  listingName: z.string().min(1),
  guestName: z.string().optional(),
  submittedAt: z.string().datetime(), // ISO 8601 format
  channel: z.string().optional(),
  overallRating: z.number().min(0).max(10).optional(),
  categories: z.array(
    z.object({
      category: z.string(),
      rating: z.number().min(0).max(10),
    })
  ),
  publicReview: z.string().min(1),
  approvedForWebsite: z.boolean(),
});

// TypeScript types derived from schemas (single source of truth)
export type RawHostawayReview = z.infer<typeof RawHostawayReviewSchema>;
export type NormalizedReview = z.infer<typeof NormalizedReviewSchema>;
```

### Usage in API Routes <!-- id:data-validation.usage-api.v1 -->

```ts
// purpose: example; id: example.api-validation.v1; source: nextjs-best-practices@1.0.0
// app/api/reviews/hostaway/route.ts
import { NextResponse } from 'next/server';
import { RawHostawayReviewSchema, NormalizedReviewSchema } from '@/lib/schemas';
import { normalizeHostawayReview } from '@/lib/normalize';
import mockData from '@/lib/data/mock-hostaway-reviews';

export async function GET() {
  try {
    // Step 1: Validate raw input
    const validatedRaw = RawHostawayReviewSchema.array().parse(mockData);

    // Step 2: Normalize
    const normalized = validatedRaw.map(normalizeHostawayReview);

    // Step 3: Validate output
    const validatedOutput = NormalizedReviewSchema.array().parse(normalized);

    return NextResponse.json(validatedOutput);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Detailed validation errors
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 4. API Routes vs Server Actions <!-- id:api-routes-vs-server-actions.v1 -->

**Oct 2025 Pattern**: **MUST** use Server Actions for mutations, API Routes only for external endpoints.

### When to Use API Routes <!-- id:api-routes-vs-server-actions.when-api.v1 -->

✅ **Use API Routes for:**
- External-facing endpoints (webhooks, third-party integrations)
- Required assessment endpoints (e.g., `/api/reviews/hostaway`)
- Non-HTML responses (JSON, XML, CSV downloads)

❌ **Do NOT use API Routes for:**
- Form submissions → Use Server Actions
- Database mutations → Use Server Actions
- Internal app logic → Use Server Actions

### Server Actions (Preferred for Mutations) <!-- id:api-routes-vs-server-actions.server-actions.v1 -->

**What are Server Actions?**
- Functions marked with `'use server'`
- Run on server only
- Type-safe (no manual API contract)
- Automatic revalidation

**Example: Approval Toggle**

```tsx
// purpose: example; id: example.server-action.v1; source: nextjs-best-practices@1.0.0
// app/dashboard/actions.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ApprovalSchema = z.object({
  reviewId: z.string(),
  approved: z.boolean(),
});

export async function approveReview(reviewId: string, approved: boolean) {
  // Validate input
  const { reviewId: validId, approved: validApproved } = ApprovalSchema.parse({
    reviewId,
    approved,
  });

  // Update database
  await db.review.update({
    where: { id: validId },
    data: { approvedForWebsite: validApproved },
  });

  // Revalidate dashboard
  revalidatePath('/dashboard');

  return { success: true };
}
```

**Using Server Actions in Client Components:**

```tsx
// purpose: example; id: example.client-server-action.v1; source: nextjs-best-practices@1.0.0
// components/client/ApprovalToggle.tsx
'use client';

import { approveReview } from '@/app/dashboard/actions';
import { useTransition } from 'react';

export function ApprovalToggle({ reviewId, initialState }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await approveReview(reviewId, !initialState);
    });
  };

  return (
    <button onClick={handleToggle} disabled={isPending}>
      {isPending ? 'Saving...' : initialState ? '✓ Approved' : '○ Not Approved'}
    </button>
  );
}
```

---

## 5. Component Architecture <!-- id:component-architecture.v1 -->

**MUST** keep components small, functional, and typed.

| Component | Responsibility |
|------------|----------------|
| `KPISection` | Displays top-level stats |
| `FiltersBar` | Provides filters and sorting |
| `ReviewTable` | Displays reviews, toggles approval |
| `AIInsightsPanel` | Shows AI-generated insights |
| `TrendBadge` | Displays delta indicators |

### Rules <!-- id:component-architecture.rules.v1 -->

- **MUST** avoid prop drilling → use context or hooks if state shared
- **MUST** keep server components for static data, client components for interactivity
- **MAY** use React Query or SWR if you need caching/fetch control

---

## 6. Styling Practices <!-- id:styling-practices.v1 -->

**MUST**:
- Use **Tailwind CSS** with tokens from `design-system@1.0.0`
- Keep a `globals.css` for base resets
- Use consistent spacing: `gap-6`, `p-4`, etc.
- Use semantic HTML: `section`, `header`, `table`, `article`

### Example Class Patterns <!-- id:styling-practices.example.v1 -->

```tsx
// purpose: example; id: example.styling.v1; source: nextjs-best-practices@1.0.0
<div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
  <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
  <p className="text-3xl font-bold text-primary">9.3</p>
</div>
```

---

## 7. State Management & Data Fetching <!-- id:state-management.v1 -->

**Oct 2025 Best Practice**: Server Components + Server Actions (no client-side data fetching libraries needed).

### Data Fetching Strategy <!-- id:state-management.data-fetching.v1 -->

**Default: Server Components with direct data access**

```tsx
// purpose: example; id: example.server-data-fetching.v1; source: nextjs-best-practices@1.0.0
// app/dashboard/page.tsx (Server Component)
import { db } from '@/lib/db';

export default async function DashboardPage({ searchParams }) {
  // Direct database query - runs on server only
  const reviews = await db.review.findMany({
    where: {
      // Apply filters from URL params
      overallRating: searchParams.rating ? { gte: Number(searchParams.rating) } : undefined,
    },
    orderBy: { submittedAt: 'desc' }
  });

  return <ReviewTable reviews={reviews} />;
}
```

**Benefits:**
- ✅ Zero JavaScript for data fetching
- ✅ No loading states (data ready on server)
- ✅ Better SEO and performance
- ✅ No API route overhead

### Filters: Use URL Search Params <!-- id:state-management.filters.v1 -->

```tsx
// purpose: example; id: example.url-filters.v1; source: nextjs-best-practices@1.0.0
// components/client/FiltersBar.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function FiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <button onClick={() => updateFilter('rating', '8')}>
        8+ Rating
      </button>
    </div>
  );
}
```

**Why URL params:**
- ✅ Shareable filter state
- ✅ Browser back/forward works
- ✅ Server Components can read directly

---

## 7.5. Server vs Client Components (Critical) <!-- id:server-vs-client.v1 -->

**Rule #1: Default to Server Components. Only use `'use client'` when absolutely necessary.**

In Next.js 15 (App Router), all components are Server Components by default unless you add the `'use client'` directive.

### Server Components (Default) <!-- id:server-vs-client.server.v1 -->

**What they are:**
- React components that render **only on the server**
- HTML sent to client (zero JavaScript by default)
- Can directly access databases, file systems, server-only APIs

**Use Server Components for:**
- ✅ Data fetching
- ✅ Accessing backend resources (databases, APIs)
- ✅ Rendering static content
- ✅ Keeping sensitive data on server (API keys, tokens)
- ✅ Large dependencies that don't need client-side

**Example:**

```tsx
// purpose: example; id: example.server-component.v1; source: nextjs-best-practices@1.0.0
// components/server/KPISection.tsx (NO 'use client')
import { db } from '@/lib/db';

export async function KPISection() {
  const reviews = await db.review.findMany();
  const avgRating = reviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / reviews.length;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl">
        <h3>Average Rating</h3>
        <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
      </div>
      {/* More KPIs */}
    </div>
  );
}
```

### Client Components <!-- id:server-vs-client.client.v1 -->

**What they are:**
- React components that render on **both server and client**
- Hydrated with JavaScript on client
- Can use browser APIs and React hooks

**Use Client Components ONLY when you need:**
- ✅ Event handlers (`onClick`, `onChange`, `onSubmit`)
- ✅ React hooks (`useState`, `useEffect`, `useContext`, `useTransition`)
- ✅ Browser-only APIs (`window`, `localStorage`, `document`)
- ✅ Third-party libraries that require client features

**Example:**

```tsx
// purpose: example; id: example.client-component.v1; source: nextjs-best-practices@1.0.0
// components/client/ReviewTable.tsx (needs 'use client')
'use client';

import { useState } from 'react';
import { Review } from '@/lib/schemas';

export function ReviewTable({ reviews }: { reviews: Review[] }) {
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    }
    return (b.overallRating || 0) - (a.overallRating || 0);
  });

  return (
    <div>
      <button onClick={() => setSortBy('date')}>Sort by Date</button>
      <button onClick={() => setSortBy('rating')}>Sort by Rating</button>
      <table>{/* Render sortedReviews */}</table>
    </div>
  );
}
```

### Composition Pattern (Best Practice) <!-- id:server-vs-client.composition.v1 -->

**MUST** keep Client Components small and at leaf nodes. Compose Server + Client components strategically.

```tsx
// purpose: example; id: example.composition.v1; source: nextjs-best-practices@1.0.0
// app/dashboard/page.tsx (Server Component)
import { db } from '@/lib/db';
import { KPISection } from '@/components/server/KPISection'; // Server Component
import { ReviewTable } from '@/components/client/ReviewTable'; // Client Component

export default async function DashboardPage() {
  const reviews = await db.review.findMany();

  return (
    <main>
      {/* Server Component - no JS sent to client */}
      <KPISection reviews={reviews} />

      {/* Client Component - JS only for interactivity */}
      <ReviewTable reviews={reviews} />
    </main>
  );
}
```

### Decision Tree <!-- id:server-vs-client.decision-tree.v1 -->

```text
Need interactivity (onClick, useState)?
  ├─ YES → Client Component ('use client')
  └─ NO  → Server Component (default)

Need to fetch data?
  ├─ Server Component → Direct DB/API access
  └─ Client Component → Receive as props from parent
```

---

## 8. Performance Tips <!-- id:performance.v1 -->

**SHOULD**:
- Use **ISR (Incremental Static Regeneration)** for public pages
- Use **dynamic imports** for heavy components (charts)
- Minimize client bundle → keep logic server-side when possible
- Cache normalized data where feasible

---

## 9. Testing Guidelines (Oct 2025) <!-- id:testing.v1 -->

**Test what matters**: Focus on the `/api/reviews/hostaway` endpoint (required by assessment) and core normalization logic.

### Testing Stack <!-- id:testing.stack.v1 -->

```bash
# purpose: setup; id: setup.testing.v1; source: nextjs-best-practices@1.0.0
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @vitejs/plugin-react happy-dom
```

**Why Vitest over Jest?**
- ✅ 10x faster
- ✅ Native ESM support
- ✅ Compatible with Next.js 15
- ✅ Same API as Jest (easy migration)

### Test Priority <!-- id:testing.priority.v1 -->

**Must Have** (Required by Assessment):
1. ✅ API Route: `/api/reviews/hostaway` returns valid JSON
2. ✅ Normalization: Handles edge cases (null ratings, missing names)
3. ✅ Validation: Zod schemas catch invalid data

**Nice to Have**:
4. Component tests for ReviewTable, FiltersBar
5. Server Action tests for approval logic

### API Route Tests <!-- id:testing.api-tests.v1 -->

```ts
// purpose: test; id: test.api-route.v1; source: nextjs-best-practices@1.0.0
// __tests__/api/reviews-hostaway.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/reviews/hostaway/route';

describe('/api/reviews/hostaway', () => {
  it('returns 200 status', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('returns array of normalized reviews', async () => {
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each review has required fields', async () => {
    const response = await GET();
    const data = await response.json();

    const firstReview = data[0];

    expect(firstReview).toHaveProperty('id');
    expect(firstReview).toHaveProperty('source', 'hostaway');
    expect(firstReview).toHaveProperty('listingName');
    expect(firstReview).toHaveProperty('submittedAt');
    expect(firstReview).toHaveProperty('publicReview');
    expect(firstReview).toHaveProperty('approvedForWebsite');
    expect(firstReview).toHaveProperty('categories');
  });
});
```

### Normalization Logic Tests <!-- id:testing.normalization-tests.v1 -->

```ts
// purpose: test; id: test.normalization.v1; source: nextjs-best-practices@1.0.0
// __tests__/lib/normalize.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeHostawayReview } from '@/lib/normalize';

describe('normalizeHostawayReview', () => {
  it('handles missing guest name gracefully', () => {
    const raw = {
      id: 123,
      rating: null,
      publicReview: 'Anonymous review',
      reviewCategory: [],
      submittedAt: '2020-01-01 00:00:00',
      listingName: 'Test Property',
      type: 'guest-to-host',
      status: 'published',
      // guestName is missing
    };

    const normalized = normalizeHostawayReview(raw);

    expect(normalized.guestName).toBe('Anonymous'); // Fallback
  });

  it('handles null ratings', () => {
    const raw = {
      id: 456,
      rating: null, // No overall rating
      publicReview: 'No rating provided',
      reviewCategory: [
        { category: 'cleanliness', rating: 8 },
      ],
      submittedAt: '2020-01-01 00:00:00',
      guestName: 'Jane Doe',
      listingName: 'Test Property',
      type: 'guest-to-host',
      status: 'published',
    };

    const normalized = normalizeHostawayReview(raw);

    // Should calculate from categories
    expect(normalized.overallRating).toBe(8);
  });
});
```

---

## 10. Code Quality <!-- id:code-quality.v1 -->

**MUST**:
- Use ESLint with Next.js config
- Auto-format via Prettier
- Maintain strict TypeScript mode

**SHOULD** add pre-commit hook:

```bash
# purpose: setup; id: setup.pre-commit.v1; source: nextjs-best-practices@1.0.0
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

---

## 11. Deployment Tips <!-- id:deployment.v1 -->

**MUST**:
- Keep `.env` out of repo
- Use environment variables in Vercel or GCP Secret Manager
- Add health route `/api/health` for uptime monitoring

---

## 12. Documentation Standards <!-- id:documentation.v1 -->

**SHOULD**:
- Each folder **SHOULD** include a short `README.md` summarizing purpose
- Use JSDoc/TSDoc in complex functions
- Keep diagrams and decision logs in `/docs`

**Example header:**

```ts
// purpose: documentation; id: documentation.example.v1; source: nextjs-best-practices@1.0.0
/**
 * normalizeHostawayReview()
 * Converts raw Hostaway review into unified normalized object.
 * Handles nulls, category mapping, and timestamp parsing.
 */
```

---

## 13. Common Mistakes to Avoid <!-- id:common-mistakes.v1 -->

❌ Mixing API and UI logic in same file
❌ Fetching data client-side when server actions suffice
❌ Hardcoding API URLs (use relative)
❌ Inconsistent casing for types and vars
❌ Overusing state when props suffice

---

## References <!-- id:references.v1 -->

| ref | target | purpose |
|-----|--------|---------|
| R1 | `architecture@1.0.0` | Technical architecture |
| R2 | https://nextjs.org/docs | Next.js 15 documentation |
| R3 | https://zod.dev | Zod validation library |
| R4 | https://vitest.dev | Vitest testing framework |
| R5 | https://react.dev | React 19 patterns |

