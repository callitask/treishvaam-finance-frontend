import axios from 'axios';

// Ensure this points to your backend server.
// For local development, it might be 'http://localhost:8080' or similar.
export const API_URL = 'https://backend.treishvaamgroup.com'; 

const api = axios.create({
    baseURL: `${API_URL}/api`,
});

// Attaches JWT token to every request if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Blog Post Endpoints ---
export const getPosts = () => api.get('/posts');
export const getAllPostsForAdmin = () => api.get('/posts/admin/all');
export const getPost = (id) => api.get(`/posts/${id}`);
export const getPostBySlug = (slug) => api.get(`/posts/slug/${slug}`);
export const createPost = (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const updatePost = (id, formData) => api.put(`/posts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const deletePost = (id) => api.delete(`/posts/${id}`);

// --- Draft Endpoints ---
export const createDraft = (postData) => api.post('/posts', postData); // Corrected endpoint for creating a draft
export const updateDraft = (id, postData) => api.put(`/posts/draft/${id}`);
export const getDrafts = () => api.get('/posts/admin/drafts');

// --- Search Endpoint ---
export const searchPosts = (query) => api.get(`/search?q=${query}`);

// --- File & Category Endpoints ---
export const uploadFile = (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const getCategories = () => api.get('/categories');
export const addCategory = (data) => api.post('/categories', data);

// --- Auth Endpoint ---
export const login = (credentials) => api.post('/auth/login', credentials);

// --- News Endpoints ---
export const getNewsHighlights = () => api.get('/news/highlights');
export const getArchivedNews = () => api.get('/news/archive');

// --- Market Data Endpoints ---
export const getTopGainers = () => api.get('/market/top-gainers');
export const getTopLosers = () => api.get('/market/top-losers');
export const getMostActive = () => api.get('/market/most-active');

export default api;