import api from './api';

export const goalService = {
  getMyProgress: async () => {
    const res = await api.get('/goals/my-progress');
    return res.data;
  },

  updateGoal: async (data) => {
    const res = await api.put('/goals', data);
    return res.data;
  },
};
