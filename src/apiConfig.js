import axios from 'axios';

export const API_URL = 'https://backend.treishvaamgroup.com';

const api = axios.create({
    baseURL: `${API_URL}/api`,
});

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

export const getPaginatedPosts = (page = 0, size = 9) => api.get(`/posts?page=${page}&size=${size}`);
export const getApiStatusHistory = () => api.get('/status/history');
export const refreshMovers = () => api.post('/market/admin/refresh-movers');
export const refreshIndices = () => api.post('/market/admin/refresh-indices');
export const flushMovers = (password) => api.post('/market/admin/flush-movers', { password });
export const flushIndices = (password) => api.post('/market/admin/flush-indices', { password });
export const refreshNewsData = () => api.post('/news/admin/refresh');
export const getAllPostsForAdmin = () => api.get('/posts/admin/all');
export const getPost = (id) => api.get(`/posts/${id}`);

// --- UPDATED: New function for hybrid slug and ID ---
export const getPostBySlugAndId = (userFriendlySlug, id) => api.get(`/posts/slug/${userFriendlySlug}/${id}`);

export const createPost = (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const updatePost = (id, formData) => api.put(`/posts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const duplicatePost = (id) => api.post(`/posts/${id}/duplicate`);
export const bulkDeletePosts = (ids) => api.delete('/posts/bulk', { data: ids });
export const createDraft = (postData) => api.post('/posts/draft', postData);
export const updateDraft = (id, postData) => api.put(`/posts/draft/${id}`, postData);
export const getDrafts = () => api.get('/posts/admin/drafts');
export const uploadFile = (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const getCategories = () => api.get('/categories');
export const addCategory = (data) => api.post('/categories', data);
export const login = (credentials) => api.post('/auth/login', credentials);
export const searchPosts = (query) => api.get(`/search?q=${query}`);
export const getNewsHighlights = () => api.get('/news/highlights');
export const getArchivedNews = () => api.get('/news/archive');
export const getTopGainers = () => api.get('/market/top-gainers');
export const getTopLosers = () => api.get('/market/top-losers');
export const getMostActive = () => api.get('/market/most-active');
export const getHistoricalData = (ticker) => api.get(`/market/historical/${ticker}`);

export default api;