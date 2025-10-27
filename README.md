# Flex Living Reviews Dashboard

A comprehensive property reviews management and analytics platform built with Next.js 15, featuring AI-powered insights, real-time approval workflows, and beautiful data visualizations.

![Status](https://img.shields.io/badge/status-production--ready-success)
![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/tests-14%2F14%20passing-success)

## 🎯 Overview

This application helps Flex Living property managers:
- ✅ **Manage Reviews**: View, filter, and approve guest reviews
- 📊 **Analytics Dashboard**: Track KPIs, trends, and performance metrics
- 🤖 **AI Insights**: Get automated recommendations and issue detection
- 🏠 **Public Display**: Beautiful review sections on property detail pages
- 🔄 **Real-time Updates**: Server Actions with optimistic UI updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0 or higher
- npm or pnpm

### Installation (30 seconds)

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Set up database
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init

# 3. Seed with mock data
npm run db:seed

# 4. Start development server
npm run dev
\`\`\`

Visit http://localhost:3000 🎉

## 📁 Project Structure

\`\`\`
├── app/
│   ├── dashboard/           # Manager dashboard
│   │   ├── page.tsx        # Dashboard UI (Server Component)
│   │   └── actions.ts      # Server Actions (approval logic)
│   ├── property/[slug]/    # Public property pages
│   ├── api/
│   │   ├── reviews/hostaway/  # Required API endpoint
│   │   └── health/         # Health check endpoint
│   └── layout.tsx          # Root layout
│
├── components/
│   ├── server/             # Server Components (zero JS)
│   │   ├── KPISection.tsx
│   │   ├── GuestReviewsSection.tsx
│   │   └── AIInsightsPanel.tsx
│   └── client/             # Client Components (interactive)
│       ├── ReviewTable.tsx
│       ├── FiltersBar.tsx
│       └── ApprovalToggle.tsx
│
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── normalize.ts        # Hostaway data normalization
│   ├── schemas.ts          # Zod validation schemas
│   ├── property.ts         # Property management functions
│   └── insights.ts         # AI insights generation
│
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding script
│
└── __tests__/              # Test suites
    ├── api/
    └── lib/
\`\`\`

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15 (App Router) | React framework with Server Components |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first styling (Flex Living design system) |
| **Database** | Prisma + SQLite | ORM with local file-based DB |
| **Validation** | Zod | Runtime type validation |
| **Testing** | Vitest | Fast unit tests |
| **Icons** | Lucide React | Beautiful iconography |
| **Charts** | Recharts | Data visualization |

## 📊 Key Features

### 1. Manager Dashboard
- **KPI Cards**: Average rating, total reviews, approval stats, trend indicators
- **AI Insights Panel**: Automated issue detection, recommendations, category analysis
- **Interactive Table**: Sort by date/rating/property, expand reviews, inline approval
- **Advanced Filters**: Search, property selector, rating threshold, approval status
- **Server Actions**: Type-safe mutations with automatic revalidation

### 2. Public Property Pages
- **Property Detail Layout**: Two-column design matching Flex Living website
- **Guest Reviews Section**: Only shows approved reviews with star ratings
- **Category Tags**: Highlight top-rated categories per review
- **Booking Sidebar**: Sticky CTA with date selection (UI only)

### 3. API Integration
- **`/api/reviews/hostaway` (GET)**: Required endpoint returning normalized JSON
- **`/api/health` (GET)**: Health check with database stats
- **Normalization**: Handles edge cases (null ratings, missing names, date formats)
- **Validation**: Zod schemas at all API boundaries

### 4. AI Insights (Differentiator)
- **Top Themes**: Identifies recurring keywords (positive and negative)
- **Category Performance**: Visual breakdown of cleanliness, communication, etc.
- **Recommendations**: Actionable insights based on review patterns
- **Highlight Quotes**: Surfaces top positive reviews

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests with UI
npm run test:ui
\`\`\`

**Test Coverage:**
- ✅ API route returns 200 status
- ✅ Normalized reviews have all required fields
- ✅ Edge cases: null ratings, missing guest names, date formats
- ✅ Category structure validation
- ✅ ISO 8601 date format conversion
- ✅ Default approval status

**Results:** 14/14 tests passing

## 🎨 Design System

Based on Flex Living's official branding:

### Color Palette
- **Primary**: `#284E4C` (Teal)
- **Primary Dark**: `#10393C` (Dark Teal)
- **Surface Yellow**: `#FFF9E9` (Warm Highlight)
- **Success**: `#25D366` (Green)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Components
- **Cards**: 16px border-radius, white background, shadow-card
- **Buttons**: Primary (teal), Secondary (outlined), rounded-xl
- **Badges**: Rounded-full pills with semantic colors
- **Inputs**: 2px focus ring, primary color

## 📡 API Documentation

### GET `/api/reviews/hostaway`

Fetches and normalizes Hostaway review data (required by assessment).

**Response Format:**
\`\`\`json
[
  {
    "id": "8000",
    "source": "hostaway",
    "listingName": "2B N1 A - 29 Shoreditch Heights",
    "guestName": "Alice Nguyen",
    "submittedAt": "2025-07-12T13:25:41.000Z",
    "overallRating": 5,
    "categories": [
      { "category": "cleanliness", "rating": 10 },
      { "category": "communication", "rating": 10 }
    ],
    "publicReview": "Spotless flat, seamless check-in, and fast responses.",
    "approvedForWebsite": false
  }
]
\`\`\`

### GET `/api/health`

Health check endpoint with database stats.

**Response:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2025-10-26T23:54:59.713Z",
  "database": "connected",
  "stats": {
    "reviews": 40,
    "properties": 10
  }
}
\`\`\`

## 🗄️ Database Schema

### Property Model
- `id`: Unique identifier (CUID)
- `slug`: URL-friendly slug (unique)
- `name`: Display name
- `description`: Property description
- `images`, `amenities`: JSON fields
- `reviews`: One-to-many relation

### Review Model
- `id`: Unique identifier (CUID)
- `propertyId`: Foreign key to Property
- `source`: "hostaway" | "google"
- `listingName`: Original listing name
- `guestName`: Guest name (nullable)
- `submittedAt`: Review date
- `overallRating`: 0-10 rating scale
- `categories`: JSON array of category ratings
- `publicReview`: Review text
- `approvedForWebsite`: Boolean (default: false)

## 🔄 Data Flow

### Review Approval Flow (Server Actions)
1. User clicks toggle in ReviewTable
2. Optimistic UI update (instant feedback)
3. Server Action \`approveReview()\` called
4. Database updated via Prisma
5. \`revalidatePath('/dashboard')\` refreshes data
6. UI reflects new state

### Property Page Flow (Server Components)
1. User visits \`/property/shoreditch-heights\`
2. Server Component queries database directly
3. Fetches property with \`approvedForWebsite: true\` reviews
4. Renders HTML on server (zero JavaScript)
5. Sends static HTML to client

## 📝 Scripts

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start development server (Turbopack) |
| \`npm run build\` | Build for production |
| \`npm start\` | Start production server |
| \`npm run lint\` | Run ESLint |
| \`npm run type-check\` | TypeScript validation |
| \`npm test\` | Run test suite |
| \`npm run db:generate\` | Generate Prisma Client |
| \`npm run db:migrate\` | Run database migrations |
| \`npm run db:seed\` | Seed database with mock data |
| \`npm run db:reset\` | Reset database |

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel dashboard
3. Add environment variables from \`.env.example\`
4. Deploy automatically

**Production URL**: \`https://your-app.vercel.app\`

### Environment Variables
\`\`\`bash
DATABASE_URL="file:./dev.db"
HOSTAWAY_API_KEY="f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152"
HOSTAWAY_ACCOUNT_ID="61148"
GOOGLE_PLACES_API_KEY=""  # Optional
OPENAI_API_KEY=""          # Optional (for enhanced AI insights)
\`\`\`

## 🎯 Assessment Requirements

### ✅ Completed
- [x] Hostaway API integration (mocked with provided data)
- [x] Data normalization and validation
- [x] Manager dashboard with filtering and approval
- [x] Public property page with approved reviews
- [x] \`/api/reviews/hostaway\` endpoint (tested and working)
- [x] Clean, intuitive UI matching Flex Living design
- [x] Edge case handling (null ratings, missing data)
- [x] TypeScript throughout
- [x] Test coverage (14 tests passing)
- [x] Documentation

### 🌟 Differentiators
- [x] **AI Insights Panel**: Automated issue detection and recommendations
- [x] **Server Components**: Zero-JavaScript default for optimal performance
- [x] **Server Actions**: Modern mutation pattern with optimistic updates
- [x] **Comprehensive filtering**: Search, property, rating, approval status
- [x] **Real-time KPIs**: Trend indicators, category breakdowns
- [x] **Production-ready**: Clean code, proper error handling, validated with Zod

### 📚 Google Reviews Exploration
**Status**: Not implemented in MVP

**Findings:**
- **Places API**: Requires business verification and Place ID mapping
- **Reviews API**: Limited to 5 most recent reviews (free tier)
- **Rate Limits**: 10,000 requests/month on free tier
- **Implementation Effort**: ~8 hours for full integration
- **Recommendation**: Add in Phase 2 after core features validated

## 🧑‍💻 Development

### Adding a New Property
Properties are auto-created when reviews are imported. To manually add:

\`\`\`typescript
import { findOrCreateProperty } from '@/lib/property';

const propertyId = await findOrCreateProperty('New Property Name');
\`\`\`

### Extending the AI Insights
Edit \`lib/insights.ts\` to add new analysis patterns:

\`\`\`typescript
export function generateAIInsights(reviews: Review[]): AIInsights {
  // Add custom logic here
  const customInsight = analyzeReviewsForPattern(reviews);

  return {
    // ... existing insights
    customMetric: customInsight,
  };
}
\`\`\`

## 📞 Support

For questions or issues:
- GitHub Issues: [Create an issue](https://github.com/yourusername/flex-reviews-dashboard/issues)
- Email: tomas@theflex.global

## 📄 License

This project was built as part of the Flex Living developer assessment.

---

**Built with ❤️ by Tomas for Flex Living**

*Last updated: October 26, 2025*
