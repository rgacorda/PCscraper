import { Suspense } from 'react';
import PCBuilder from '@/features/pc-builder/components/PCBuilder';

export default function BuilderPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          PC Builder
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Build your custom PC configuration and compare prices from multiple retailers
        </p>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading builder...</p>
        </div>
      }>
        <PCBuilder />
      </Suspense>
    </div>
  );
}
