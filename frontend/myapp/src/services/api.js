import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add token to requests if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

export const itemsService = {
  reportLost: async (itemData) => {
    const response = await axios.post(`${API_URL}/lost-items`, itemData);
    return response.data;
  },

  getLostItems: async () => {
    const response = await axios.get(`${API_URL}/lost-items`);
    return response.data;
  },

  reportFound: async (itemData) => {
    const response = await axios.post(`${API_URL}/found-items`, itemData);
    return response.data;
  },

  verifyClaim: async (claimId) => {
    const response = await axios.post(`${API_URL}/claims/${claimId}/verify`);
    return response.data;
  }
};