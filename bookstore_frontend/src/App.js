import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import './App.css';

// 导入页面组件
import Login from './pages/Login';
import MainLayout from './components/Layout/MainLayout';
import NotFound from './pages/NotFound';

// 私有路由组件
const PrivateRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 登录页面 */}
        <Route path="/login" element={<Login />} />
        
        {/* 主布局下的路由 */}
        <Route path="/*" element={<PrivateRoute element={<MainLayout />} />} />
        
        {/* 404页面 */}
        <Route path="/404" element={<NotFound />} />
        
        {/* 重定向到主页 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
