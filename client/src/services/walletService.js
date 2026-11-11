import api from './api';

export const walletService = {
  getWallet: async () => {
    const res = await api.get('/wallet');
    return res.data;
  },

  getHistory: async (params) => {
    const res = await api.get('/wallet/history', { params });
    return res.data;
  },

  getSummary: async () => {
    const res = await api.get('/wallet/summary');
    return res.data;
  },

  donateCredits: async (data) => {
    const res = await api.post('/wallet/donate', data);
    return res.data;
  },
};
