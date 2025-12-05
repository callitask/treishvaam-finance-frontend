// src/apiConfig.js
import axios from 'axios';

/**
 * Backend base URL (no trailing slash)
 * POINTS TO THE TUNNEL -> NGINX -> SPRING BOOT (VERSION 1)
 */
export const API_URL = 'https://backend.treishvaamgroup.com';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`, // CHANGED TO V1
});

// Attach JWT from localStorage when present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------- Blog / Posts -------------------- */
export const getPaginatedPosts = (page = 0, size = 9) => api.get(`/posts?page=${page}&size=${size}`);
export const getAllPostsForAdmin = () => api.get('/posts/admin/all');
export const getPost = (id) => api.get(`/posts/${id}`);
export const getPostByUrlId = (urlArticleId) => api.get(`/posts/url/${urlArticleId}`);
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

/* -------------------- Files & Categories -------------------- */
export const uploadFile = (formData) => api.post('/files/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getCategories = () => api.get('/categories');
export const addCategory = (data) => api.post('/categories', data);

/* -------------------- Auth -------------------- */
export const login = (credentials) => api.post('/auth/login', credentials);

/* -------------------- Search -------------------- */
export const searchPosts = (query) => api.get(`/search?q=${encodeURIComponent(query)}`);

/* -------------------- News -------------------- */
export const getNewsHighlights = () => api.get('/news/highlights');
export const getArchivedNews = () => api.get('/news/archive');
export const refreshNewsData = () => api.post('/news/admin/refresh');

/* -------------------- Market / Movers -------------------- */
export const getTopGainers = () => api.get('/market/top-gainers');
export const getTopLosers = () => api.get('/market/top-losers');
export const getMostActive = () => api.get('/market/most-active');
export const refreshMovers = () => api.post('/market/admin/refresh-movers');
export const refreshIndices = () => api.post('/market/admin/refresh-indices');
export const flushMovers = (password) => api.post('/market/admin/flush-movers', { password });
export const flushIndices = (password) => api.post('/market/admin/flush-indices', { password });

/* -------------------- NEW: Market Widget -------------------- */
export const getWidgetData = (ticker) => api.get(`/market/widget?ticker=${encodeURIComponent(ticker)}`);

/* -------------------- NEW: Global Ticker -------------------- */
export const getQuotesBatch = (tickers) => api.post('/market/quotes/batch', tickers);

/* -------------------- API Status Panel -------------------- */
export const getApiStatusHistory = () => api.get('/status/history');
export const flushPermanentData = (password) => api.post('/market/admin/flush-permanent-data', { password });

/* -------------------- Analytics (Historical Data) -------------------- */

export const getHistoricalAudienceData = (params) => {
  const cleanParams = {};
  for (const key in params) {
    if (params[key]) {
      cleanParams[key] = params[key];
    }
  }
  return api.get(`/analytics`, { params: cleanParams });
};

export const getFilterOptions = (params) => {
  const cleanParams = {};
  for (const key in params) {
    if (params[key]) {
      cleanParams[key] = params[key];
    }
  }
  return api.get(`/analytics/filters`, { params: cleanParams });
};

export default api;