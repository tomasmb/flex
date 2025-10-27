/**
 * Property Management Functions
 * Find or create properties based on listing names
 * Based on architecture@1.0.0#core-functions.find-or-create-property.v1
 */

import { db } from './db';

/**
 * Generate URL-friendly slug from listing name
 * "2B N1 A - 29 Shoreditch Heights" → "2b-n1-a-29-shoreditch-heights"
 */
function generateSlug(listingName: string): string {
  return listingName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Find or create property by listing name
 * Returns the property ID (either existing or newly created)
 */
export async function findOrCreateProperty(listingName: string): Promise<string> {
  // Try to find existing property
  let property = await db.property.findFirst({
    where: { name: listingName },
  });

  // If doesn't exist, create it
  if (!property) {
    const slug = generateSlug(listingName);

    // Extract location from listing name (usually after the dash)
    const locationMatch = listingName.match(/- (.+)$/);
    const location = locationMatch ? locationMatch[1] : 'London';

    // Map to one of the available cities: London, Paris, Algiers, Lisbon
    const availableCities = ['London', 'Paris', 'Algiers', 'Lisbon'];
    let city = 'London'; // Default

    // Check if location contains any of the city names
    for (const availableCity of availableCities) {
      if (location.toLowerCase().includes(availableCity.toLowerCase())) {
        city = availableCity;
        break;
      }
    }

    // If no match, assign based on hash for consistent distribution
    if (city === 'London' && !location.toLowerCase().includes('london')) {
      const hash = listingName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      city = availableCities[hash % availableCities.length];
    }

    property = await db.property.create({
      data: {
        name: listingName,
        slug,
        description: `Beautiful property in ${location}`,
        address: location,
        city,
      },
    });
  }

  return property.id;
}

/**
 * Get all properties with review counts
 */
export async function getAllPropertiesWithReviews() {
  return db.property.findMany({
    include: {
      reviews: {
        orderBy: { submittedAt: 'desc' },
      },
    },
  });
}

/**
 * Get property by slug with approved reviews
 */
export async function getPropertyBySlug(slug: string) {
  return db.property.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { approvedForWebsite: true },
        orderBy: { submittedAt: 'desc' },
        take: 6, // Show 6 most recent approved reviews
      },
    },
  });
}
