import api from './api';

export const authService = {
    // 登录
    login: async (username, password) => {
        const response = await api.post('/auth/login/', { username, password });
        if (response.data.tokens) {
            localStorage.setItem('token', response.data.tokens.access);
            localStorage.setItem('refreshToken', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // 注册
    register: async (userData) => {
        const response = await api.post('/auth/register/', userData);
        return response.data;
    },

    // 登出
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    // 获取当前用户信息
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // 检查是否已登录
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
}; 