import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import BookManagement from './pages/BookManagement';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const { Content } = Layout;

const AppContent = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {isAuthenticated && <Sidebar />}
            <Layout>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    <Routes>
                        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                        <Route path="/" element={isAuthenticated ? <BookManagement /> : <Navigate to="/login" />} />
                        <Route path="/books" element={isAuthenticated ? <BookManagement /> : <Navigate to="/login" />} />
                        <Route path="/users" element={isAdmin() ? <UserManagement /> : <Navigate to="/" />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Content>
            </Layout>
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
