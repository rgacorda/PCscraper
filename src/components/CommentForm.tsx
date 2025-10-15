'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
}

export default function CommentForm({
  onSubmit,
  placeholder = 'Share your thoughts...',
}: CommentFormProps) {
  const { data: session, status } = useSession();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 1000) {
      setError('Comment must be less than 1000 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-gray-700 mb-3">
          You need to be signed in to leave a comment
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Add a comment
        </label>
        <textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={4}
          maxLength={1000}
          disabled={submitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
        />
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${content.length > 900 ? 'text-red-600' : 'text-gray-500'}`}>
            {content.length}/1000 characters
          </span>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Posting...
            </>
          ) : (
            <>
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Post Comment
            </>
          )}
        </button>
        {content && (
          <button
            type="button"
            onClick={() => setContent('')}
            disabled={submitting}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
