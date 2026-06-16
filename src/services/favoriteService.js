import api from './api';

const favoriteService = {
  // Get user's favorites
  getFavorites: async () => {
    try {
      const response = await api.get('/favorites');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch favorites' };
    }
  },

  // Add listing to favorites
  addFavorite: async (listingId) => {
    try {
      const response = await api.post(`/favorites/${listingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to add to favorites' };
    }
  },

  // Remove listing from favorites
  removeFavorite: async (listingId) => {
    try {
      const response = await api.delete(`/favorites/${listingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to remove from favorites' };
    }
  },

  // Toggle favorite (add or remove)
  toggleFavorite: async (listingId) => {
    try {
      const response = await api.post(`/favorites/toggle/${listingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to toggle favorite' };
    }
  },

  // Check if listing is favorited
  checkFavorite: async (listingId) => {
    try {
      const response = await api.get(`/favorites/check/${listingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to check favorite status' };
    }
  }
};

export default favoriteService;
