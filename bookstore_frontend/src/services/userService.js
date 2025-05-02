import axios from 'axios';
import { API_BASE_URL } from '../config';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const userService = {
    // 获取当前用户信息
    getCurrentUser: async () => {
        const response = await axios.get(`${API_BASE_URL}/accounts/users/me/`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // 更新用户信息
    updateProfile: async (userData) => {
        const response = await axios.put(`${API_BASE_URL}/accounts/users/me/`, userData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // 获取所有用户
    getAllUsers: async () => {
        const response = await axios.get(`${API_BASE_URL}/accounts/users/`, {
            headers: getAuthHeader()
        });
        return response;
    },

    // 获取用户
    getUser: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/accounts/users/${id}/`, {
            headers: getAuthHeader()
        });
        return response;
    },

    // 创建用户
    createUser: async (userData) => {
        const data = {
            username: userData.username,
            password: userData.password,
            confirm_password: userData.confirm_password,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
            is_active: true
        };
        const response = await axios.post(`${API_BASE_URL}/accounts/users/`, data, {
            headers: getAuthHeader()
        });
        return response;
    },

    // 更新用户
    updateUser: async (id, userData) => {
        const response = await axios.put(`${API_BASE_URL}/accounts/users/${id}/`, userData, {
            headers: getAuthHeader()
        });
        return response;
    },

    // 删除用户
    deleteUser: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/accounts/users/${id}/`, {
            headers: getAuthHeader()
        });
        return response;
    },

    // 获取用户角色
    getRoles: async () => {
        const response = await axios.get(`${API_BASE_URL}/accounts/users/roles/`, {
            headers: getAuthHeader()
        });
        return response.data.roles;
    },

    // 获取用户权限
    getPermissions: async () => {
        const response = await axios.get(`${API_BASE_URL}/accounts/users/permissions/`, {
            headers: getAuthHeader()
        });
        return response.data.permissions;
    },

    // 修改密码
    changePassword: async (oldPassword, newPassword) => {
        const response = await axios.post(`${API_BASE_URL}/accounts/users/change_password/`, {
            old_password: oldPassword,
            new_password: newPassword,
        }, {
            headers: getAuthHeader()
        });
        return response;
    }
}; 