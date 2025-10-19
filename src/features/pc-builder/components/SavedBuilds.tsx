'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/lib/utils';
import BuildDetailsModal from '@/components/BuildDetailsModal';
import StarRating from '@/components/StarRating';
import toast from 'react-hot-toast';

interface Build {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  totalPrice: number;
  averageRating?: number | null;
  totalRatings?: number;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      category: string;
      brand?: string;
      imageUrl?: string;
      listings: Array<{
        id: string;
        retailer: string;
        price: number;
        retailerUrl: string;
      }>;
    };
  }>;
}

export default function SavedBuilds() {
  const { data: session } = useSession();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<string | null>(null);
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBuilds();
    }
  }, [session]);

  const fetchBuilds = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // Fetch builds for the current user (includes both public and private)
      const response = await fetch(`/api/builds?userId=${session.user.id}`);
      const data = await response.json();
      setBuilds(data.builds);
    } catch (error) {
      console.error('Error fetching builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (buildId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this build? This action cannot be undone.'
      )
    )
      return;

    setDeletingId(buildId);
    try {
      const response = await fetch(`/api/builds/${buildId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBuilds(builds.filter((b) => b.id !== buildId));
        toast.success('Build deleted successfully', {
          duration: 3000,
        });
      } else {
        toast.error('Failed to delete build');
      }
    } catch (error) {
      console.error('Error deleting build:', error);
      toast.error('Error deleting build');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisibility = async (buildId: string, currentStatus: boolean) => {
    setTogglingVisibilityId(buildId);
    try {
      const response = await fetch(`/api/builds/${buildId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublic: !currentStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBuilds(
          builds.map((b) =>
            b.id === buildId ? { ...b, isPublic: data.build.isPublic } : b
          )
        );
        toast.success(
          data.build.isPublic
            ? 'Build is now visible to the community! 🌍'
            : 'Build is now private 🔒',
          {
            duration: 3000,
          }
        );
      } else {
        toast.error('Failed to update build visibility');
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error('Error updating build visibility');
    } finally {
      setTogglingVisibilityId(null);
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
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-400"
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
        </div>
        <p className="text-gray-500 text-lg mb-2">No saved builds yet</p>
        <p className="text-gray-400 text-sm mb-6">
          Create your first PC build to see it here
        </p>
        <a href="/builder" className="btn-primary inline-block">
          Start Building
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {builds.map((build) => {
        const componentCount = build.items.length;
        const categoryCount = new Set(build.items.map((item) => item.product.category))
          .size;

        return (
          <div key={build.id} className="card hover:shadow-lg transition-shadow">
            {/* Build Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{build.name}</h3>
                  {/* Visibility Badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      build.isPublic
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {build.isPublic ? (
                      <>
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Public
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Private
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {componentCount} components • {categoryCount} categories
                </p>
                {build.averageRating !== undefined && (
                  <StarRating
                    rating={build.averageRating}
                    totalRatings={build.totalRatings || 0}
                    size="sm"
                  />
                )}
                {build.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {build.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right mr-2">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-primary-700">
                    {formatPrice(Number(build.totalPrice))}
                  </p>
                </div>
                {/* Toggle Visibility Button */}
                <button
                  onClick={() => handleToggleVisibility(build.id, build.isPublic)}
                  disabled={togglingVisibilityId === build.id}
                  className={`p-2 rounded-lg transition-colors ${
                    build.isPublic
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                  title={build.isPublic ? 'Make private' : 'Make public'}
                >
                  {togglingVisibilityId === build.id ? (
                    <div className="animate-spin h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                  ) : build.isPublic ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setSelectedBuildId(build.id)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="View details"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(build.id)}
                  disabled={deletingId === build.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete build"
                >
                  {deletingId === build.id ? (
                    <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                  ) : (
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {build.items.map((item) => {
                const listing = item.product.listings[0];

                return (
                  <a
                    key={item.id}
                    href={listing?.retailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-primary-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-all group"
                  >
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 rounded object-cover border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">
                        {item.product.category.replace('_', ' ')}
                      </p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
                        {item.product.brand && (
                          <span className="text-primary-600">{item.product.brand} </span>
                        )}
                        {item.product.name}
                      </p>
                      {listing && (
                        <p className="text-sm font-bold text-gray-700 mt-1">
                          {formatPrice(Number(listing.price))}
                        </p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Build Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>Created {new Date(build.createdAt).toLocaleDateString()}</span>
              <a
                href={`/builder?build=${build.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
              >
                Edit Build →
              </a>
            </div>
          </div>
        );
      })}

      {/* Build Details Modal */}
      {selectedBuildId && (
        <BuildDetailsModal
          buildId={selectedBuildId}
          onClose={() => setSelectedBuildId(null)}
        />
      )}
    </div>
  );
}
