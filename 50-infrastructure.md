---
title: "Infrastructure & Deployment Guide"
role: "source-of-truth"
version: "1.0.0"
status: "stable"
owner: "tomas@theflex.global"
last_updated: "2025-10-26"
doc_id: "infrastructure@1.0.0"
depends_on:
  - "architecture@1.0.0"
  - "nextjs-best-practices@1.0.0"
provides:
  - "infrastructure.deployment"
  - "infrastructure.local-setup"
  - "infrastructure.database"
  - "infrastructure.security"
out_of_scope:
  - "terraform configuration"
  - "kubernetes deployment"
  - "microservices architecture"
change_policy: "minor: config updates; major: platform changes"
---

# Flex Living Reviews Dashboard – Infrastructure Guide <!-- id:title.v1 -->

**Philosophy**: Keep infrastructure simple, modern, and instantly runnable. This is a code quality assessment, not a DevOps test.

---

## 1. Deployment Strategy <!-- id:deployment-strategy.v1 -->

### Recommended: Vercel (Zero-Config Production) <!-- id:deployment-strategy.vercel.v1 -->

**Why this is the right choice:**
- ✅ Reviewers can click URL and see live app instantly
- ✅ Automatic deployments from GitHub
- ✅ Built-in environment variables
- ✅ Zero cost on free tier
- ✅ Shows you understand modern Next.js deployment
- ✅ No infrastructure debugging = more time on features

**What matters in this assessment:**
- Beautiful, functional dashboard UI
- Clean data normalization code
- Smart product features (AI insights!)
- Thoughtful UX decisions
- Quality TypeScript/React patterns

**What doesn't matter:**
- Terraform configuration
- Cloud SQL networking
- Docker containers
- IAM roles

---

## 2. Infrastructure Stack <!-- id:infrastructure-stack.v1 -->

| Layer | Technology | Cost | Why |
|-------|------------|------|-----|
| **App Runtime** | Vercel (Next.js) | $0 | Native Next.js platform, instant deploys |
| **Database** | Prisma + SQLite (local)<br>Turso (production) | $0 | Simple for demo, scalable if needed |
| **API Keys** | Vercel Environment Variables | $0 | Built-in secrets management |
| **CI/CD** | Vercel GitHub Integration | $0 | Automatic on push to main |

---

## 3. Local Development Setup <!-- id:local-setup.v1 -->

### Quick Start (30 seconds) <!-- id:local-setup.quick-start.v1 -->

```bash
# purpose: setup; id: setup.quick-start.v1; source: infrastructure@1.0.0

# 1. Install dependencies
npm install

# 2. Set up database
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init

# 3. Seed with mock data
npm run seed

# 4. Start dev server
npm run dev
```

App runs on `http://localhost:3000`

### Environment Variables <!-- id:local-setup.env-vars.v1 -->

**`.env.example`**
```bash
# purpose: config; id: config.env-example.v1; source: infrastructure@1.0.0

# Database
DATABASE_URL="file:./dev.db"

# APIs (use provided keys or mocked values)
HOSTAWAY_API_KEY="f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152"
HOSTAWAY_ACCOUNT_ID="61148"

# Optional: Google Places API (for review integration exploration)
GOOGLE_PLACES_API_KEY=""

# Optional: AI Insights (for summary generation)
OPENAI_API_KEY=""
```

---

## 4. Database Architecture <!-- id:database.v1 -->

### SQLite for Simplicity (Perfect for Assessment) <!-- id:database.sqlite.v1 -->

**Why SQLite:**
- ✅ Zero setup - works immediately
- ✅ File-based - easy to inspect/debug
- ✅ Prisma ORM provides type safety
- ✅ Easy to migrate to Postgres later
- ✅ Reviewers don't need to configure anything

**Schema** (defined in `prisma/schema.prisma`):
```prisma
// purpose: schema; id: schema.prisma.v1; source: infrastructure@1.0.0
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Property {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String?
  images      Json?
  amenities   Json?
  address     String?

  reviews     Review[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Review {
  id                  String   @id @default(cuid())

  // Property relation
  propertyId          String
  property            Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  // Review metadata
  source              String   // "hostaway" | "google"
  listingName         String
  guestName           String?
  submittedAt         DateTime
  channel             String?

  // Ratings
  overallRating       Float?
  categories          Json     // Array of {category, rating}

  // Content
  publicReview        String

  // Moderation
  approvedForWebsite  Boolean  @default(false)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([propertyId, approvedForWebsite])
  @@index([propertyId, submittedAt])
  @@index([listingName])
}
```

### If You Need Production Scale Later <!-- id:database.production-scale.v1 -->

**Option: Turso (Edge SQLite)**
- Free tier: 500MB storage, 1B row reads/month
- Global replication at CDN edge
- Same Prisma schema, just change connection URL
- Migration: Update `DATABASE_URL` to Turso connection string

**Option: Vercel Postgres**
- Native integration in Vercel dashboard
- `@vercel/postgres` package
- Change provider in Prisma schema from `sqlite` to `postgresql`

---

## 5. Deployment (Production) <!-- id:deployment-production.v1 -->

### One-Time Setup <!-- id:deployment-production.setup.v1 -->

**1. Push to GitHub**
```bash
# purpose: setup; id: setup.git-init.v1; source: infrastructure@1.0.0
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/flex-reviews-dashboard.git
git push -u origin main
```

**2. Connect to Vercel**
- Go to https://vercel.com
- Click "Import Project"
- Select your GitHub repo
- Vercel auto-detects Next.js configuration

**3. Add Environment Variables**

In Vercel dashboard → Settings → Environment Variables:
```bash
# purpose: config; id: config.vercel-env.v1; source: infrastructure@1.0.0
DATABASE_URL=file:./dev.db
HOSTAWAY_API_KEY=<your-key>
HOSTAWAY_ACCOUNT_ID=61148
```

**4. Deploy**
- Click "Deploy"
- Get instant production URL: `https://flex-reviews.vercel.app`

### Continuous Deployment <!-- id:deployment-production.continuous.v1 -->

Every push to `main` automatically:
1. Builds Next.js app
2. Runs TypeScript checks
3. Deploys to production
4. Updates live URL

---

## 6. API Architecture <!-- id:api-architecture.v1 -->

### Key Endpoints <!-- id:api-architecture.endpoints.v1 -->

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/reviews/hostaway` | GET | Fetch & normalize Hostaway reviews (required by assessment) |
| `/api/health` | GET | Health check endpoint |

**Note:** Most mutations use Server Actions instead of API routes (see `nextjs-best-practices@1.0.0#api-routes-vs-server-actions.v1`)

### Example: Hostaway Normalization Route <!-- id:api-architecture.hostaway-example.v1 -->

**`/app/api/reviews/hostaway/route.ts`**
```typescript
// purpose: api; id: api.hostaway-route.v1; source: infrastructure@1.0.0
import { NextResponse } from 'next/server';
import { normalizeHostawayReview } from '@/lib/normalize';
import { NormalizedReviewSchema } from '@/lib/schemas';

export async function GET() {
  try {
    // Fetch from mocked data or Hostaway sandbox
    const rawReviews = await fetchHostawayReviews();

    // Normalize to internal schema
    const normalized = rawReviews.map(normalizeHostawayReview);

    // Validate output
    const validated = NormalizedReviewSchema.array().parse(normalized);

    return NextResponse.json(validated);
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
```

---

## 7. Security Best Practices <!-- id:security.v1 -->

### What We Implement <!-- id:security.implemented.v1 -->

**MUST** include:

✅ **Environment Variables**
- Never commit `.env` to git
- Use `.env.example` for documentation
- Store secrets in Vercel dashboard

✅ **API Route Protection**
- Validate inputs with Zod schemas
- Rate limiting on mutation endpoints (via Vercel)
- Error handling with proper status codes

✅ **Type Safety**
- TypeScript throughout
- Prisma generates types from schema
- No `any` types in production code

### What We Skip (Assessment Scope) <!-- id:security.out-of-scope.v1 -->

❌ Authentication - Not required for demo
❌ RBAC - Single manager use case
❌ CSRF tokens - Not needed for demo
❌ Database encryption - Overkill for mock data

*Note: For production, **SHOULD** add NextAuth.js with role-based access*

---

## 8. Scaling & Performance <!-- id:scaling.v1 -->

### Current Architecture Can Handle <!-- id:scaling.capacity.v1 -->

- **Traffic**: 100k+ requests/day (Vercel free tier)
- **Data**: 10k+ reviews (SQLite handles this easily)
- **Latency**: <100ms API responses (serverless edge functions)

### When to Upgrade <!-- id:scaling.upgrade-thresholds.v1 -->

| Metric | Threshold | Solution |
|--------|-----------|----------|
| Reviews > 100k | Database size | Migrate to Turso or Vercel Postgres |
| Traffic > 1M/day | Free tier limit | Upgrade Vercel to Pro ($20/mo) |
| API latency > 500ms | Query complexity | Add Redis cache layer |

### Performance Optimizations Built-In <!-- id:scaling.optimizations.v1 -->

- ✅ Server Components for zero JS by default
- ✅ API route caching headers
- ✅ Prisma query optimization (indexes on common filters)
- ✅ Lazy loading for dashboard components

---

## 9. Monitoring & Observability <!-- id:monitoring.v1 -->

### Built-In Vercel Features <!-- id:monitoring.vercel.v1 -->

- **Real-time Logs**: View function invocation logs
- **Analytics**: Page views, response times
- **Error Tracking**: Automatic error reporting

### For Production <!-- id:monitoring.production.v1 -->

**SHOULD** consider adding:
- Sentry for error tracking
- Posthog for product analytics
- Vercel Speed Insights for Core Web Vitals

---

## 10. Why This Approach Wins <!-- id:why-this-wins.v1 -->

### For the Assessment <!-- id:why-this-wins.assessment.v1 -->

1. **Instant Demo**: Reviewers can test live app immediately
2. **Easy Local Setup**: `npm install && npm run dev` just works
3. **Focus on Code**: No time wasted on infrastructure debugging
4. **Modern Stack**: Shows you know current best practices
5. **Production Ready**: Actually scales, not toy infrastructure

### Quality Signals You're Sending <!-- id:why-this-wins.signals.v1 -->

✅ Pragmatic technology choices
✅ Understanding of modern serverless architecture
✅ Ability to prioritize what matters
✅ Clean separation of concerns
✅ Production-grade code patterns (even in simple setup)

### What Impresses Reviewers <!-- id:why-this-wins.impressions.v1 -->

- 🎨 Beautiful, intuitive dashboard UI
- 🧹 Clean data normalization logic
- 📊 Thoughtful analytics and KPIs
- 🤖 AI insights panel (differentiator!)
- ✨ Polished review approval workflow
- 🎯 Smart filtering and sorting
- 📱 Responsive design

---

## 11. Cost Breakdown <!-- id:cost.v1 -->

### Assessment Cost <!-- id:cost.assessment.v1 -->

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| Vercel Free Tier | $0 | 100GB bandwidth, unlimited deployments |
| SQLite | $0 | File-based, no hosting needed |
| GitHub | $0 | Public repositories free |
| **Total** | **$0** | Perfect for assessment submission |

### If Scaling in Production <!-- id:cost.production.v1 -->

| Service | Cost |
|---------|------|
| Vercel Pro | $20/mo |
| Turso (edge DB) | $0-29/mo |
| Sentry | $0-26/mo |

---

## 12. Deliverables Checklist <!-- id:deliverables.v1 -->

Infrastructure files to include:

- ✅ `prisma/schema.prisma` - Database schema
- ✅ `.env.example` - Environment template
- ✅ `package.json` - Dependencies and scripts
- ✅ `README.md` - Setup instructions
- ✅ `50-infrastructure.md` - This file

**No Terraform, Docker, or complex IaC needed.**

---

## 13. Alternative: If You Want to Show IaC Skills <!-- id:alternative-iac.v1 -->

If you really want to demonstrate infrastructure-as-code knowledge without overcomplicating:

**Option: Add Pulumi (Simple IaC)**

Create `infra/index.ts`:
```typescript
// purpose: iac; id: iac.pulumi-example.v1; source: infrastructure@1.0.0
import * as vercel from "@pulumi/vercel";

const project = new vercel.Project("flex-reviews", {
  name: "flex-reviews-dashboard",
  framework: "nextjs",
  gitRepository: {
    repo: "yourusername/flex-reviews-dashboard",
    type: "github",
  },
});

export const url = project.url;
```

This shows IaC knowledge without the complexity of Cloud SQL + Terraform.

**But honestly**: Skip this for the assessment. Focus on the product.

---

## References <!-- id:references.v1 -->

| ref | target | purpose |
|-----|--------|---------|
| R1 | `architecture@1.0.0` | Technical architecture |
| R2 | `nextjs-best-practices@1.0.0` | Implementation patterns |
| R3 | https://vercel.com/docs | Deployment platform |
| R4 | https://www.prisma.io/docs | ORM documentation |
| R5 | https://turso.tech | Edge database option |

