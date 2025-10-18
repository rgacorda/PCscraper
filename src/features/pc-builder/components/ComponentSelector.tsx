'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { formatPrice } from '@/lib/utils';
import StarRating from '@/components/StarRating';

interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  description?: string;
  imageUrl?: string;
  lowestPrice?: number;
  rating?: number;
  listings: Array<{
    id: string;
    retailer: string;
    price: number;
    stockStatus: string;
    retailerUrl: string;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ComponentSelectorProps {
  category: string;
  onSelect: (product: Product, listing: any) => void;
  onClose: () => void;
  initialSearch?: string;
}

export default function ComponentSelector({
  category,
  onSelect,
  onClose,
  initialSearch = '',
}: ComponentSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Use ref to store the latest search value for debounce
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized fetch function
  const fetchProducts = useCallback(
    async (page: number, searchQuery: string) => {
      // Don't show full loading spinner if we're just searching/paginating
      if (page === 1 && searchQuery !== search) {
        setSearching(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.append('category', category);
        if (searchQuery) params.append('search', searchQuery);
        params.append('page', page.toString());
        params.append('limit', '20');

        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        setProducts(data.products || []);
        setPagination(
          data.pagination || {
            page: page,
            limit: 20,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
        setSearching(false);
      }
    },
    [category, search]
  );

  // Initial load when category changes
  useEffect(() => {
    setSearch(initialSearch);
    fetchProducts(1, initialSearch);
  }, [category]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Set new timer for debounced search
    searchTimerRef.current = setTimeout(() => {
      fetchProducts(1, search);
    }, 400); // 400ms debounce delay

    // Cleanup function
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [search, fetchProducts]);

  const handleSelect = (product: Product) => {
    // Get the cheapest in-stock listing
    const inStockListings = product.listings.filter((l) => l.stockStatus === 'IN_STOCK');
    const listing =
      inStockListings.length > 0
        ? inStockListings.sort((a, b) => a.price - b.price)[0]
        : product.listings[0];

    onSelect(product, listing);
    onClose();
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchProducts(page, search);
    }
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;

    // Always show first page
    pages.push(1);

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        if (pages[pages.length - 1] < i - 1) {
          pages.push(-1); // Ellipsis
        }
        pages.push(i);
      }
    }

    // Always show last page
    if (totalPages > 1) {
      if (pages[pages.length - 1] < totalPages - 1) {
        pages.push(-1); // Ellipsis
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        {pages.map((page, index) => {
          if (page === -1) {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Select {category.replace('_', ' ')}
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                {pagination.total} products available
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white opacity-70"
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
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative min-h-[400px]">
          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
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
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <div className="space-y-3 relative">
              {/* Loading Overlay */}
              {(loading || searching) && products.length > 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg">
                  <div className="bg-white shadow-lg rounded-lg px-6 py-3 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {searching ? 'Searching...' : 'Loading...'}
                    </span>
                  </div>
                </div>
              )}

              {products.map((product) => {
                const cheapestListing =
                  product.listings
                    .filter((l) => l.stockStatus === 'IN_STOCK')
                    .sort((a, b) => a.price - b.price)[0] || product.listings[0];

                return (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="w-full text-left p-4 bg-white border-2 border-gray-200 hover:border-primary-500 rounded-lg transition-all hover:shadow-md group"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-10 h-10 text-blue-300"
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

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm sm:text-base line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {product.brand && (
                            <span className="badge-info text-xs">{product.brand}</span>
                          )}
                          {product.model && (
                            <span className="text-xs text-gray-500">{product.model}</span>
                          )}
                        </div>

                        {/* Rating */}
                        {product.rating && (
                          <div className="mt-2">
                            <StarRating
                              rating={product.rating}
                              totalRatings={0}
                              size="sm"
                              showCount={false}
                            />
                          </div>
                        )}

                        {/* Price & Stock */}
                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Starting from</p>
                            <p className="text-lg sm:text-xl font-bold text-primary-600">
                              {formatPrice(Number(cheapestListing.price))}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-xs font-medium ${
                                cheapestListing.stockStatus === 'IN_STOCK'
                                  ? 'badge-success'
                                  : cheapestListing.stockStatus === 'LIMITED_STOCK'
                                  ? 'badge-info'
                                  : 'badge-error'
                              }`}
                            >
                              {cheapestListing.stockStatus.replace('_', ' ')}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {cheapestListing.retailer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} products
              </p>
              {renderPagination()}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t p-4 bg-white">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
