'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SaveOptionsModalProps {
  onSaveToMyBuilds: (buildName: string) => void;
  onSaveToPDF: (buildName: string) => void;
  onClose: () => void;
  saving: boolean;
  buildName: string;
  onBuildNameChange: (name: string) => void;
}

export default function SaveOptionsModal({
  onSaveToMyBuilds,
  onSaveToPDF,
  onClose,
  saving,
  buildName,
  onBuildNameChange,
}: SaveOptionsModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tempBuildName, setTempBuildName] = useState(buildName);

  const handleSaveToMyBuilds = () => {
    if (!session) {
      toast.error('Please sign in to save your build', {
        duration: 4000,
      });
      onClose();
      router.push('/auth/login');
      return;
    }

    if (!tempBuildName.trim()) {
      toast.error('Please enter a build name', {
        duration: 3000,
      });
      return;
    }

    const finalBuildName = tempBuildName.trim();
    onBuildNameChange(finalBuildName);
    onSaveToMyBuilds(finalBuildName);
  };

  const handleSaveToPDF = () => {
    if (!tempBuildName.trim()) {
      toast.error('Please enter a build name', {
        duration: 3000,
      });
      return;
    }

    const finalBuildName = tempBuildName.trim();
    onBuildNameChange(finalBuildName);
    onSaveToPDF(finalBuildName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={saving}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Save Your Build</h2>
          <p className="text-gray-600 text-sm">
            Choose how you&apos;d like to save your PC configuration
          </p>
        </div>

        {/* Build Name Input */}
        <div className="mb-4">
          <label
            htmlFor="buildName"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Build Name <span className="text-red-500">*</span>
          </label>
          <input
            id="buildName"
            type="text"
            value={tempBuildName}
            onChange={(e) => setTempBuildName(e.target.value)}
            placeholder="Enter a name for your build"
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            disabled={saving}
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            Give your build a memorable name (e.g., &quot;Gaming Beast 2024&quot;,
            &quot;Budget Office PC&quot;)
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Save to My Builds */}
          <button
            onClick={handleSaveToMyBuilds}
            disabled={saving || status === 'loading'}
            className="w-full p-4 bg-gradient-to-r from-primary-50 to-blue-50 hover:from-primary-100 hover:to-blue-100 border-2 border-primary-200 hover:border-primary-400 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-600 rounded-lg text-white flex-shrink-0">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors mb-1">
                  Save to My Builds
                  {!session && (
                    <span className="text-xs text-orange-600 ml-2">
                      (Sign in required)
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  Save and manage your build in My Builds section
                </p>
              </div>
              <svg
                className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0"
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
            </div>
          </button>

          {/* Save as PDF */}
          <button
            onClick={handleSaveToPDF}
            disabled={saving}
            className="w-full p-4 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-2 border-red-200 hover:border-red-400 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-600 rounded-lg text-white flex-shrink-0">
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
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors mb-1">
                  Export as PDF
                </h3>
                <p className="text-sm text-gray-600">
                  Download a detailed PDF with product links and prices
                </p>
              </div>
              <svg
                className="w-5 h-5 text-red-600 mt-1 flex-shrink-0"
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
            </div>
          </button>
        </div>

        {/* Loading State */}
        {saving && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium text-primary-700">Processing...</span>
          </div>
        )}

        {/* Cancel Button */}
        <button
          onClick={onClose}
          disabled={saving}
          className="mt-4 w-full py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
