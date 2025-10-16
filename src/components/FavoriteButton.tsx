'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  buildId: string;
  initialIsFavorited?: boolean;
  onToggle?: (isFavorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({
  buildId,
  initialIsFavorited = false,
  onToggle,
  size = 'md',
}: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);

  // Check if build is favorited when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      checkFavoriteStatus();
    }
  }, [status, buildId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/builds/${buildId}/favorite`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated') {
      toast.error('Please log in to favorite builds');
      return;
    }

    setLoading(true);

    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/builds/${buildId}/favorite`, {
        method,
      });

      const data = await response.json();

      if (response.ok) {
        const newIsFavorited = !isFavorited;
        setIsFavorited(newIsFavorited);
        toast.success(
          newIsFavorited
            ? 'Added to favorites'
            : 'Removed from favorites'
        );
        onToggle?.(newIsFavorited);
      } else {
        toast.error(data.error || 'Failed to update favorite');
      }
    } catch (error) {
      toast.error('Error updating favorite');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const paddingClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading || status === 'loading'}
      className={`${paddingClasses[size]} rounded-full transition-all ${
        isFavorited
          ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <div className="animate-spin">
          <svg
            className={sizeClasses[size]}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        <svg
          className={sizeClasses[size]}
          fill={isFavorited ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={isFavorited ? 0 : 2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}
