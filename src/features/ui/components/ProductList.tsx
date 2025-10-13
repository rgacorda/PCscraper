'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  lowestPrice?: number;
  imageUrl?: string;
  listings: Array<{
    retailer: string;
    price: number;
    stockStatus: string;
    retailerUrl: string;
  }>;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'CPU', 'GPU', 'MOTHERBOARD', 'RAM', 'STORAGE',
    'PSU', 'CASE', 'COOLING', 'MONITOR', 'PERIPHERAL'
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 sm:mb-8 sticky top-16 z-40 bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-4 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        {(category || search) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span>Showing {products.length} results</span>
            {(category || search) && (
              <button
                onClick={() => {
                  setCategory('');
                  setSearch('');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <div key={product.id} className="card group">
            {product.imageUrl ? (
              <div className="relative overflow-hidden rounded-lg mb-3 sm:mb-4 bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.brand && (
                <span className="badge-info text-xs">{product.brand}</span>
              )}
              <span className="text-xs text-gray-500">{product.category.replace('_', ' ')}</span>
            </div>

            {product.lowestPrice && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Starting from</p>
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  {formatPrice(product.lowestPrice)}
                </p>
              </div>
            )}

            {/* Listings */}
            <div className="space-y-2">
              {product.listings.slice(0, 3).map((listing, idx) => (
                <a
                  key={idx}
                  href={listing.retailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2.5 sm:p-3 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-primary-50 hover:to-blue-100 rounded-lg transition-all border border-transparent hover:border-primary-200"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-gray-700">{listing.retailer}</span>
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      {formatPrice(Number(listing.price))}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${
                    listing.stockStatus === 'IN_STOCK'
                      ? 'badge-success'
                      : 'badge-error'
                  }`}>
                    {listing.stockStatus.replace('_', ' ')}
                  </span>
                </a>
              ))}
              {product.listings.length > 3 && (
                <p className="text-xs text-center text-gray-500 pt-1">
                  +{product.listings.length - 3} more listing{product.listings.length - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">No products found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}
