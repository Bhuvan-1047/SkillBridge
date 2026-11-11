import api from './api';

export const leaderboardService = {
  getLeaderboard: async (period = 'monthly') => {
    const res = await api.get('/leaderboard', { params: { period } });
    return res.data;
  },
};
