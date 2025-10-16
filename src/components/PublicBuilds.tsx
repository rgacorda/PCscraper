'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BuildDetailsModal from './BuildDetailsModal';
import FavoriteButton from './FavoriteButton';

interface Build {
  id: string;
  name: string;
  description: string | null;
  totalPrice: number;
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  } | null;
  items: any[];
  averageRating: number | null;
  totalRatings: number;
  _count?: {
    favorites: number;
  };
}

export default function PublicBuilds() {
  const searchParams = useSearchParams();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicBuilds();

    // Check if there's a buildId in URL to open modal
    const buildId = searchParams.get('buildId');
    if (buildId) {
      setSelectedBuildId(buildId);
    }
  }, [searchParams]);

  const fetchPublicBuilds = async () => {
    try {
      const response = await fetch('/api/builds');
      if (response.ok) {
        const data = await response.json();
        setBuilds(data.builds);
      }
    } catch (error) {
      console.error('Error fetching builds:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading builds...</p>
      </div>
    );
  }

  if (builds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No public builds yet
        </h3>
        <p className="text-gray-600 mb-6">
          Be the first to share your PC build with the community!
        </p>
        <a
          href="/builder"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create Your Build
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {builds.map((build) => {
          // Find key components for display
          const caseItem = build.items.find((item: any) => item.product.category === 'CASE');
          const cpuItem = build.items.find((item: any) => item.product.category === 'CPU');
          const gpuItem = build.items.find((item: any) => item.product.category === 'GPU');
          const ramItem = build.items.find((item: any) => item.product.category === 'RAM');

          // Main image: Case > GPU > CPU
          const mainImage = caseItem?.product.imageUrl || gpuItem?.product.imageUrl || cpuItem?.product.imageUrl;

          // Component images (show if not used as main image)
          const componentImages = [
            caseItem?.product.imageUrl ? null : cpuItem?.product.imageUrl,
            caseItem?.product.imageUrl ? cpuItem?.product.imageUrl : null,
            ramItem?.product.imageUrl,
            caseItem?.product.imageUrl ? gpuItem?.product.imageUrl : null,
          ].filter(Boolean);

          return (
            <div
              key={build.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
              onClick={() => setSelectedBuildId(build.id)}
            >
              {/* Main Image */}
              {mainImage && (
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={mainImage}
                    alt={build.name}
                    className="w-full h-full object-contain p-4"
                  />
                  {/* Component Images Overlay */}
                  {componentImages.length > 0 && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {componentImages.slice(0, 3).map((img, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 bg-white rounded border border-gray-300 shadow-sm overflow-hidden"
                        >
                          <img
                            src={img as string}
                            alt="Component"
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                {/* Header with Favorite Button */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                      {build.name}
                    </h3>
                    {build.user && (
                      <p className="text-sm text-gray-500">
                        by {build.user.name || 'Anonymous'}
                      </p>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton buildId={build.id} size="md" />
                  </div>
                </div>

              {/* Description */}
              {build.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {build.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>
                    {build.averageRating
                      ? build.averageRating.toFixed(1)
                      : 'N/A'}{' '}
                    ({build.totalRatings})
                  </span>
                </div>
                {build._count?.favorites !== undefined && (
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{build._count.favorites}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span>{build.items.length} parts</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-primary-600">
                  ₱
                  {Number(build.totalPrice).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* View Button */}
              <button
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                onClick={() => setSelectedBuildId(build.id)}
              >
                View Details
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {/* Build Details Modal */}
      {selectedBuildId && (
        <BuildDetailsModal
          buildId={selectedBuildId}
          onClose={() => setSelectedBuildId(null)}
        />
      )}
    </>
  );
}
