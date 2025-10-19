import { Suspense } from 'react';
import Link from 'next/link';
import SavedBuilds from '@/features/pc-builder/components/SavedBuilds';

export default function MyBuildsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Hero Section */}
      <div className="mb-8 sm:mb-12">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            My PC Builds
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mb-4 max-w-2xl">
            View, edit, and manage your saved PC builds. Share them with the community or
            keep them private.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/builder"
              className="bg-white text-primary-700 hover:bg-blue-50 font-medium py-2.5 px-5 rounded-lg transition-colors inline-flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create New Build</span>
            </Link>
            <Link
              href="/"
              className="bg-primary-800 hover:bg-primary-900 text-white font-medium py-2.5 px-5 rounded-lg transition-colors inline-flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Browse Community</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Saved Builds Section */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Your Saved Builds
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          View, edit, and manage your custom PC configurations. Toggle visibility to share
          builds with the community or keep them private.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading builds...</p>
          </div>
        }
      >
        <SavedBuilds />
      </Suspense>
    </div>
  );
}
