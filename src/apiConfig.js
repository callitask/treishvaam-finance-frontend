// src/apiConfig.js

import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; // Your backend API URL

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token in headers
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

// Authentication
export const login = (credentials) => api.post('/auth/login', credentials);

// Blog Posts
export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);

// IMPORTANT: Updated createPost function to handle file uploads
export const createPost = (postData) => {
  const formData = new FormData();
  formData.append('title', postData.title);
  formData.append('content', postData.content);
  formData.append('postThumbnail', postData.postThumbnail); // Append the file object
  formData.append('coverImage', postData.coverImage); // Append the file object

  return api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Set content type for file upload
    },
  });
};

// IMPORTANT: Updated updatePost function to handle file uploads
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
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deletePost = (id) => api.delete(`/posts/${id}`);

export default api;
