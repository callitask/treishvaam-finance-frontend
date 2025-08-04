import axios from 'axios';

// FIX: API_URL should NOT have a trailing slash.
export const API_URL = 'https://backend.treishvaamgroup.com';

const api = axios.create({
    // This correctly combines the base URL and the '/api' path.
    baseURL: `${API_URL}/api`,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const getPosts = () => api.get('/posts');
export const getAllPostsForAdmin = () => api.get('/posts/admin/all');
export const getPost = (id) => api.get(`/posts/${id}`);
export const getPostBySlug = (slug) => api.get(`/posts/slug/${slug}`);
export const getLatestPostHeadline = () => api.get('/posts/latest-headline');

export const createPost = (formData) => api.post(`/posts`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export const updatePost = (id, formData) => api.put(`/posts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export const deletePost = (id) => api.delete(`/posts/${id}`);
export const uploadFile = (formData) => api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Category APIs
export const getCategories = () => api.get('/categories');
export const addCategory = (categoryData) => api.post('/categories', categoryData);

// Auth API
export const login = (credentials) => api.post('/auth/login', credentials);

export default api;

// These functions correctly use axios directly with the full URL and headers
export const createDraft = (postData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/api/posts`, postData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const updateDraft = (id, postData) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/api/posts/draft/${id}`, postData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getDrafts = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/api/posts/admin/drafts`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};