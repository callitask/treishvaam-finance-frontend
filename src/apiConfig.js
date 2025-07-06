// src/apiConfig.js
import axios from 'axios';

// Export the base URL so it can be used elsewhere
export const API_URL = 'http://localhost:8080';

// Create a single Axios instance for all API requests
const api = axios.create({
  baseURL: `${API_URL}/api`, // All API requests will now go to /api
  headers: {
    'Content-Type': 'application/json',
  },
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

// Define your API call functions using this single 'api' instance
export const login = (credentials) => api.post('/auth/login', credentials);
export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);

// MODIFIED: To correctly send multipart/form-data with a 'post' part
export const createPost = (postData) => {
  const formData = new FormData();
  
  // Create a Blob for the JSON part of the blog post data
  // The backend expects a part named "post" containing the JSON string
  const blogPostBlob = new Blob([JSON.stringify({
    title: postData.title,
    content: postData.content,
    author: postData.author, // Ensure author is passed if needed
    category: postData.category, // Ensure category is passed if needed
    isFeatured: postData.isFeatured, // Ensure isFeatured is passed if needed
    imageUrl: postData.imageUrl // Pass existing imageUrl if it's being kept
  })], { type: 'application/json' });
  formData.append('post', blogPostBlob); // Append the JSON blob as 'post'

  // Append image files if they exist
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

// MODIFIED: To correctly send multipart/form-data with a 'post' part for updates
export const updatePost = (id, postData) => {
    const formData = new FormData();

    // Create a Blob for the JSON part of the blog post data
    const blogPostBlob = new Blob([JSON.stringify({
      title: postData.title,
      content: postData.content,
      author: postData.author, // Ensure author is passed if needed
      category: postData.category, // Ensure category is passed if needed
      isFeatured: postData.isFeatured, // Ensure isFeatured is passed if needed
      imageUrl: postData.imageUrl // Pass existing imageUrl if it's being kept
    })], { type: 'application/json' });
    formData.append('post', blogPostBlob); // Append the JSON blob as 'post'

    // Append image files if they exist
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

// Export the 'api' instance as default for other modules that might need it
export default api;
