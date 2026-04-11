import api from './api';

const subcategoryService = {
  // Get all subcategories
  getSubcategories: async (params = {}) => {
    const response = await api.get('/subcategories', { params });
    return response.data;
  },

  // Get subcategories by category
  getSubcategoriesByCategory: async (categoryId) => {
    const response = await api.get(`/subcategories/category/${categoryId}`);
    return response.data;
  },

  // Get subcategory by ID
  getSubcategoryById: async (id) => {
    const response = await api.get(`/subcategories/${id}`);
    return response.data;
  },

  // Create subcategory (admin only)
  createSubcategory: async (data) => {
    const response = await api.post('/subcategories', data);
    return response.data;
  },

  // Update subcategory (admin only)
  updateSubcategory: async (id, data) => {
    const response = await api.put(`/subcategories/${id}`, data);
    return response.data;
  },

  // Delete subcategory (admin only)
  deleteSubcategory: async (id) => {
    const response = await api.delete(`/subcategories/${id}`);
    return response.data;
  },

  // Toggle subcategory active status (admin only)
  toggleSubcategory: async (id) => {
    const response = await api.patch(`/subcategories/${id}/toggle`);
    return response.data;
  },

  // Get subcategory stats (admin only)
  getSubcategoryStats: async (id) => {
    const response = await api.get(`/subcategories/${id}/stats`);
    return response.data;
  },
};

export default subcategoryService;
