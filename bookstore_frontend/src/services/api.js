import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 请求拦截器：添加认证令牌和 CSRF token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // 获取 CSRF token
        const csrfToken = document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 未授权，清除本地存储并重定向到登录页
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 