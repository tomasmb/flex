# Google Reviews Integration — Findings & Recommendations

**Date:** October 26, 2025
**Assessment Task:** Explore Google Reviews integration feasibility
**Status:** Exploration Complete

---

## 1. Executive Summary

Google Reviews integration **is technically feasible** via the Google Places API. However, there are important limitations and considerations that make it a **Phase 2 feature** rather than an MVP requirement.

**Recommendation:** Implement basic infrastructure now, defer full integration to post-MVP.

---

## 2. Google Places API Overview

### What It Provides

The **Google Places API** (part of Google Maps Platform) allows programmatic access to:
- Place details (business information)
- User reviews (rating, text, author, date)
- Photos and ratings
- Review responses from business owners

### API Endpoint

```
GET https://maps.googleapis.com/maps/api/place/details/json
  ?place_id={PLACE_ID}
  &fields=name,rating,reviews,user_ratings_total
  &key={API_KEY}
```

### Response Example

```json
{
  "result": {
    "name": "Flex Living - Shoreditch Heights",
    "rating": 4.7,
    "user_ratings_total": 142,
    "reviews": [
      {
        "author_name": "John Smith",
        "rating": 5,
        "text": "Amazing property! Clean, modern, great location.",
        "time": 1698451200,
        "profile_photo_url": "https://...",
        "relative_time_description": "2 months ago"
      }
    ]
  }
}
```

---

## 3. Feasibility Assessment

### ✅ What's Possible

1. **Fetch Reviews Programmatically**
   - Yes, can retrieve up to 5 most helpful reviews per property
   - Includes rating, text, author name, date

2. **Normalize Review Data**
   - Can map Google reviews to same schema as Hostaway reviews
   - Direction: Always `guest-to-host` (property reviews)
   - Channel: `"google"`

3. **Display on Dashboard**
   - Merge Google reviews into unified review list
   - Filter by source: Hostaway vs Google
   - Show in public property pages

4. **Automatic Updates**
   - Can set up periodic fetching (daily/weekly)
   - Cache results to minimize API costs

### ⚠️ Limitations

1. **Limited Review Count**
   - API returns **max 5 reviews** per request
   - No pagination or full review history
   - Only "most relevant" reviews returned

2. **No Review Approval Control**
   - Cannot hide individual Google reviews
   - All or nothing: either show Google reviews or don't
   - Cannot mark specific Google reviews as "approved"

3. **Rate Limits**
   - Free tier: Very limited quota
   - Paid tier: $0.017 per request (17 cents per 10 properties)
   - Must cache aggressively to avoid costs

4. **Place ID Requirement**
   - Each property needs a unique Google Place ID
   - Manual mapping required (one-time setup)
   - Not all properties may have Google listings

5. **Review Freshness**
   - No webhooks or real-time updates
   - Must poll API periodically
   - Delayed visibility of new reviews

---

## 4. Cost Analysis

### Google Places API Pricing

| Tier | Monthly Requests | Cost |
|------|------------------|------|
| Free | 0 - $200 credit | $0 |
| Paid | Per 1,000 requests | $17 |

**Example for Flex Living:**
- 20 properties × 1 request each × 30 days = 600 requests/month
- Cost: ~$10.20/month (after free tier)

**Recommendation:** Use free tier credits initially, budget $15-20/month if scaling.

---

## 5. Implementation Plan (If Proceeding)

### Phase 1: Basic Integration (2-3 hours)

1. **Setup Google Cloud Project**
   - Enable Places API
   - Generate API key
   - Set up billing (free tier)

2. **Map Properties to Place IDs**
   - Manually find Place ID for each property
   - Store in `Property` model: `googlePlaceId` field

3. **Create API Route**
   - `/api/reviews/google?propertyId={id}`
   - Fetch reviews from Google Places API
   - Normalize to same schema as Hostaway

4. **Normalization Logic**
   ```typescript
   {
     direction: "guest-to-host",
     channel: "google",
     rating: googleReview.rating * 2, // Convert 1-5 to 0-10
     text: googleReview.text,
     guestName: googleReview.author_name,
     date: new Date(googleReview.time * 1000),
     source: "google",
     approvedForWebsite: true, // Auto-approve Google reviews
   }
   ```

5. **Merge into Dashboard**
   - Fetch both Hostaway and Google reviews
   - Combine and sort by date
   - Filter by channel

### Phase 2: Advanced Features (3-4 hours)

1. **Automatic Sync**
   - Cron job or scheduled function
   - Fetch Google reviews daily
   - Store in database for caching

2. **Review Response Integration**
   - Allow managers to respond to Google reviews
   - Post responses back to Google (requires OAuth)

3. **Analytics Dashboard**
   - Compare Hostaway vs Google ratings
   - Identify rating discrepancies
   - Track review source mix

---

## 6. Challenges & Risks

### Technical Challenges

1. **Place ID Management**
   - Manual mapping required
   - Risk: Incorrect Place IDs → wrong reviews
   - Solution: Validation step during setup

2. **Review Duplication**
   - Same guest may review on Hostaway AND Google
   - Risk: Double-counting in analytics
   - Solution: Dedupe by guest name + property + date

3. **Rating Scale Mismatch**
   - Google: 1-5 stars
   - Hostaway: 0-10 scale
   - Solution: Normalize (multiply by 2)

### Business Challenges

1. **No Review Control**
   - Cannot hide negative Google reviews
   - All reviews are public
   - Risk: Low-rated Google reviews auto-displayed

2. **API Costs**
   - Free tier may be insufficient at scale
   - Unpredictable costs if traffic spikes

3. **Review Freshness**
   - No real-time updates
   - May show stale data

---

## 7. Alternative Solutions

### Option A: Manual Google Review Import
- Manager manually copies Google reviews into dashboard
- Full control over which reviews to display
- No API costs

### Option B: Google Review Widget (Embed)
- Embed Google's official review widget on property pages
- No API required
- No control over styling

### Option C: Defer to Phase 2
- **Recommended approach for MVP**
- Focus on Hostaway integration first
- Add Google later once core features proven

---

## 8. Recommendation for MVP

### ✅ DO Implement Now:

1. **Database Schema Placeholder**
   - Add `googlePlaceId` field to `Property` model
   - Add `"google"` as valid `channel` value
   - Future-proof for easy integration

2. **UI Placeholder**
   - Show "Google Reviews coming soon" message
   - Filter dropdown includes "Google" option (disabled)

3. **Documentation**
   - This findings document
   - Integration guide for future developer

### ❌ DON'T Implement Now:

1. Full Google Places API integration
2. Automatic syncing
3. Review response features

**Rationale:**
- MVP should focus on Hostaway integration (core requirement)
- Google Reviews add complexity without high ROI
- Can add later without architectural changes

---

## 9. Technical Specification (For Future Implementation)

### Database Changes

```prisma
model Property {
  // ... existing fields
  googlePlaceId  String?  // e.g., "ChIJN1t_tDeuEmsRUsoyG83frY4"
  googleRating   Float?   // Cached Google rating
  googleReviewCount Int?  // Cached review count
}
```

### API Route Structure

```typescript
// app/api/reviews/google/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const propertyId = request.nextUrl.searchParams.get('propertyId');

  // 1. Fetch property and get googlePlaceId
  // 2. Call Google Places API
  // 3. Normalize reviews
  // 4. Return in standard format

  return Response.json({
    status: 'success',
    result: normalizedReviews,
  });
}
```

### Environment Variables

```env
GOOGLE_PLACES_API_KEY=your_api_key_here
```

---

## 10. Conclusion

**Google Reviews integration is feasible but not critical for MVP.**

### Summary:
- ✅ **Technically possible** via Google Places API
- ⚠️ **Limitations exist** (5 reviews max, no individual approval)
- 💰 **Costs are minimal** (~$10-20/month for 20 properties)
- 🕐 **Implementation time:** 2-3 hours basic, 5-7 hours full
- 📊 **Business value:** Medium (nice-to-have, not must-have)

### Final Recommendation:
**Defer to Phase 2.** Focus MVP on Hostaway integration, add Google Reviews after validating core dashboard features with users.

---

## Appendix: Useful Resources

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Places API Pricing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [Finding Place IDs](https://developers.google.com/maps/documentation/places/web-service/place-id)
- [Review Response API](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/updateReply)

---

**Document Author:** AI Development Assistant
**Reviewed By:** [To be filled]
**Next Review Date:** [After MVP launch]
