import api from './api';

const adminService = {
  // Stats
  getStats: async () => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Listings
  getListings: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },
  toggleListing: async (id) => {
    const response = await api.patch(`/listings/${id}/toggle`);
    return response.data;
  },

  // Reviews
  getAllReviews: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

export default adminService;
