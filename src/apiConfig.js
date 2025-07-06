// src/apiConfig.js
import axios from 'axios';

// Export the base URL so it can be used elsewhere
export const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_URL}/api`, // All API requests will now go to /api
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = (credentials) => api.post('/auth/login', credentials);
export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (postData) => {
  const formData = new FormData();
  formData.append('title', postData.title);
  formData.append('content', postData.content);
  if (postData.postThumbnail) {
    formData.append('postThumbnail', postData.postThumbnail);
  }
  if (postData.coverImage) {
    formData.append('coverImage', postData.coverImage);
  }
  return api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updatePost = (id, postData) => {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    if (postData.postThumbnail) {
        formData.append('postThumbnail', postData.postThumbnail);
    }
    if (postData.coverImage) {
        formData.append('coverImage', postData.coverImage);
    }
    return api.put(`/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const deletePost = (id) => api.delete(`/posts/${id}`);

export default api;