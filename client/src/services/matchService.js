import api from './api';

export const matchService = {
  getMatches: async () => {
    const res = await api.get('/matches');
    return res.data;
  },
};
