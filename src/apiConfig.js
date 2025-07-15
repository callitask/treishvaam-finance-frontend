import axios from 'axios';

// The live backend URL
export const API_URL = 'https://backend.treishvaamgroup.com';

// Create a single Axios instance for all API requests
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'X-Internal-Secret': 'Qw8vZp3rT6sB1eXy9uKj4LmN2aSd5FgH7pQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGhJkLzXcVbNm'
  }
});
// Interceptor to add the JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  const token = localStorage.getItem('token');
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Internal-Secret': 'Qw8vZp3rT6sB1eXy9uKj4LmN2aSd5FgH7pQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGhJkLzXcVbNm',
    },
  });
};

// --- FIX: This function is also updated for consistency ---
export const updatePost = (id, formData) => {
  const token = localStorage.getItem('token');
  return api.put(`/posts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Internal-Secret': 'Qw8vZp3rT6sB1eXy9uKj4LmN2aSd5FgH7pQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGhJkLzXcVbNm',
    },
  });
};

export default api;
// src/apiConfig.js
import axios from 'axios';

// The live backend URL
export const API_URL = 'https://backend.treishvaamgroup.com';

// Create a single Axios instance for all API requests
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'X-Internal-Secret': 'Qw8vZp3rT6sB1eXy9uKj4LmN2aSd5FgH7pQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGhJkLzXcVbNm'
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
  const token = localStorage.getItem('token');
  return api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Internal-Secret': 'Qw8vZp3rT6sB1eXy9uKj4LmN2aSd5FgH7pQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGhJkLzXcVbNm',
    },
  });
};

// --- FIX: This function is also updated for consistency ---

export const updatePost = (id, formData) => {
  const token = localStorage.getItem('token');
  return api.put(`/posts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Internal-Secret': 'Qw8vZp3rT6sB1eXy9uKj4LmN2aSd5FgH7pQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGhJkLzXcVbNm',
    },
  });
};

export default api;