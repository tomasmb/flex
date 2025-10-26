---
title: "Flex Living Design System"
role: "source-of-truth"
version: "1.0.0"
status: "stable"
owner: "tomas@theflex.global"
last_updated: "2025-10-26"
doc_id: "design-system@1.0.0"
depends_on:
  - "scope@1.0.0"
provides:
  - "design.tokens"
  - "design.components"
  - "design.patterns"
  - "design.accessibility"
out_of_scope:
  - "marketing website design"
  - "mobile app design"
change_policy: "minor: token adjustments; major: breaking visual changes"
---

# Flex Living Design System (Dashboard + Public Reviews Section) <!-- id:title.v1 -->

**Last Updated:** 2025-10-26
**Extracted from:** https://theflex.global

## Purpose <!-- id:purpose.v1 -->

- **MUST** maintain pixel-perfect consistency with Flex Living's live website
- **MUST** provide exact design tokens extracted via browser automation
- **MUST** enable rapid UI building in Claude Code using reusable, verified tokens
- **MUST** keep both internal dashboard and public review components visually cohesive

---

## 1. Color Tokens <!-- id:color-tokens.v1 -->

All colors extracted directly from computed styles on theflex.global.

```ts
// purpose: tokens; id: tokens.colors.v1; source: design-system@1.0.0
export const Color = {
  // Brand - Teal Palette (Primary)
  primary: "#284E4C",           // Main brand teal (buttons, footer, accents)
  primaryDark: "#10393C",       // Darker teal variant (footer background, hover states)
  primaryLight: "#CBD4D3",      // Light gray-teal for subtle backgrounds

  // Text
  textPrimary: "#0A0A0A",       // Near-black for main headings and body
  textSecondary: "#333333",     // Medium gray for navigation, secondary text
  textMuted: "#6B7280",         // Muted gray for labels, captions, tertiary text

  // Surfaces
  surfaceWhite: "#FFFFFF",      // Card backgrounds, main containers
  surfaceBg: "#FFFFFF",         // Page background (clean white)
  surfaceGraySubtle: "rgba(249, 250, 251, 0.5)", // Very subtle gray overlay (50% opacity)
  surfaceYellow: "#FFF9E9",     // Warm yellow for badges, highlights, featured cards

  // Borders & Dividers
  borderGray: "#D1D5DB",        // Medium gray for borders
  borderLight: "rgba(255, 255, 255, 0.2)", // Light border on dark backgrounds (footer)
  borderSubtle: "rgba(0, 0, 0, 0.1)", // Very subtle black border at 10%

  // Semantic Colors
  success: "#25D366",           // Green (WhatsApp, positive actions)
  dangerBg: "rgba(255, 0, 0, 0.08)", // Light red background for errors
  warningBg: "rgba(255, 180, 0, 0.08)", // Light orange for warnings

  // Interactive States
  overlay: "rgba(0, 0, 0, 0.2)", // Dark overlay for modals, dropdowns
  hoverOverlay: "rgba(0, 0, 0, 0.1)", // Subtle hover state
};
```

**Usage Notes:**
- `primary` (#284E4C) is the hero color - **MUST** use for primary CTAs, footer, key highlights
- `surfaceYellow` (#FFF9E9) **MUST** be used for badges, featured content cards, and discount callouts
- All text **MUST** use the near-black `textPrimary` (#0A0A0A), NOT pure black
- White backgrounds **MUST** be pure white (#FFFFFF), not cream/off-white

---

## 2. Typography <!-- id:typography.v1 -->

Extracted from live site using `window.getComputedStyle()`.

```ts
// purpose: tokens; id: tokens.typography.v1; source: design-system@1.0.0
export const Font = {
  // Font Family
  familySans: "'Inter', -apple-system, 'Helvetica Neue', sans-serif",

  // Weights
  weightRegular: 400,
  weightMedium: 500,
  weightSemibold: 600,
  weightBold: 700,

  // Scale (exact pixel values from site)
  scale: {
    h1: {
      size: "72px",      // Hero heading
      weight: 700,
      lineHeight: "72px"
    },
    h2: {
      size: "26px",      // Section headings
      weight: 700
    },
    h3: {
      size: "14px",      // Small headings, labels
      weight: 500,
      color: "#6B7280"   // Often uses muted gray
    },
    body: {
      size: "16px",      // Standard paragraph text
      weight: 400,
      lineHeight: "26px",
      color: "#0A0A0A"
    },
    bodyLarge: {
      size: "18px",      // Larger body text (descriptions)
      weight: 400
    },
    small: {
      size: "12px",      // Fine print, metadata
      weight: 400
    },
    button: {
      size: "14px",      // Navigation buttons
      weight: 500
    },
    buttonLarge: {
      size: "18px",      // Primary CTA buttons
      weight: 500
    }
  }
};
```

**Typography Guidelines:**
- **MUST** use `Inter` font family exclusively (loaded via Next.js font optimization)
- H1 is massive (72px) for hero sections only
- H2 at 26px for major section headings
- Body text **MUST** be 16px with generous 26px line-height for readability
- H3 **SHOULD** use muted gray (#6B7280) for visual hierarchy

---

## 3. Spacing & Layout <!-- id:spacing.v1 -->

```ts
// purpose: tokens; id: tokens.spacing.v1; source: design-system@1.0.0
export const Space = {
  xs: 4,    // 0.25rem - minimal gaps
  sm: 8,    // 0.5rem - tight spacing
  md: 12,   // 0.75rem - comfortable spacing
  lg: 16,   // 1rem - standard padding
  xl: 24,   // 1.5rem - section gaps
  xxl: 32,  // 2rem - large section padding
  xxxl: 48, // 3rem - desktop container padding
};

export const Radius = {
  sm: 6,      // Buttons, inputs
  md: 12,     // Primary buttons, search bar
  lg: 16,     // Cards (rounded-2xl in Tailwind)
  xl: 24,     // Large feature cards
  full: 9999, // Pills, circular badges
};
```

**Layout Rules:**
- **Container padding:** **MUST** use 16px on mobile, 48px on desktop
- **Card padding:** **MUST** use 24px (Tailwind: `p-6`)
- **Section gaps:** **MUST** use 24px vertical spacing between major sections
- **Cards:** **MUST** always use 16px border-radius (rounded-2xl)
- **Max-width:** Most content is unconstrained; some containers use max-w-screen-xl

---

## 4. Shadows <!-- id:shadows.v1 -->

Extracted from actual card and button elements.

```ts
// purpose: tokens; id: tokens.shadows.v1; source: design-system@1.0.0
export const Shadow = {
  // Card shadow (medium depth)
  card: "0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)",

  // Button shadow (subtle)
  button: "0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)",

  // Large shadow (modals, overlays)
  large: "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)",

  // Image/feature shadow
  feature: "0px 10px 30px 0px rgba(0, 0, 0, 0.1)",

  // Elevated shadow (dropdowns, popovers)
  elevated: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
};
```

**Tailwind Equivalents:**
- `card` = `shadow-lg`
- `button` = `shadow-sm`
- `large` = `shadow-xl`
- `elevated` = `shadow-2xl`

---

## 5. Components <!-- id:components.v1 -->

### Primary Button <!-- id:components.primary-button.v1 -->

```tsx
// purpose: component; id: component.primary-button.v1; source: design-system@1.0.0
// Search button, main CTAs
<button className="
  bg-[#284E4C]
  text-white
  rounded-xl           /* 12px radius */
  px-8 py-2           /* 32px horizontal, 8px vertical */
  text-lg font-medium /* 18px, weight 500 */
  shadow-sm
  hover:bg-[#10393C]
  transition-colors
">
  Search
</button>
```

**Specs:**
- Background: `#284E4C`
- Text: White
- Padding: `8px 32px`
- Border-radius: `12px`
- Font: 18px, weight 500
- Shadow: Button shadow (subtle)

### Secondary Button / Navigation <!-- id:components.secondary-button.v1 -->

```tsx
// purpose: component; id: component.secondary-button.v1; source: design-system@1.0.0
// Nav links, secondary actions
<button className="
  bg-transparent
  text-[#333333]
  rounded-md          /* 6px radius */
  px-4 py-2          /* 16px horizontal, 8px vertical */
  text-sm font-medium /* 14px, weight 500 */
  hover:bg-gray-100
  transition-colors
">
  About Us
</button>
```

### Card <!-- id:components.card.v1 -->

```tsx
// purpose: component; id: component.card.v1; source: design-system@1.0.0
// Feature cards, content containers
<div className="
  bg-white
  rounded-2xl        /* 16px radius */
  p-6               /* 24px padding */
  shadow-lg
  border border-transparent
  hover:shadow-xl
  transition-shadow
">
  {children}
</div>
```

**Specs:**
- Background: `#FFFFFF`
- Border-radius: `16px`
- Padding: `24px`
- Shadow: Card shadow (medium depth)

### Badge / Pill <!-- id:components.badge.v1 -->

```tsx
// purpose: component; id: component.badge.v1; source: design-system@1.0.0
// Featured labels, categories
<div className="
  bg-[#FFF9E9]       /* Warm yellow */
  rounded-2xl        /* 16px radius */
  px-4 py-2
  shadow-md
  text-sm
">
  Featured
</div>
```

**Specs:**
- Background: `#FFF9E9` (warm yellow)
- Border-radius: `16px`
- Padding: `8px 16px` (vertical, horizontal)
- Shadow: Card shadow
- Text: 14px, medium gray

### Rounded Pill (Filters, Tags) <!-- id:components.pill.v1 -->

```tsx
// purpose: component; id: component.pill.v1; source: design-system@1.0.0
// Active state
<div className="
  bg-[#284E4C]
  text-white
  rounded-full       /* 9999px = fully rounded */
  px-3              /* 12px horizontal */
  text-xs font-medium
">
  Active
</div>

// Inactive state
<div className="
  bg-gray-200
  text-[#333333]
  rounded-full
  px-3
  text-xs font-medium
">
  Inactive
</div>
```

### Input / Combobox <!-- id:components.input.v1 -->

```tsx
// purpose: component; id: component.input.v1; source: design-system@1.0.0
<input className="
  bg-transparent
  border-0
  rounded-md         /* 6px radius */
  px-4 py-2
  text-lg
  focus:outline-none
  focus:ring-2
  focus:ring-[#284E4C]
" />
```

---

## 6. Public Review Section Style <!-- id:public-review-section.v1 -->

For the reviews display on property pages:

```tsx
// purpose: component; id: component.review-card.v1; source: design-system@1.0.0
<div className="max-w-screen-xl mx-auto px-4 lg:px-12 py-12">
  {/* Review Card */}
  <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
    {/* Star Rating */}
    <div className="flex gap-1 mb-2">
      {[...Array(5)].map((_, i) => (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>

    {/* Guest Info */}
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div>
        <h3 className="text-sm font-medium text-[#0A0A0A]">Guest Name</h3>
        <p className="text-xs text-[#6B7280]">January 2025</p>
      </div>
    </div>

    {/* Review Text */}
    <p className="text-base text-[#0A0A0A] leading-relaxed">
      Review content goes here...
    </p>
  </div>
</div>
```

**Key Features:**
- Same card styling as main site (white, rounded-2xl, shadow-lg)
- Star rating **MUST** use yellow-400 (#FBBF24)
- Guest name: 14px medium weight
- Date: 12px muted gray
- Review text: 16px with relaxed line-height

---

## 7. Responsive Rules <!-- id:responsive.v1 -->

```css
/* purpose: css; id: css.responsive.v1; source: design-system@1.0.0 */
/* Mobile First Approach */
.container {
  padding: 0 16px;        /* Mobile */
}

@media (min-width: 1024px) {
  .container {
    padding: 0 48px;      /* Desktop */
  }
}

/* Grid Breakpoints */
/* - Mobile: Single column, stack everything */
/* - Tablet (md: 768px): 2-column grid for features */
/* - Desktop (lg: 1024px): 3-4 column grid, side panels */
```

**Component Responsiveness:**
- Cards: Full width on mobile, 2-3 columns on tablet/desktop
- Hero text: 48px on mobile, 72px on desktop
- Navigation: Hamburger menu on mobile, full nav on desktop
- Buttons: Full width on mobile, auto width on desktop

---

## 8. Iconography <!-- id:iconography.v1 -->

- **Library:** **MUST** use Lucide Icons (https://lucide.dev)
- **Style:** Outline/stroke style (not filled)
- **Sizes:**
  - Small: `16px` (w-4 h-4)
  - Medium: `20px` (w-5 h-5)
  - Large: `24px` (w-6 h-6)
- **Color:** Inherit from parent or use `text-[#6B7280]` for muted icons

---

## 9. Tailwind Config <!-- id:tailwind-config.v1 -->

Apply this design system to your `tailwind.config.js`:

```js
// purpose: config; id: config.tailwind.v1; source: design-system@1.0.0
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#284E4C',
          dark: '#10393C',
          light: '#CBD4D3',
        },
        text: {
          primary: '#0A0A0A',
          secondary: '#333333',
          muted: '#6B7280',
        },
        surface: {
          white: '#FFFFFF',
          gray: 'rgba(249, 250, 251, 0.5)',
          yellow: '#FFF9E9',
        },
        border: {
          gray: '#D1D5DB',
          subtle: 'rgba(0, 0, 0, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'hero': ['72px', { lineHeight: '72px', fontWeight: '700' }],
        'h2': ['26px', { fontWeight: '700' }],
        'h3': ['14px', { fontWeight: '500' }],
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'button': '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'elevated': '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      spacing: {
        'container-mobile': '16px',
        'container-desktop': '48px',
      },
    },
  },
};
```

---

## 10. Dashboard-Specific Extensions <!-- id:dashboard-extensions.v1 -->

### KPI Tile <!-- id:dashboard-extensions.kpi-tile.v1 -->

```tsx
// purpose: component; id: component.kpi-tile.v1; source: design-system@1.0.0
<div className="bg-white rounded-2xl p-6 shadow-card">
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-h3 text-text-muted uppercase tracking-wide">
      Average Rating
    </h3>
    <TrendingUpIcon className="w-5 h-5 text-success" />
  </div>
  <p className="text-3xl font-bold text-text-primary mb-1">4.8</p>
  <p className="text-xs text-text-muted">
    <span className="text-success">+0.2</span> vs last month
  </p>
</div>
```

### Status Badge <!-- id:dashboard-extensions.status-badge.v1 -->

```tsx
// purpose: component; id: component.status-badge.v1; source: design-system@1.0.0
// Approved
<span className="
  inline-flex items-center
  bg-green-50
  text-green-700
  px-3 py-1
  rounded-full
  text-xs font-medium
">
  Approved
</span>

// Pending
<span className="
  inline-flex items-center
  bg-yellow-50
  text-yellow-700
  px-3 py-1
  rounded-full
  text-xs font-medium
">
  Pending Review
</span>

// Not Approved
<span className="
  inline-flex items-center
  bg-red-50
  text-red-700
  px-3 py-1
  rounded-full
  text-xs font-medium
">
  Not Approved
</span>
```

### Filter Chip (Active/Inactive) <!-- id:dashboard-extensions.filter-chip.v1 -->

```tsx
// purpose: component; id: component.filter-chip.v1; source: design-system@1.0.0
// Active
<button className="
  bg-primary
  text-white
  rounded-full
  px-4 py-2
  text-sm font-medium
  shadow-button
  hover:bg-primary-dark
  transition-colors
">
  Cleanliness
</button>

// Inactive
<button className="
  bg-gray-100
  text-text-secondary
  rounded-full
  px-4 py-2
  text-sm font-medium
  hover:bg-gray-200
  transition-colors
">
  Communication
</button>
```

---

## 11. Animation & Transitions <!-- id:animations.v1 -->

All interactive elements **MUST** use smooth transitions:

```css
/* purpose: css; id: css.transitions.v1; source: design-system@1.0.0 */
.transition-default {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-duration: 300ms;
}
```

**Hover States:**
- Buttons: Background color darkens slightly
- Cards: Shadow elevates from `shadow-card` to `shadow-elevated`
- Links: Underline appears or color shifts to primary

---

## 12. Accessibility <!-- id:accessibility.v1 -->

**MUST** ensure:
- All interactive elements have min touch target of 44x44px
- Color contrast ratios meet WCAG AA standards:
  - `#284E4C` on white: 8.5:1 ✅
  - `#0A0A0A` on white: 19.8:1 ✅
  - `#6B7280` on white: 4.6:1 ✅
- Focus states use visible outlines (2px ring in primary color)
- All images have alt text
- Semantic HTML structure (nav, main, section, article)

---

## 13. Property Review Display Page <!-- id:property-review-display.v1 -->

This section defines the exact layout and styling for displaying approved guest reviews on property detail pages, matching the Flex Living property page design.

### Page Layout Structure <!-- id:property-review-display.layout.v1 -->

The property detail page **MUST** use a **two-column layout** with main content on the left and a sticky booking sidebar on the right.

```tsx
// purpose: component; id: component.property-layout.v1; source: design-system@1.0.0
<main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
    {/* Left Column: Main Content */}
    <div className="space-y-8">
      {/* Image Gallery */}
      {/* Property Title & Info */}
      {/* About This Property */}
      {/* Amenities */}
      {/* Guest Reviews Section ⭐ NEW */}
      {/* Stay Policies */}
      {/* Location */}
    </div>

    {/* Right Column: Sticky Booking Sidebar */}
    <div className="sticky top-24 self-start">
      {/* Book Your Stay Card */}
    </div>
  </div>
</main>
```

**Layout Specs (from live site):**
- Grid columns: `1fr` (main content) + `400px` (sidebar) on desktop
- Gap: `32px` (2rem)
- Sidebar position: `sticky` with `top: 96px`
- Sidebar background: White with 16px border-radius and shadow-card

### Guest Reviews Section <!-- id:property-review-display.reviews-section.v1 -->

This is where approved/selected reviews are displayed. **MUST** place this section **between Amenities and Stay Policies** to maintain the natural flow of property information.

```tsx
// purpose: component; id: component.reviews-section.v1; source: design-system@1.0.0
<section className="space-y-6">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-semibold text-[#333333]">
      Guest Reviews
    </h2>
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <span className="text-lg font-semibold text-[#333333]">4.8</span>
      <span className="text-sm text-[#6B7280]">(24 reviews)</span>
    </div>
  </div>

  {/* Review Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {approvedReviews.map((review) => (
      <ReviewCard key={review.id} review={review} />
    ))}
  </div>

  {/* Show More Button (if needed) */}
  <button className="w-full py-3 px-6 border-2 border-[#284E4C] text-[#284E4C] rounded-xl font-medium hover:bg-[#284E4C] hover:text-white transition-colors">
    Show all reviews
  </button>
</section>
```

**Key Points:**
- **MUST** only display reviews that are `approved: true` in the database
- Default: Show 4-6 most recent approved reviews
- **MAY** include "Show all reviews" button to expand
- Grid: 2 columns on desktop, 1 column on mobile
- Gap: 16px between cards

### Review Card Component <!-- id:property-review-display.review-card.v1 -->

Individual review card matching Flex Living design style.

```tsx
// purpose: component; id: component.individual-review-card.v1; source: design-system@1.0.0
<div className="bg-white rounded-2xl p-6 shadow-lg border border-transparent hover:border-[#284E4C] transition-all">
  {/* Star Rating */}
  <div className="flex items-center gap-1 mb-3">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`w-5 h-5 ${
          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))}
  </div>

  {/* Review Text */}
  <p className="text-base text-[#0A0A0A] leading-relaxed mb-4">
    {review.reviewText}
  </p>

  {/* Guest Info */}
  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
      <span className="text-sm font-medium text-[#333333]">
        {review.guestName.charAt(0)}
      </span>
    </div>
    <div>
      <p className="text-sm font-medium text-[#0A0A0A]">{review.guestName}</p>
      <p className="text-xs text-[#6B7280]">
        {formatDate(review.createdAt)} • {review.lengthOfStay}
      </p>
    </div>
  </div>

  {/* Optional: Category Tags */}
  {review.categories && (
    <div className="flex flex-wrap gap-2 mt-4">
      {review.categories.map((category) => (
        <span
          key={category}
          className="inline-flex items-center px-3 py-1 bg-[#FFF9E9] text-[#333333] rounded-full text-xs font-medium"
        >
          {category}
        </span>
      ))}
    </div>
  )}
</div>
```

**Review Card Specs:**
- Background: White (#FFFFFF)
- Border-radius: 16px (rounded-2xl)
- Padding: 24px (p-6)
- Shadow: shadow-lg (card shadow from design system)
- Hover: Border changes to primary color (#284E4C)
- Star color: Yellow-400 (#FBBF24) for filled, Gray-300 for empty

**Content Structure:**
1. Star rating (1-5 stars) - Top
2. Review text - Main body (16px, line-height relaxed)
3. Divider line (1px, gray-100)
4. Guest info - Bottom
   - Avatar circle (40px, gray-200 background)
   - Guest name (14px, medium weight)
   - Date + length of stay (12px, muted gray)
5. Category tags (optional) - Very bottom

---

## References <!-- id:references.v1 -->

| ref | target | purpose |
|-----|--------|---------|
| R1 | https://theflex.global | Live site source of truth |
| R2 | https://lucide.dev | Icon library |
| R3 | `architecture@1.0.0` | Component implementation |
| R4 | https://tailwindcss.com/docs | Framework documentation |

