import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/accounts/users/me/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('User data:', response.data);
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/accounts/users/login/`, {
                username,
                password
            });
            console.log('Login response:', response.data);
            if (response.data.access) {
                localStorage.setItem('token', response.data.access);
                await fetchUser();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        console.log('User permissions:', user);
        if (user.is_superuser || user.is_staff) return true;
        return user.permissions?.includes(permission) || false;
    };

    const isAdmin = () => {
        console.log('Checking admin status:', user);
        return user?.is_superuser || user?.is_staff || false;
    };

    const isStaff = () => {
        return user?.is_staff || false;
    };

    const isAuthenticated = () => {
        return !!user;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            hasPermission,
            isAdmin,
            isStaff,
            isAuthenticated: isAuthenticated()
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 