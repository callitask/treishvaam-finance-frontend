// src/apiConfig.js
import axios from 'axios';

// The live backend URL
export const API_URL = 'https://backend.treishvaamgroup.com';

// Create a single Axios instance for all API requests
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'X-Internal-Secret': 'YourSuperSecretValue123!@#'
  }
});

// Interceptor to add the JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Functions ---
export const login = (credentials) => api.post('/auth/login', credentials);
export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);
export const deletePost = (id) => api.delete(`/posts/${id}`);

// --- FIX: This function now correctly merges the default headers ---
export const createPost = (formData) => {
  return api.post('/posts', formData, {
    headers: {
      ...api.defaults.headers.common, // Includes the default headers
      'Content-Type': 'multipart/form-data',
    },
  });
};

// --- FIX: This function is also updated for consistency ---
export const updatePost = (id, formData) => {
  return api.put(`/posts/${id}`, formData, {
    headers: {
      ...api.defaults.headers.common, // Includes the default headers
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;