import api from './api';

const listingService = {
  // Get all listings with filters
  getListings: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },

  // Get listing by ID
  getListingById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  // Get listings by category
  getListingsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/listings/category/${categoryId}`, { params });
    return response.data;
  },

  // Get current provider's listings
  getProviderListings: async () => {
    const response = await api.get('/listings/provider/me');
    return response.data;
  },

  // Create new listing
  createListing: async (data) => {
    const response = await api.post('/listings', data);
    return response.data;
  },

  // Update listing
  updateListing: async (id, data) => {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  },

  // Delete listing
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },

  // Toggle listing active status
  toggleListing: async (id) => {
    const response = await api.patch(`/listings/${id}/toggle`);
    return response.data;
  },

  // Increment view count
  incrementView: async (id) => {
    const response = await api.post(`/listings/${id}/view`);
    return response.data;
  },

  // Upload listing images (multipart/form-data)
  uploadImages: async (files) => {
    const formData = new FormData();

    // Append each file to the FormData object
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    const response = await api.post('/listings/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default listingService;
