import { Suspense } from 'react';
import ProductList from '@/features/ui/components/ProductList';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Hero Section */}
      <div className="mb-8 sm:mb-12">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Find the Best PC Part Deals
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mb-4 max-w-2xl">
            Compare prices from top Philippine retailers: Datablitz, PCWorx, and Bermor Techzone. Build your dream PC at the best prices.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/builder" className="bg-white text-primary-700 hover:bg-blue-50 font-medium py-2.5 px-5 rounded-lg transition-colors inline-flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>Start Building</span>
            </a>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Browse All Parts
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Search and filter through thousands of PC components
        </p>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      }>
        <ProductList />
      </Suspense>
    </div>
  );
}
