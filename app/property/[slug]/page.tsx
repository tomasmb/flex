/**
 * Public Property Detail Page
 * Server Component displaying property info and approved reviews
 * Based on design-system@1.0.0#property-review-display.v1
 */

import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { GuestReviewsSection } from '@/components/server/GuestReviewsSection';
import { Star, MapPin, Wifi, Coffee, Tv, Wind } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch property with approved GUEST-TO-HOST reviews ONLY (public-facing)
  // Spec: design-system@1.0.0#property-review-display.v1
  // CRITICAL: Only show reviews FROM guests ABOUT the property
  const property = await db.property.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: {
          isPublished: true, // Prisma client field name
          direction: 'guest-to-host', // CRITICAL: Only public-facing property reviews
        },
        orderBy: { date: 'desc' }, // Prisma client field name
        take: 6,
      },
    },
  });

  if (!property) {
    notFound();
  }

  // Calculate average rating
  const avgRating =
    property.reviews.length > 0
      ? property.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        property.reviews.length
      : 0;

  // Mock amenities for display
  const amenities = [
    { icon: Wifi, label: 'High-Speed WiFi' },
    { icon: Coffee, label: 'Coffee Machine' },
    { icon: Tv, label: 'Smart TV' },
    { icon: Wind, label: 'Air Conditioning' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border-gray">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Flex Living
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Manager Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Column: Main Content */}
          <div className="space-y-8">
            {/* Image Gallery Placeholder */}
            <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-text-muted">Property images would appear here</p>
              </div>
            </div>

            {/* Property Title */}
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">{property.name}</h1>
              <div className="flex items-center gap-2 text-text-muted">
                <MapPin className="w-4 h-4" />
                <span>{property.address || 'London, UK'}</span>
              </div>
            </div>

            {/* About */}
            <section>
              <h2 className="text-2xl font-semibold text-text-secondary mb-4">
                About This Property
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {property.description ||
                  'Experience modern living in the heart of London. This beautifully furnished property offers comfort, style, and convenience for your stay.'}
              </p>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-semibold text-text-secondary mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenities.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-surface-gray rounded-xl"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="text-sm text-text-primary">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Guest Reviews Section */}
            {property.reviews.length > 0 && (
              <GuestReviewsSection reviews={property.reviews} avgRating={avgRating} />
            )}

            {/* Stay Policies */}
            <section>
              <h2 className="text-2xl font-semibold text-text-secondary mb-4">Stay Policies</h2>
              <div className="bg-surface-gray rounded-xl p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Check-in</span>
                  <span className="text-text-primary font-medium">3:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Checkout</span>
                  <span className="text-text-primary font-medium">11:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Minimum Stay</span>
                  <span className="text-text-primary font-medium">2 nights</span>
                </div>
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="text-2xl font-semibold text-text-secondary mb-4">Location</h2>
              <div className="aspect-video bg-surface-gray rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-text-muted">Map would appear here</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-card p-6 border border-border-subtle">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-primary">£150</span>
                  <span className="text-text-muted">/ night</span>
                </div>
                {avgRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(avgRating / 2)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-text-muted">
                      {avgRating.toFixed(1)} ({property.reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Checkout
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Guests
                  </label>
                  <select className="w-full px-4 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>1 guest</option>
                    <option>2 guests</option>
                    <option>3 guests</option>
                    <option>4 guests</option>
                  </select>
                </div>
                <button className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">
                  Book Now
                </button>
              </div>

              <p className="text-xs text-text-muted text-center mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
