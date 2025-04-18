import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { Route, Routes, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  DashboardOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

// 导入页面组件
import Dashboard from '../../pages/Dashboard';
import UserManagement from '../../pages/UserManagement';
import BookManagement from '../../pages/BookManagement';
import PurchaseManagement from '../../pages/PurchaseManagement';
import SalesManagement from '../../pages/SalesManagement';
import FinancialManagement from '../../pages/FinancialManagement';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 菜单项配置
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'books',
      icon: <BookOutlined />,
      label: '图书管理',
    },
    {
      key: 'purchase',
      icon: <ShoppingCartOutlined />,
      label: '进货管理',
    },
    {
      key: 'sales',
      icon: <ShoppingCartOutlined />,
      label: '销售管理',
    },
    {
      key: 'financial',
      icon: <DollarOutlined />,
      label: '财务管理',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }) => {
    navigate('/' + key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              fontSize: '16px',
              marginRight: 16,
            }}
          >
            退出登录
          </Button>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} /> 
            <Route path="/users" element={<UserManagement />} /> 
            <Route path="/books" element={<BookManagement />} />
            <Route path="/purchase" element={<PurchaseManagement />} />
            <Route path="/sales" element={<SalesManagement />} />
            <Route path="/financial" element={<FinancialManagement />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 