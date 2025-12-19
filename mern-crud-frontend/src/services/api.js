import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor for loading states
api.interceptors.request.use(
  (config) => {
    // Add loading indicator
    document.body.classList.add('loading');
    return config;
  },
  (error) => {
    document.body.classList.remove('loading');
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    document.body.classList.remove('loading');
    return response.data;
  },
  (error) => {
    document.body.classList.remove('loading');
    
    let errorMessage = 'An error occurred';
    
    if (error.response) {
      errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection';
    }
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserStats: () => api.get('/users/stats'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;