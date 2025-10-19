'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: {
    id: string;
    name: string | null;
  } | null;
}

interface CommentListProps {
  comments: Comment[];
  onDelete: (commentId: string) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
}

export default function CommentList({ comments, onDelete, onEdit }: CommentListProps) {
  const { data: session } = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!onEdit || !editContent.trim()) return;

    try {
      await onEdit(commentId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await onDelete(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isOwner = session?.user?.id === comment.user?.id;
        const isEditing = editingId === comment.id;
        const isDeleting = deletingId === comment.id;

        return (
          <div
            key={comment.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            {/* Comment Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {(comment.user?.name?.[0] || 'D').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {comment.user ? comment.user.name || 'Anonymous' : 'Deleted Account'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                    {comment.updatedAt !== comment.createdAt && ' (edited)'}
                  </p>
                </div>
              </div>

              {/* Actions (only for comment owner) */}
              {isOwner && !isEditing && (
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                      aria-label="Edit comment"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isDeleting}
                    className="text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                    aria-label="Delete comment"
                  >
                    {isDeleting ? (
                      <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full"></div>
                    ) : (
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveEdit(comment.id)}
                    disabled={!editContent.trim()}
                    className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
