import api from './api';

export const requestService = {
  createRequest: async (data) => {
    const res = await api.post('/requests', data);
    return res.data;
  },

  getIncoming: async () => {
    const res = await api.get('/requests/incoming');
    return res.data;
  },

  getOutgoing: async () => {
    const res = await api.get('/requests/outgoing');
    return res.data;
  },

  acceptRequest: async (id) => {
    const res = await api.put(`/requests/${id}/accept`);
    return res.data;
  },

  rejectRequest: async (id) => {
    const res = await api.put(`/requests/${id}/reject`);
    return res.data;
  },

  cancelRequest: async (id) => {
    const res = await api.put(`/requests/${id}/cancel`);
    return res.data;
  },
};
