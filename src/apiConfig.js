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

// --- STATUS AND REFRESH FUNCTIONS ---
export const getApiStatuses = () => api.get('/status');
export const getApiStatusHistory = () => api.get('/status/history'); // --- NEW ---
export const refreshMarketData = () => api.post('/market/admin/refresh-us');
export const refreshNewsData = () => api.post('/news/admin/refresh');

// ... (rest of the functions remain the same)
export const getPosts = () => api.get('/posts');
export const getPaginatedPosts = (page = 0, size = 9) => api.get(`/posts/paginated?page=${page}&size=${size}`);
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