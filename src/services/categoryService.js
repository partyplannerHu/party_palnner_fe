import api from './api';

const categoryService = {
  // Get all categories
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },

  // Create category (admin only)
  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Update category (admin only)
  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category (admin only)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Toggle category active status (admin only)
  toggleCategory: async (id) => {
    const response = await api.patch(`/categories/${id}/toggle`);
    return response.data;
  },

  // Get category stats (admin only)
  getCategoryStats: async (id) => {
    const response = await api.get(`/categories/${id}/stats`);
    return response.data;
  },
};

export default categoryService;
