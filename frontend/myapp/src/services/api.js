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

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  if (decoded.exp * 1000 < Date.now()) {
    localStorage.removeItem('token');
    return null;
  }
  
  return decoded;
};

const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

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
  },
  
  getCurrentUser,
  isAdmin,
  decodeToken
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

  searchFoundItems: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await axios.get(`${API_URL}/found-items/search?${params}`);
    return response.data;
  },

  searchLostItems: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await axios.get(`${API_URL}/lost-items/search?${params}`);
    return response.data;
  },

  getMatches: async (lostItemId) => {
    const response = await axios.get(`${API_URL}/lost-items/${lostItemId}/matches`);
    return response.data;
  },

  createClaim: async (lostItemId, foundItemId) => {
    const response = await axios.post(`${API_URL}/claims`, {
      lost_item_id: lostItemId,
      found_item_id: foundItemId
    });
    return response.data;
  },

  verifyClaim: async (claimId) => {
    const response = await axios.post(`${API_URL}/claims/${claimId}/verify`);
    return response.data;
  }
};

export const adminService = {
  getClaims: async () => {
    const response = await axios.get(`${API_URL}/admin/claims`);
    return response.data;
  },

  approveClaim: async (claimId) => {
    const response = await axios.post(`${API_URL}/admin/claims/${claimId}/approve`);
    return response.data;
  },

  rejectClaim: async (claimId) => {
    const response = await axios.post(`${API_URL}/admin/claims/${claimId}/reject`);
    return response.data;
  },

  createRetrieval: async (claimId, notes) => {
    const response = await axios.post(`${API_URL}/admin/retrievals`, {
      claim_id: claimId,
      notes
    });
    return response.data;
  },

  getRetrievals: async () => {
    const response = await axios.get(`${API_URL}/admin/retrievals`);
    return response.data;
  }
};