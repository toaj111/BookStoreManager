import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Layout } from 'antd';
import BookManagement from './pages/BookManagement';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CategoryManagement from './pages/CategoryManagement';
import PrivateRoute from './components/PrivateRoute';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PurchaseManagement from './pages/PurchaseManagement';
import SalesManagement from './pages/SalesManagement';
import FinancialManagement from './pages/FinancialManagement';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import './App.css';
import { DollarOutlined } from '@ant-design/icons';

const { Content } = Layout;

const AppContent = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {isAuthenticated && <Navbar />}
            <Content style={{ padding: '0 50px', marginTop: isAuthenticated ? 64 : 0 }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/books"
                        element={
                            <PrivateRoute>
                                <BookManagement />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/categories"
                        element={
                            <PrivateRoute>
                                <CategoryManagement />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <PrivateRoute>
                                <UserManagement />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/purchases"
                        element={
                            <PrivateRoute>
                                <PurchaseManagement />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/sales"
                        element={
                            <PrivateRoute>
                                <SalesManagement />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/financials"
                        element={
                            <PrivateRoute>
                                <FinancialManagement />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Content>
        </Layout>
    );
};

const App = () => {
    return (
        <ConfigProvider locale={zhCN}>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </ConfigProvider>
    );
};

export default App;
