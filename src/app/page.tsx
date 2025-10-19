import { Suspense } from 'react';
import PublicBuilds from '@/components/PublicBuilds';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Hero Section */}
      <div className="mb-8 sm:mb-12">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            PC Build Gallery
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mb-4 max-w-2xl">
            Explore community PC builds and get inspired. Compare prices from top Philippine retailers: Datablitz, PCWorth, and Bermor Techzone.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/builder" className="bg-white text-primary-700 hover:bg-blue-50 font-medium py-2.5 px-5 rounded-lg transition-colors inline-flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Build</span>
            </a>
          </div>
        </div>
      </div>

      {/* Public Builds Section */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Community Builds
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Browse and discover PC builds shared by the community
        </p>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading builds...</p>
        </div>
      }>
        <PublicBuilds />
      </Suspense>
    </div>
  );
}
