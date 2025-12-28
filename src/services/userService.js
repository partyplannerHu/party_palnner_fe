import api from './api';

const userService = {
  // Get current user's profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update current user's profile
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  // Change password
  updatePassword: async (data) => {
    const response = await api.put('/users/password', data);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await api.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get public user profile by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get user statistics (admin only)
  getUserStats: async () => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  },
};

export default userService;
