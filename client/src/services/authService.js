import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('skillbridge_token', res.data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('skillbridge_token', res.data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/users/profile', profileData);
    if (res.data.user) {
      localStorage.setItem('skillbridge_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('skillbridge_token');
      localStorage.removeItem('skillbridge_user');
      localStorage.removeItem('skillswap_token');
      localStorage.removeItem('skillswap_user');
    }
  },

  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  getAllUsers: async (params) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  toggleUserStatus: async (id) => {
    const res = await api.put(`/users/${id}/status`);
    return res.data;
  },
};
