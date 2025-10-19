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

interface Filters {
  cpuBrand?: string;
  gpuBrand?: string;
  gpuSeries?: string;
  motherboardChipset?: string;
  ramType?: string;
  storageCapacity?: string;
  storageType?: string;
  peripheralType?: string;
  monitorRefreshRate?: string;
  monitorPanelType?: string;
  monitorScreenSize?: string;
  minPrice?: number;
  maxPrice?: number;
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [currentFilterPage, setCurrentFilterPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Use ref to store the latest search value for debounce
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter products based on category-specific filters
  const applyFilters = (productsList: Product[]): Product[] => {
    return productsList.filter((product) => {
      const name = product.name.toLowerCase();

      // CPU Brand Filter (AMD, Intel)
      if (filters.cpuBrand && category === 'CPU') {
        if (!name.includes(filters.cpuBrand.toLowerCase())) {
          return false;
        }
      }

      // GPU Brand Filter (GeForce/NVIDIA, Radeon/AMD)
      if (filters.gpuBrand && category === 'GPU') {
        const filterLower = filters.gpuBrand.toLowerCase();
        // Check for GeForce or Radeon/RX
        if (filterLower === 'geforce') {
          if (!name.includes('geforce') && !name.includes('nvidia')) {
            return false;
          }
        } else if (filterLower === 'radeon') {
          if (
            !name.includes('radeon') &&
            !name.includes('rx ') &&
            !name.includes('rx5') &&
            !name.includes('rx6') &&
            !name.includes('rx7')
          ) {
            return false;
          }
        }
      }

      // GPU Series Filter (RTX 3000, RTX 4000, RX 5000, RX 6000, RX 7000, etc.)
      if (filters.gpuSeries && category === 'GPU') {
        const series = filters.gpuSeries.toLowerCase();
        let found = false;

        // NVIDIA RTX Series
        if (series === 'rtx 2000') {
          found =
            name.includes('rtx 20') ||
            name.includes('rtx20') ||
            name.includes('2060') ||
            name.includes('2070') ||
            name.includes('2080') ||
            name.includes('2090');
        } else if (series === 'rtx 3000') {
          found =
            name.includes('rtx 30') ||
            name.includes('rtx30') ||
            name.includes('3060') ||
            name.includes('3070') ||
            name.includes('3080') ||
            name.includes('3090');
        } else if (series === 'rtx 4000') {
          found =
            name.includes('rtx 40') ||
            name.includes('rtx40') ||
            name.includes('4060') ||
            name.includes('4070') ||
            name.includes('4080') ||
            name.includes('4090');
        } else if (series === 'rtx 5000') {
          found =
            name.includes('rtx 50') ||
            name.includes('rtx50') ||
            name.includes('5060') ||
            name.includes('5070') ||
            name.includes('5080') ||
            name.includes('5090');
        }
        // NVIDIA GTX Series
        else if (series === 'gtx 1000') {
          found =
            name.includes('gtx 10') ||
            name.includes('gtx10') ||
            name.includes('1050') ||
            name.includes('1060') ||
            name.includes('1070') ||
            name.includes('1080');
        } else if (series === 'gtx 1600') {
          found =
            name.includes('gtx 16') ||
            name.includes('gtx16') ||
            name.includes('1650') ||
            name.includes('1660');
        }
        // AMD Radeon RX 5000 Series
        else if (series === 'rx 5000') {
          found =
            name.includes('rx 5') ||
            name.includes('rx5') ||
            name.includes('5500') ||
            name.includes('5600') ||
            name.includes('5700');
        }
        // AMD Radeon RX 6000 Series
        else if (series === 'rx 6000') {
          found =
            name.includes('rx 6') ||
            name.includes('rx6') ||
            name.includes('6500') ||
            name.includes('6600') ||
            name.includes('6700') ||
            name.includes('6800') ||
            name.includes('6900') ||
            name.includes('6950');
        }
        // AMD Radeon RX 7000 Series
        else if (series === 'rx 7000') {
          found =
            name.includes('rx 7') ||
            name.includes('rx7') ||
            name.includes('7600') ||
            name.includes('7700') ||
            name.includes('7800') ||
            name.includes('7900');
        }
        // AMD Radeon RX 9000 Series (future-proofing)
        else if (series === 'rx 9000') {
          found =
            name.includes('rx 9') ||
            name.includes('rx9') ||
            name.includes('9600') ||
            name.includes('9700') ||
            name.includes('9800') ||
            name.includes('9900');
        }

        if (!found) {
          return false;
        }
      }

      // Motherboard Chipset Filter (B450, B550, X570, Z690, etc.)
      if (filters.motherboardChipset && category === 'MOTHERBOARD') {
        if (!name.includes(filters.motherboardChipset.toLowerCase())) {
          return false;
        }
      }

      // RAM Type Filter (DDR3, DDR4, DDR5)
      if (filters.ramType && category === 'RAM') {
        if (!name.includes(filters.ramType.toLowerCase())) {
          return false;
        }
      }

      // Storage Capacity Filter (256GB, 512GB, 1TB, 2TB, etc.)
      if (filters.storageCapacity && category === 'STORAGE') {
        const capacity = filters.storageCapacity.toLowerCase();
        // Handle both "GB" and "TB" formats, with or without space
        if (
          !name.includes(capacity) &&
          !name.includes(capacity.replace('gb', ' gb')) &&
          !name.includes(capacity.replace('tb', ' tb'))
        ) {
          return false;
        }
      }

      // Storage Type Filter (SSD, HDD)
      if (filters.storageType && category === 'STORAGE') {
        const storageType = filters.storageType.toLowerCase();
        if (!name.includes(storageType)) {
          return false;
        }
      }

      // Peripheral Type Filter (mouse, keyboard, headset, combo)
      if (filters.peripheralType && category === 'PERIPHERAL') {
        if (!name.includes(filters.peripheralType.toLowerCase())) {
          return false;
        }
      }

      // Monitor Refresh Rate Filter (60Hz, 75Hz, 144Hz, 165Hz, 240Hz, etc.)
      if (filters.monitorRefreshRate && category === 'MONITOR') {
        const refreshRate = filters.monitorRefreshRate.toLowerCase();
        // Handle both "Hz" formats, with or without space, and variations like "144hz" or "144 Hz"
        if (
          !name.includes(refreshRate) &&
          !name.includes(refreshRate.replace('hz', ' hz')) &&
          !name.includes(refreshRate.replace('hz', ''))
        ) {
          return false;
        }
      }

      // Monitor Panel Type Filter (IPS, VA, OLED, TN)
      if (filters.monitorPanelType && category === 'MONITOR') {
        const panelType = filters.monitorPanelType.toLowerCase();
        if (!name.includes(panelType)) {
          return false;
        }
      }

      // Monitor Screen Size Filter (24", 27", 32", etc.)
      if (filters.monitorScreenSize && category === 'MONITOR') {
        const screenSize = filters.monitorScreenSize;
        // Handle both with and without quotes/inches symbol
        if (
          !name.includes(screenSize) &&
          !name.includes(screenSize.replace('"', '')) &&
          !name.includes(screenSize.replace('"', ' '))
        ) {
          return false;
        }
      }

      // Price Range Filter
      // Get the cheapest listing price for accurate filtering
      const prices = product.listings
        .filter((l) => l.stockStatus === 'IN_STOCK')
        .map((l) => Number(l.price));

      // Fall back to lowestPrice if no in-stock listings
      const lowestPrice =
        prices.length > 0
          ? Math.min(...prices)
          : product.lowestPrice
          ? Number(product.lowestPrice)
          : product.listings.length > 0
          ? Math.min(...product.listings.map((l) => Number(l.price)))
          : 0;

      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        if (lowestPrice < filters.minPrice) {
          return false;
        }
      }
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        if (lowestPrice > filters.maxPrice) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredProducts = applyFilters(products);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '' && v !== 0
  );

  // Client-side pagination for filtered products
  const itemsPerPage = 20;
  const paginatedFilteredProducts = hasActiveFilters
    ? filteredProducts.slice(
        (currentFilterPage - 1) * itemsPerPage,
        currentFilterPage * itemsPerPage
      )
    : filteredProducts;

  const filteredTotalPages = hasActiveFilters
    ? Math.ceil(filteredProducts.length / itemsPerPage)
    : 0;

  // Memoized fetch function
  const fetchProducts = useCallback(
    async (page: number, searchQuery: string, currentFilters: Filters) => {
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

        // If filters are active, fetch all products; otherwise use pagination
        if (hasActiveFilters) {
          params.append('page', '1');
          params.append('limit', '10000'); // Large number to get all products
        } else {
          params.append('page', page.toString());
          params.append('limit', '20');
        }

        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        setProducts(data.products || []);
        setPagination(
          data.pagination || {
            page: hasActiveFilters ? 1 : page,
            limit: hasActiveFilters ? 10000 : 20,
            total: 0,
            totalPages: hasActiveFilters ? 1 : 0,
          }
        );
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
        setSearching(false);
      }
    },
    [category, search, hasActiveFilters]
  );

  // Initial load when category changes
  useEffect(() => {
    setSearch(initialSearch);
    fetchProducts(1, initialSearch, filters);
  }, [category]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Set new timer for debounced search
    searchTimerRef.current = setTimeout(() => {
      fetchProducts(1, search, filters);
    }, 400); // 400ms debounce delay

    // Cleanup function
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [search, fetchProducts]);

  // Refetch when filters change
  useEffect(() => {
    if (hasActiveFilters) {
      fetchProducts(1, search, filters);
      setCurrentFilterPage(1); // Reset to first page when filters change
    }
  }, [filters, hasActiveFilters]);

  // Reset filter page when filters are cleared
  useEffect(() => {
    if (!hasActiveFilters) {
      setCurrentFilterPage(1);
    }
  }, [hasActiveFilters]);

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
      fetchProducts(page, search, filters);
    }
  };

  const goToFilterPage = (page: number) => {
    if (page >= 1 && page <= filteredTotalPages) {
      setCurrentFilterPage(page);
      // Scroll to top of products list
      const productsList = document.querySelector('.products-list-container');
      if (productsList) {
        productsList.scrollTop = 0;
      }
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

  const renderFilteredPagination = () => {
    if (filteredTotalPages <= 1) return null;

    const pages = [];
    const currentPage = currentFilterPage;
    const totalPages = filteredTotalPages;

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
          onClick={() => goToFilterPage(currentPage - 1)}
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
              onClick={() => goToFilterPage(page)}
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
          onClick={() => goToFilterPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div
      className="fixed bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 overflow-auto"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Select {category.replace('_', ' ')}
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                {filteredProducts.length} of {pagination.total} products shown
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

          {/* Filter Toggle Button */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all text-sm font-medium"
            >
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
              {Object.values(filters).filter((v) => v !== undefined && v !== '').length >
                0 && (
                <span className="px-2 py-0.5 bg-white text-primary-600 rounded-full text-xs font-bold">
                  {
                    Object.values(filters).filter((v) => v !== undefined && v !== '')
                      .length
                  }
                </span>
              )}
            </button>
            {Object.values(filters).filter((v) => v !== undefined && v !== '').length >
              0 && (
              <button
                onClick={() => setFilters({})}
                className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-b bg-gray-50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* CPU Brand Filter */}
              {category === 'CPU' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPU Brand
                  </label>
                  <select
                    value={filters.cpuBrand || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, cpuBrand: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Brands</option>
                    <option value="AMD">AMD</option>
                    <option value="Intel">Intel</option>
                  </select>
                </div>
              )}

              {/* GPU Brand Filter */}
              {category === 'GPU' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPU Brand
                  </label>
                  <select
                    value={filters.gpuBrand || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, gpuBrand: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Brands</option>
                    <option value="GeForce">NVIDIA GeForce</option>
                    <option value="Radeon">AMD Radeon / RX</option>
                  </select>
                </div>
              )}

              {/* GPU Series Filter */}
              {category === 'GPU' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPU Series
                  </label>
                  <select
                    value={filters.gpuSeries || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, gpuSeries: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Series</option>
                    <optgroup label="NVIDIA RTX">
                      <option value="RTX 2000">RTX 2000 Series</option>
                      <option value="RTX 3000">RTX 3000 Series</option>
                      <option value="RTX 4000">RTX 4000 Series</option>
                      <option value="RTX 5000">RTX 5000 Series</option>
                    </optgroup>
                    <optgroup label="NVIDIA GTX">
                      <option value="GTX 1000">GTX 1000 Series</option>
                      <option value="GTX 1600">GTX 1600 Series</option>
                    </optgroup>
                    <optgroup label="AMD Radeon">
                      <option value="RX 5000">RX 5000 Series</option>
                      <option value="RX 6000">RX 6000 Series</option>
                      <option value="RX 7000">RX 7000 Series</option>
                      <option value="RX 9000">RX 9000 Series</option>
                    </optgroup>
                  </select>
                </div>
              )}

              {/* Motherboard Chipset Filter */}
              {category === 'MOTHERBOARD' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chipset
                  </label>
                  <select
                    value={filters.motherboardChipset || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        motherboardChipset: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Chipsets</option>
                    <optgroup label="AMD">
                      <option value="A320">A320</option>
                      <option value="B450">B450</option>
                      <option value="B550">B550</option>
                      <option value="X470">X470</option>
                      <option value="X570">X570</option>
                      <option value="B650">B650</option>
                      <option value="B850">B850</option>
                      <option value="X670">X670</option>
                      <option value="X870">X870</option>
                    </optgroup>
                    <optgroup label="Intel">
                      <option value="B460">B460</option>
                      <option value="B560">B560</option>
                      <option value="B660">B660</option>
                      <option value="B760">B760</option>
                      <option value="B860">B860</option>
                      <option value="H410">H410</option>
                      <option value="H510">H510</option>
                      <option value="H610">H610</option>
                      <option value="H810">H810</option>
                      <option value="Z490">Z490</option>
                      <option value="Z590">Z590</option>
                      <option value="Z690">Z690</option>
                      <option value="Z790">Z790</option>
                      <option value="z890">Z890</option>
                    </optgroup>
                  </select>
                </div>
              )}

              {/* RAM Type Filter */}
              {category === 'RAM' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RAM Type
                  </label>
                  <select
                    value={filters.ramType || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, ramType: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="DDR3">DDR3</option>
                    <option value="DDR4">DDR4</option>
                    <option value="DDR5">DDR5</option>
                  </select>
                </div>
              )}

              {/* Storage Capacity Filter */}
              {category === 'STORAGE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity
                  </label>
                  <select
                    value={filters.storageCapacity || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        storageCapacity: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Capacities</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                    <option value="2TB">2TB</option>
                    <option value="4TB">4TB</option>
                    <option value="8TB">8TB</option>
                  </select>
                </div>
              )}

              {/* Storage Type Filter */}
              {category === 'STORAGE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Type
                  </label>
                  <select
                    value={filters.storageType || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        storageType: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="SSD">SSD</option>
                    <option value="HDD">HDD</option>
                    <option value="NVMe">NVMe</option>
                    <option value="M.2">M.2</option>
                  </select>
                </div>
              )}

              {/* Peripheral Type Filter */}
              {category === 'PERIPHERAL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peripheral Type
                  </label>
                  <select
                    value={filters.peripheralType || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        peripheralType: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="Mouse">Mouse</option>
                    <option value="Keyboard">Keyboard</option>
                    <option value="Headset">Headset</option>
                    <option value="Combo">Combo</option>
                    <option value="Webcam">Webcam</option>
                    <option value="Microphone">Microphone</option>
                  </select>
                </div>
              )}

              {/* Monitor Refresh Rate Filter */}
              {category === 'MONITOR' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Rate
                  </label>
                  <select
                    value={filters.monitorRefreshRate || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        monitorRefreshRate: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Refresh Rates</option>
                    <option value="60Hz">60Hz</option>
                    <option value="75Hz">75Hz</option>
                    <option value="100Hz">100Hz</option>
                    <option value="120Hz">120Hz</option>
                    <option value="144Hz">144Hz</option>
                    <option value="165Hz">165Hz</option>
                    <option value="180Hz">180Hz</option>
                    <option value="240Hz">240Hz</option>
                    <option value="280Hz">280Hz</option>
                    <option value="360Hz">360Hz</option>
                  </select>
                </div>
              )}

              {/* Monitor Panel Type Filter */}
              {category === 'MONITOR' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Panel Type
                  </label>
                  <select
                    value={filters.monitorPanelType || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        monitorPanelType: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Panel Types</option>
                    <option value="IPS">IPS</option>
                    <option value="VA">VA</option>
                    <option value="OLED">OLED</option>
                    <option value="TN">TN</option>
                  </select>
                </div>
              )}

              {/* Monitor Screen Size Filter */}
              {category === 'MONITOR' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Screen Size
                  </label>
                  <select
                    value={filters.monitorScreenSize || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        monitorScreenSize: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Sizes</option>
                    <option value='21.5"'>21.5&quot;</option>
                    <option value='23.8"'>23.8&quot;</option>
                    <option value='24"'>24&quot;</option>
                    <option value='27"'>27&quot;</option>
                    <option value='32"'>32&quot;</option>
                    <option value='34"'>34&quot;</option>
                    <option value='49"'>49&quot;</option>
                  </select>
                </div>
              )}

              {/* Price Range Filter - Always Available */}
              <div
                className={
                  category === 'CPU' ||
                  category === 'GPU' ||
                  category === 'MOTHERBOARD' ||
                  category === 'RAM' ||
                  category === 'STORAGE' ||
                  category === 'PERIPHERAL' ||
                  category === 'MONITOR'
                    ? 'sm:col-span-2'
                    : 'sm:col-span-2 lg:col-span-3'
                }
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative min-h-[400px] products-list-container">
          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
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
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="space-y-3 relative">
              {/* Loading Overlay */}
              {(loading || searching) && paginatedFilteredProducts.length > 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg">
                  <div className="bg-white shadow-lg rounded-lg px-6 py-3 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {searching ? 'Searching...' : 'Loading...'}
                    </span>
                  </div>
                </div>
              )}

              {paginatedFilteredProducts.map((product) => {
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
                {hasActiveFilters ? (
                  <>
                    Showing {(currentFilterPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentFilterPage * itemsPerPage, filteredProducts.length)}{' '}
                    of {filteredProducts.length} filtered product
                    {filteredProducts.length !== 1 ? 's' : ''}
                    {filteredProducts.length < products.length && (
                      <span className="text-primary-600 font-medium">
                        {' '}
                        (from {products.length} total)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Showing {paginatedFilteredProducts.length} of {pagination.total}{' '}
                    products
                  </>
                )}
              </p>
              {hasActiveFilters ? renderFilteredPagination() : renderPagination()}
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
