'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import ComponentSelector from './ComponentSelector';

interface BuildItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  retailer: string;
  imageUrl?: string;
  brand?: string;
}

export default function PCBuilder() {
  const [buildItems, setBuildItems] = useState<BuildItem[]>([]);
  const [buildName, setBuildName] = useState('My PC Build');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const addItem = (product: any, listing: any) => {
    // Remove existing item in this category if any
    const filteredItems = buildItems.filter((item) => item.category !== product.category);

    const newItem: BuildItem = {
      id: `${product.id}-${listing.id}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      price: Number(listing.price),
      retailer: listing.retailer,
      imageUrl: product.imageUrl,
      brand: product.brand,
    };

    setBuildItems([...filteredItems, newItem]);
  };

  const removeItem = (category: string) => {
    setBuildItems(buildItems.filter((item) => item.category !== category));
  };

  const totalPrice = buildItems.reduce((sum, item) => sum + item.price, 0);

  const categories = [
    'CPU',
    'GPU',
    'MOTHERBOARD',
    'RAM',
    'STORAGE',
    'PSU',
    'CASE',
    'COOLING',
  ];

  const getItemByCategory = (category: string) => {
    return buildItems.find((item) => item.category === category);
  };

  const handleSaveBuild = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: buildName,
          description: `PC Build with ${buildItems.length} components`,
          items: buildItems.map((item) => ({
            productId: item.productId,
            quantity: 1,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSaveMessage('✅ Build saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('❌ Failed to save build');
      }
    } catch (error) {
      console.error('Error saving build:', error);
      setSaveMessage('❌ Error saving build');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Build Summary - Mobile: Bottom Fixed, Desktop: Sticky Sidebar */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <div className="card lg:sticky lg:top-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold">Build Summary</h3>
            <span className="badge-info text-xs">
              {buildItems.length} / {categories.length} parts
            </span>
          </div>

          <input
            type="text"
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            className="input-field mb-4 text-sm sm:text-base"
            placeholder="Build name"
          />

          <div className="space-y-2 sm:space-y-3 mb-6 max-h-[40vh] sm:max-h-96 overflow-y-auto">
            {categories.map((category) => {
              const item = getItemByCategory(category);
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="w-full pb-2 border-b border-gray-200 last:border-0 text-left hover:bg-blue-50 -mx-2 px-2 py-2 rounded transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs sm:text-sm font-medium text-gray-600">
                      {category.replace('_', ' ')}
                    </div>
                    {item ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(category);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 z-10"
                        aria-label="Remove item"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400"
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
                    )}
                  </div>
                  {item ? (
                    <div className="flex items-center gap-2">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm text-gray-800 line-clamp-1 font-medium">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPrice(item.price)} • {item.retailer}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-primary-600 font-medium">
                      Click to select
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t pt-4 bg-gradient-to-br from-blue-50 to-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base sm:text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {saveMessage && (
              <div className="mb-3 p-2 text-sm text-center bg-white rounded-lg border-2 border-primary-200">
                {saveMessage}
              </div>
            )}

            <button
              onClick={handleSaveBuild}
              className="btn-primary w-full text-sm sm:text-base"
              disabled={buildItems.length === 0 || saving}
            >
              {saving
                ? 'Saving...'
                : buildItems.length === 0
                ? 'Add Components First'
                : 'Save Build'}
            </button>
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Build Your PC
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Click on any component category in the Build Summary to select parts. We'll
                show you the best prices from multiple retailers.
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="btn-secondary text-xs sm:text-sm"
                  >
                    Add {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {buildItems.length > 0 && (
          <div className="card mt-4 sm:mt-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Selected Components</h3>
            <div className="space-y-3 sm:space-y-4">
              {buildItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-100 hover:border-primary-300 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-info text-xs">{item.category}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{item.retailer}</span>
                    </div>
                    <div className="font-semibold text-sm sm:text-base text-gray-900">{item.name}</div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                    <div className="font-bold text-lg sm:text-xl text-primary-700">
                      {formatPrice(item.price)}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {buildItems.length === 0 && (
          <div className="card mt-4 sm:mt-6 text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-base sm:text-lg mb-2">
              No components selected yet
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Click on a category to start building your PC
            </p>
          </div>
        )}
      </div>

      {/* Component Selector Modal */}
      {selectedCategory && (
        <ComponentSelector
          category={selectedCategory}
          onSelect={addItem}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
