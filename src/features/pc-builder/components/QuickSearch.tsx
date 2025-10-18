'use client';

import { useState, useRef, useEffect } from 'react';
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

interface QuickSearchProps {
  onSelect: (product: Product, listing: any) => void;
  onOpenModal: (category: string, search: string) => void;
}

export default function QuickSearch({ onSelect, onOpenModal }: QuickSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handle global click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      params.append('limit', '50');

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setResults(data.products || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Error searching products:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce search
    timeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSelectProduct = (product: Product) => {
    const inStockListings = product.listings.filter((l) => l.stockStatus === 'IN_STOCK');
    const listing =
      inStockListings.length > 0
        ? inStockListings.sort((a, b) => a.price - b.price)[0]
        : product.listings[0];

    onSelect(product, listing);
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleViewAll = (category: string) => {
    onOpenModal(category, searchQuery);
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // Group results by category
  const groupedResults = results.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
          ref={searchInputRef}
          type="text"
          placeholder="Quick search for components..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => searchQuery && setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:ring-0 transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchQuery.trim() && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 max-h-[600px] overflow-y-auto"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {Object.entries(groupedResults).map(([category, products]) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50">
                    {category.replace('_', ' ')} ({products.length})
                  </div>

                  {/* Products in Category */}
                  <div className="space-y-1">
                    {products.length < 10 ? (
                      // Show individual items if less than 10
                      products.map((product) => {
                        const cheapestListing =
                          product.listings
                            .filter((l) => l.stockStatus === 'IN_STOCK')
                            .sort((a, b) => a.price - b.price)[0] || product.listings[0];

                        return (
                          <button
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            className="w-full text-left px-3 py-2.5 hover:bg-primary-50 rounded transition-colors flex items-center gap-3 group"
                          >
                            {/* Image */}
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-5 h-5 text-gray-400"
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
                              <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600 truncate">
                                {product.brand && (
                                  <span className="text-primary-600">
                                    {product.brand}{' '}
                                  </span>
                                )}
                                {product.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {product.rating && (
                                  <StarRating
                                    rating={product.rating}
                                    size="sm"
                                    showCount={false}
                                  />
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatPrice(Number(cheapestListing.price))}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      // Show "View All" button if 10 or more
                      <button
                        onClick={() => handleViewAll(category)}
                        className="w-full text-left px-3 py-3 hover:bg-primary-50 rounded transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                            View all {products.length} {category.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Click to see all results for this category
                          </p>
                        </div>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-primary-600 flex-shrink-0 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
