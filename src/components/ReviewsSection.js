import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Pencil, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import reviewService from '../services/reviewService';
import StarRating from './StarRating';
import { getImageUrl } from '../utils/imageUrl';

const ReviewsSection = ({ listingId, providerId, onRatingUpdate }) => {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reviewService.getListingReviews(listingId);
      if (res.success) {
        setReviews(res.data);
        const total = res.data.length;
        const avg = total > 0
          ? Math.round((res.data.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
          : 0;
        onRatingUpdate && onRatingUpdate(avg, total);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [listingId, onRatingUpdate]);

  const fetchMyReview = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await reviewService.getMyReview(listingId);
      if (res.success) setMyReview(res.data);
    } catch {
      // silent
    }
  }, [listingId, isAuthenticated]);

  useEffect(() => {
    fetchReviews();
    fetchMyReview();
  }, [fetchReviews, fetchMyReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    if (!comment.trim()) { toast.error('Please write a comment'); return; }

    setSubmitting(true);
    try {
      const res = await reviewService.createReview(listingId, { rating, comment });
      if (res.success) {
        setMyReview(res.data);
        setReviews(prev => [res.data, ...prev]);
        setRating(0);
        setComment('');
        toast.success('Review submitted!');
        const total = reviews.length + 1;
        const avg = Math.round(([...reviews, res.data].reduce((s, r) => s + r.rating, 0) / total) * 10) / 10;
        onRatingUpdate && onRatingUpdate(avg, total);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      const updated = reviews.filter(r => r._id !== reviewId);
      setReviews(updated);
      if (myReview?._id === reviewId) setMyReview(null);
      toast.success('Review deleted');
      const total = updated.length;
      const avg = total > 0
        ? Math.round((updated.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
        : 0;
      onRatingUpdate && onRatingUpdate(avg, total);
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleUpdate = async (reviewId) => {
    if (editRating === 0) { toast.error('Please select a rating'); return; }
    if (!editComment.trim()) { toast.error('Please write a comment'); return; }

    try {
      const res = await reviewService.updateReview(reviewId, { rating: editRating, comment: editComment });
      if (res.success) {
        const updated = reviews.map(r => r._id === reviewId ? res.data : r);
        setReviews(updated);
        if (myReview?._id === reviewId) setMyReview(res.data);
        cancelEdit();
        toast.success('Review updated!');
        const total = updated.length;
        const avg = Math.round((updated.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10;
        onRatingUpdate && onRatingUpdate(avg, total);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update review');
    }
  };

  const userId = user?.id || user?._id;
  const isProvider = !!(userId && providerId && userId.toString() === providerId.toString());
  const canReview = isAuthenticated && !isProvider && !myReview;

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Reviews ({reviews.length})
      </h3>

      {/* Write a review form */}
      {isAuthenticated && isProvider && (
        <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-200 mb-8 text-sm text-gray-500">
          You cannot review your own listing.
        </div>
      )}

      {isAuthenticated && !isProvider && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
          {canReview ? (
            <>
              <h4 className="font-semibold text-gray-800 mb-4">Write a Review</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                  <StarRating value={rating} onChange={setRating} interactive size={28} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Share your experience with this service..."
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none text-sm"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              {myReview ? 'You have already reviewed this listing.' : ''}
            </p>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300 mb-8">
          <p className="text-gray-500 text-sm">
            <a href="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to review this service!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => {
            const isAuthor = !!(userId && userId.toString() === review.userId?._id?.toString());
            const isAdmin = user?.role === 'admin';
            const isEditing = editingId === review._id;

            return (
              <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    {review.userId?.profileImage ? (
                      <img
                        src={getImageUrl(review.userId.profileImage)}
                        alt={review.userId.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {review.userId?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{review.userId?.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {(isAuthor || isAdmin) && !isEditing && (
                    <div className="flex items-center gap-2 ml-auto">
                      {isAuthor && (
                        <button onClick={() => startEdit(review)} className="text-gray-400 hover:text-indigo-600 transition p-1" title="Edit">
                          <Pencil size={15} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(review._id)} className="text-gray-400 hover:text-red-500 transition p-1" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <StarRating value={editRating} onChange={setEditRating} interactive size={22} />
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 text-sm resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(review._id)} className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                        <Check size={14} /> Save
                      </button>
                      <button onClick={cancelEdit} className="flex items-center gap-1 bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <StarRating value={review.rating} size={16} />
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.comment}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
