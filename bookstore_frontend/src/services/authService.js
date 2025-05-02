import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const authService = {
    // 登录
    login: async (username, password) => {
        const response = await axios.post(`${API_URL}/token/`, {
            username,
            password,
        });
        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            // 设置默认的 axios 请求头
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        }
        return response.data;
    },

    // 注册
    register: async (userData) => {
        const response = await axios.post('/auth/register/', userData);
        return response.data;
    },

    // 登出
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
    },

    // 获取当前用户信息
    getCurrentUser: () => {
        const token = localStorage.getItem('token');
        if (token) {
            // 设置默认的 axios 请求头
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
    },

    // 检查是否已登录
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
}; 