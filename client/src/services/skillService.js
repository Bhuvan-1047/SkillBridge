import api from './api';

export const skillService = {
  getSkills: async (params) => {
    const res = await api.get('/skills', { params });
    return res.data;
  },

  createSkill: async (skillData) => {
    const res = await api.post('/skills', skillData);
    return res.data;
  },

  getSkillListings: async (params) => {
    const res = await api.get('/skill-listings', { params });
    return res.data;
  },

  createSkillListing: async (listingData) => {
    const res = await api.post('/skill-listings', listingData);
    return res.data;
  },

  updateSkillListing: async (id, listingData) => {
    const res = await api.put(`/skill-listings/${id}`, listingData);
    return res.data;
  },

  deleteSkillListing: async (id) => {
    const res = await api.delete(`/skill-listings/${id}`);
    return res.data;
  },
};
