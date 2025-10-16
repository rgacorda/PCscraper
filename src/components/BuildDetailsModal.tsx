'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import StarRating from './StarRating';
import StarRatingInput from './StarRatingInput';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { formatPrice } from '@/lib/utils';

interface BuildDetailsModalProps {
  buildId: string;
  onClose: () => void;
}

interface BuildDetails {
  id: string;
  name: string;
  description: string | null;
  totalPrice: number;
  isPublic: boolean;
  averageRating: number | null;
  totalRatings: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      category: string;
      brand?: string;
      imageUrl?: string;
      listings: Array<{
        id: string;
        retailer: string;
        price: number;
        retailerUrl: string;
      }>;
    };
  }>;
  ratings: Array<{
    id: string;
    rating: number;
    userId: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string | null;
    };
  }>;
}

export default function BuildDetailsModal({
  buildId,
  onClose,
}: BuildDetailsModalProps) {
  const { data: session } = useSession();
  const [build, setBuild] = useState<BuildDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchBuildDetails();
  }, [buildId]);

  const fetchBuildDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/builds/${buildId}`);
      const data = await response.json();
      setBuild(data.build);

      // Find user's existing rating
      if (session?.user?.id) {
        const existingRating = data.build.ratings.find(
          (r: any) => r.userId === session.user.id
        );
        if (existingRating) {
          setUserRating(existingRating.rating);
        }
      }
    } catch (error) {
      console.error('Error fetching build details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!session || !build) return;

    setSubmittingRating(true);
    try {
      const response = await fetch(`/api/builds/${buildId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        setUserRating(rating);
        // Refresh build details to get updated average
        await fetchBuildDetails();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    if (!session || !build) return;

    const response = await fetch(`/api/builds/${buildId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to post comment');
    }

    // Refresh build details to show new comment
    await fetchBuildDetails();
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!session || !build) return;

    const response = await fetch(`/api/builds/${buildId}/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete comment');
    }

    // Refresh build details
    await fetchBuildDetails();
  };

  const handleCommentEdit = async (commentId: string, content: string) => {
    if (!session || !build) return;

    const response = await fetch(`/api/builds/${buildId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to edit comment');
    }

    // Refresh build details
    await fetchBuildDetails();
  };

  const isOwner = session?.user?.id === build?.user.id;
  const canRate = session && !isOwner;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{build?.name || 'Loading...'}</h2>
              {build && (
                <>
                  <p className="text-blue-100 text-sm mb-3">
                    by {build.user.name || 'Anonymous'}
                  </p>
                  <StarRating
                    rating={build.averageRating}
                    totalRatings={build.totalRatings}
                    size="lg"
                  />
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading build details...</p>
            </div>
          ) : build ? (
            <div className="space-y-6">
              {/* Description */}
              {build.description && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{build.description}</p>
                </div>
              )}

              {/* Components List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Components</h3>
                <div className="space-y-2">
                  {build.items.map((item) => {
                    const cheapestListing = item.product.listings[0];
                    const ItemWrapper = cheapestListing ? 'a' : 'div';
                    const wrapperProps = cheapestListing
                      ? {
                          href: cheapestListing.retailerUrl,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                          className: 'flex items-center gap-4 p-3 bg-gray-50 hover:bg-primary-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-all group cursor-pointer',
                        }
                      : {
                          className: 'flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200',
                        };

                    return (
                      <ItemWrapper key={item.id} {...wrapperProps}>
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                            {item.product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge-info text-xs">{item.product.category}</span>
                            {item.product.brand && (
                              <span className="text-xs text-gray-500">{item.product.brand}</span>
                            )}
                            {cheapestListing && (
                              <span className="text-xs text-primary-600 font-medium">
                                {formatPrice(Number(cheapestListing.price))} @ {cheapestListing.retailer}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.quantity > 1 && (
                            <span className="text-sm text-gray-600">×{item.quantity}</span>
                          )}
                          {cheapestListing && (
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
                        </div>
                      </ItemWrapper>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Price:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(Number(build.totalPrice))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              {canRate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Rate this build</h3>
                  <StarRatingInput
                    value={userRating}
                    onChange={handleRatingSubmit}
                    disabled={submittingRating}
                  />
                  {userRating > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      You rated this build {userRating} {userRating === 1 ? 'star' : 'stars'}
                    </p>
                  )}
                </div>
              )}

              {/* Comments Section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Comments ({build.comments.length})
                </h3>
                <div className="space-y-6">
                  <CommentForm onSubmit={handleCommentSubmit} />
                  <CommentList
                    comments={build.comments}
                    onDelete={handleCommentDelete}
                    onEdit={handleCommentEdit}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Failed to load build details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
