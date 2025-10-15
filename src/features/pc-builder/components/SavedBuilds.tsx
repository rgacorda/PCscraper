'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';

interface Build {
  id: string;
  name: string;
  description?: string;
  totalPrice: number;
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
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBuilds();
  }, []);

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/builds');
      const data = await response.json();
      setBuilds(data.builds);
    } catch (error) {
      console.error('Error fetching builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (buildId: string) => {
    if (!confirm('Are you sure you want to delete this build?')) return;

    setDeletingId(buildId);
    try {
      const response = await fetch(`/api/builds/${buildId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBuilds(builds.filter(b => b.id !== buildId));
      } else {
        alert('Failed to delete build');
      }
    } catch (error) {
      console.error('Error deleting build:', error);
      alert('Error deleting build');
    } finally {
      setDeletingId(null);
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
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg mb-2">No saved builds yet</p>
        <p className="text-gray-400 text-sm mb-6">Create your first PC build to see it here</p>
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
        const categoryCount = new Set(build.items.map(item => item.product.category)).size;

        return (
          <div key={build.id} className="card hover:shadow-lg transition-shadow">
            {/* Build Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{build.name}</h3>
                <p className="text-sm text-gray-500">
                  {componentCount} components • {categoryCount} categories
                </p>
                {build.description && (
                  <p className="text-sm text-gray-600 mt-1">{build.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right mr-2">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-primary-700">
                    {formatPrice(Number(build.totalPrice))}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(build.id)}
                  disabled={deletingId === build.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete build"
                >
                  {deletingId === build.id ? (
                    <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
    </div>
  );
}
