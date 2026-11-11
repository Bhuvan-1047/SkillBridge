import api from './api';

export const reviewService = {
  createReview: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },

  getUserReviews: async (userId) => {
    const res = await api.get(`/reviews/${userId}`);
    return res.data;
  },

  getSessionReviews: async (sessionId) => {
    const res = await api.get(`/reviews/session/${sessionId}`);
    return res.data;
  },
};
