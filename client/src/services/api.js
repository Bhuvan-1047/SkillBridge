import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('skillbridge_token') ||
      localStorage.getItem('skillswap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle common response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    
    // If token expired, clear local storage
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Optional: don't auto-redirect on failed login attempts
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('skillbridge_token');
        localStorage.removeItem('skillbridge_user');
        localStorage.removeItem('skillswap_token');
        localStorage.removeItem('skillswap_user');
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
