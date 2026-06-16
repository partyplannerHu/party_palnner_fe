import api from './api';

const reviewService = {
  getListingReviews: async (listingId) => {
    try {
      const response = await api.get(`/reviews/listing/${listingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch reviews' };
    }
  },

  getMyReview: async (listingId) => {
    try {
      const response = await api.get(`/reviews/listing/${listingId}/my-review`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch your review' };
    }
  },

  createReview: async (listingId, { rating, comment }) => {
    try {
      const response = await api.post(`/reviews/listing/${listingId}`, { rating, comment });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to submit review' };
    }
  },

  updateReview: async (reviewId, { rating, comment }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, { rating, comment });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update review' };
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete review' };
    }
  },
};

export default reviewService;
