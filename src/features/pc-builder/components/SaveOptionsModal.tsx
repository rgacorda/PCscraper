'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SaveOptionsModalProps {
  onSaveToHomepage: () => void;
  onSaveToPDF: () => void;
  onClose: () => void;
  saving: boolean;
}

export default function SaveOptionsModal({
  onSaveToHomepage,
  onSaveToPDF,
  onClose,
  saving
}: SaveOptionsModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSaveToHomepage = () => {
    if (!session) {
      toast.error('Please sign in to save your build', {
        duration: 4000,
      });
      onClose();
      router.push('/auth/login');
      return;
    }
    onSaveToHomepage();
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Save Your Build</h2>
          <p className="text-gray-600 text-sm">
            Choose how you&apos;d like to save your PC configuration
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Save to Homepage */}
          <button
            onClick={handleSaveToHomepage}
            disabled={saving || status === 'loading'}
            className="w-full p-4 bg-gradient-to-r from-primary-50 to-blue-50 hover:from-primary-100 hover:to-blue-100 border-2 border-primary-200 hover:border-primary-400 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-600 rounded-lg text-white flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors mb-1">
                  Save to Homepage
                  {!session && <span className="text-xs text-orange-600 ml-2">(Sign in required)</span>}
                </h3>
                <p className="text-sm text-gray-600">
                  View and manage your build anytime from the homepage
                </p>
              </div>
              <svg className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Save as PDF */}
          <button
            onClick={onSaveToPDF}
            disabled={saving}
            className="w-full p-4 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-2 border-red-200 hover:border-red-400 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-600 rounded-lg text-white flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
              <svg className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
