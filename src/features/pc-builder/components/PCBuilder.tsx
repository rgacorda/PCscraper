'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import ComponentSelector from './ComponentSelector';
import SaveOptionsModal from './SaveOptionsModal';

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

interface ComponentCategory {
  key: string;
  name: string;
  icon: string;
  allowMultiple?: boolean;
}

export default function PCBuilder() {
  const [buildItems, setBuildItems] = useState<BuildItem[]>([]);
  const [buildName, setBuildName] = useState('My PC Build');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  // Component categories matching PCPartPicker style
  const componentCategories: ComponentCategory[] = [
    { key: 'CPU', name: 'CPU', icon: '🔲' },
    { key: 'CPU_COOLER', name: 'CPU Cooler', icon: '❄️' },
    { key: 'MOTHERBOARD', name: 'Motherboard', icon: '🔌' },
    { key: 'RAM', name: 'Memory', icon: '💾', allowMultiple: true },
    { key: 'STORAGE', name: 'Storage', icon: '💿', allowMultiple: true },
    { key: 'GPU', name: 'Video Card', icon: '🎮' },
    { key: 'CASE', name: 'Case', icon: '📦' },
    { key: 'PSU', name: 'Power Supply', icon: '⚡' },
    { key: 'CASE_FAN', name: 'Case Fan', icon: '🌀', allowMultiple: true },
    { key: 'MONITOR', name: 'Monitor', icon: '🖥️', allowMultiple: true },
    { key: 'PERIPHERAL', name: 'Keyboard / Mouse', icon: '⌨️', allowMultiple: true },
    { key: 'ACCESSORY', name: 'Accessories', icon: '🔧', allowMultiple: true },
  ];

  const addItem = (product: any, listing: any) => {
    const category = componentCategories.find(c => c.key === product.category);

    // If category doesn't allow multiple, remove existing item
    if (!category?.allowMultiple) {
      setBuildItems(buildItems.filter((item) => item.category !== product.category));
    }

    const newItem: BuildItem = {
      id: `${product.id}-${listing.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      price: Number(listing.price),
      retailer: listing.retailer,
      imageUrl: product.imageUrl,
      brand: product.brand,
    };

    setBuildItems([...buildItems, newItem]);
    setSelectedCategory(null);
  };

  const removeItem = (itemId: string) => {
    setBuildItems(buildItems.filter((item) => item.id !== itemId));
  };

  const getItemsByCategory = (category: string) => {
    return buildItems.filter((item) => item.category === category);
  };

  const totalPrice = buildItems.reduce((sum, item) => sum + item.price, 0);

  const handleSaveToHomepage = async () => {
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
        setSaveMessage('✅ Build saved to homepage!');
        setShowSaveOptions(false);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setSaveMessage('❌ Failed to save build');
        setShowSaveOptions(false);
      }
    } catch (error) {
      console.error('Error saving build:', error);
      setSaveMessage('❌ Error saving build');
      setShowSaveOptions(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToPDF = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/builds/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: buildName,
          description: `PC Build with ${buildItems.length} components`,
          items: buildItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            category: item.category,
            price: item.price,
            retailer: item.retailer,
            brand: item.brand,
            imageUrl: item.imageUrl,
          })),
          totalPrice,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${buildName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setSaveMessage('✅ PDF downloaded successfully!');
        setShowSaveOptions(false);
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('❌ Failed to generate PDF');
        setShowSaveOptions(false);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSaveMessage('❌ Error generating PDF');
      setShowSaveOptions(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              className="text-2xl font-bold border-0 border-b-2 border-transparent hover:border-primary-300 focus:border-primary-600 focus:ring-0 px-0 py-1 transition-colors"
              placeholder="Build name"
            />
            <p className="text-sm text-gray-500 mt-1">{buildItems.length} components selected</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Estimated Total</p>
              <p className="text-2xl font-bold text-primary-700">{formatPrice(totalPrice)}</p>
            </div>
            <button
              onClick={() => setShowSaveOptions(true)}
              className="btn-primary"
              disabled={buildItems.length === 0 || saving}
            >
              Save Build
            </button>
          </div>
        </div>
        {saveMessage && (
          <div className="mt-4 p-3 text-sm text-center bg-primary-50 text-primary-700 rounded-lg border border-primary-200">
            {saveMessage}
          </div>
        )}
      </div>

      {/* Component Selection Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Component</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Selection</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {componentCategories.map((category) => {
                const items = getItemsByCategory(category.key);
                const hasItems = items.length > 0;

                return (
                  <tr key={category.key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          {category.allowMultiple && (
                            <div className="text-xs text-gray-500">Multiple allowed</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {hasItems ? (
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 rounded object-cover border border-gray-200"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 truncate">
                                  {item.brand && (
                                    <span className="text-primary-600">{item.brand} </span>
                                  )}
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500">{item.retailer}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedCategory(category.key)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline"
                        >
                          Choose {category.name}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {hasItems ? (
                        <div className="space-y-1">
                          {items.map((item) => (
                            <div key={item.id} className="font-semibold text-gray-900">
                              {formatPrice(item.price)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {hasItems ? (
                        <div className="space-y-2">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-600 p-1"
                              title="Remove"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedCategory(category.key)}
                          className="text-primary-600 hover:text-primary-700 p-1"
                          title="Add"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td colSpan={2} className="py-4 px-4 text-right font-bold text-gray-900">
                  Total:
                </td>
                <td className="py-4 px-4 text-right font-bold text-xl text-primary-700">
                  {formatPrice(totalPrice)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Info Box */}
      {buildItems.length === 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How to use the PC Builder</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click "Choose" or the "+" button next to any component to select parts</li>
                <li>• Compare prices from multiple Philippine retailers</li>
                <li>• Add multiple RAM sticks, storage drives, and fans to your build</li>
                <li>• Save your build to share or reference later</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Component Selector Modal */}
      {selectedCategory && (
        <ComponentSelector
          category={selectedCategory}
          onSelect={addItem}
          onClose={() => setSelectedCategory(null)}
        />
      )}

      {/* Save Options Modal */}
      {showSaveOptions && (
        <SaveOptionsModal
          onSaveToHomepage={handleSaveToHomepage}
          onSaveToPDF={handleSaveToPDF}
          onClose={() => setShowSaveOptions(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
