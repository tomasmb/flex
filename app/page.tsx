import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">
          Flex Living Reviews Dashboard
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          Property reviews management and analytics platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-primary text-white px-8 py-3 rounded-xl font-medium shadow-button hover:bg-primary-dark transition-colors"
          >
            Manager Dashboard
          </Link>
          <Link
            href="/api/reviews/hostaway"
            className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-xl font-medium hover:bg-primary/5 transition-colors"
          >
            View API
          </Link>
        </div>
      </div>
    </main>
  );
}
