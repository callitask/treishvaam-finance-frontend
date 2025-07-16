import axios from 'axios';

export const API_URL = 'https://backend.treishvaamgroup.com';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'X-Internal-Secret': 'Qw8vZp3rT6sB1eXy9uKj4LmN2aSd5FgH7pQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGhJkLzXcVbNm'
    }
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

export const login = (credentials) => api.post('/auth/login', credentials);
export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const createPost = (formData) => api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePost = (id, formData) => api.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadFile = (formData) => api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export default api;