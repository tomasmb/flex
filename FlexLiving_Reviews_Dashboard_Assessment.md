# Flex Living - Developer Assessment

## 1. Introduction

You are tasked with building a Reviews Dashboard for Flex Living. This tool will help managers assess how each property is performing based on guest reviews.

## 2. Scope of Work

### 1. Hostaway Integration (Mocked)
- Integrate with the Hostaway Reviews API. Note: the API is sandboxed and contains no reviews.
- Use the provided JSON to mock realistic review data.
- Parse and normalize reviews by listing, review type, channel, and date.

### 2. Manager Dashboard
- Build a user-friendly, modern dashboard interface.
- The dashboard should allow managers to:
  - See per-property performance
  - Filter or sort by rating, category, channel, or time
  - Spot trends or recurring issues
  - Select which reviews should be displayed on the public website
- Use your judgment to design a clean and intuitive UI. Think like a product manager.

### 3. Review Display Page
- Replicate the Flex Living website property details layout.
- Add a dedicated section within that layout to display selected guest reviews.
- Reviews should be displayed only if approved/selected by the manager in the dashboard.
- Ensure the design is consistent with the Flex Living property page style.

### 4. Google Reviews (Exploration)
- Explore if Google Reviews can be integrated (via Places API or other).
- If feasible, implement basic integration.
- If not, include findings in your documentation.

## 3. Evaluation Criteria

- Handling and normalization of real-world JSON review data
- Code clarity and structure
- UX/UI design quality and decision-making
- Insightfulness of the dashboard features
- Problem-solving initiative for undefined or ambiguous requirements

## 4. Deliverables

- Source code (frontend and backend if applicable)
- Running version or local setup instructions
- Brief documentation (1-2 pages):
  - Tech stack used
  - Key design and logic decisions
  - API behaviors
  - Google Reviews findings (if any)

## 5. API Access

**Account ID:** 61148

**API Key:** f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152

## 6. Important Notes

Access to sandbox Hostaway API will be provided.

Mock review data has been shared separately.

**Important:**

You must implement the API route that fetches and normalizes reviews (e.g. GET /api/reviews/hostaway).

This route will be tested and should return structured, usable data for the frontend.

Good luck and think like a product owner!

## 7. Hostaway API Response Example

```json
{
  "status": "success",
  "result": [
    {
      "id": 7453,
      "type": "host-to-guest",
      "status": "published",
      "rating": null,
      "publicReview": "Shane and family are wonderful! Would definitely host again :)",
      "reviewCategory": [
        {
          "category": "cleanliness",
          "rating": 10
        },
        {
          "category": "communication",
          "rating": 10
        },
        {
          "category": "respect_house_rules",
          "rating": 10
        }
      ],
      "submittedAt": "2020-08-21 22:45:14",
      "guestName": "Shane Finkelstein",
      "listingName": "2B N1 A - 29 Shoreditch Heights"
    }
  ]
}
```
