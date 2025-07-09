// src/apiConfig.js
import axios from 'axios';

// Export the base URL so it can be used elsewhere
export const API_URL = 'http://localhost:8080';

// Create a single Axios instance for all API requests
const api = axios.create({
  baseURL: `${API_URL}/api`,
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

// This function now correctly sends the FormData object directly from the editor.
export const createPost = (formData) => {
  return api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// This function also sends the FormData object directly for updates.
export const updatePost = (id, formData) => {
  return api.put(`/posts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;