import api from './api';

export const sessionService = {
  getSessions: async (params) => {
    const res = await api.get('/sessions', { params });
    return res.data;
  },

  getSessionById: async (id) => {
    const res = await api.get(`/sessions/${id}`);
    return res.data;
  },

  rescheduleSession: async (id, data) => {
    const res = await api.put(`/sessions/${id}/reschedule`, data);
    return res.data;
  },

  completeSession: async (id) => {
    const res = await api.put(`/sessions/${id}/complete`);
    return res.data;
  },

  cancelSession: async (id, cancellationReason) => {
    const res = await api.put(`/sessions/${id}/cancel`, { cancellationReason });
    return res.data;
  },
};
