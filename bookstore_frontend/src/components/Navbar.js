import React from 'react';
import { Layout, Menu, Button, Dropdown } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  DashboardOutlined,
  BookOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  DollarOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin, isStaff } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">首页</Link>
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: <Link to="/books">图书管理</Link>
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: <Link to="/categories">分类管理</Link>
    },
    {
      key: '/purchases',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/purchases">采购管理</Link>
    },
    {
      key: '/sales',
      icon: <ShoppingOutlined />,
      label: <Link to="/sales">销售管理</Link>
    },
    {
      key: '/financials',
      icon: <BarChartOutlined />,
      label: <Link to="/financials">财务管理</Link>
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">个人中心</Link>
    },
  ];

  // 只有管理员可以看到用户管理菜单
  if (isAdmin()) {
    menuItems.push({
      key: '/users',
      icon: <TeamOutlined />,
      label: <Link to="/users">用户管理</Link>
    });
  }

  return (
    <Header style={{ 
      position: 'fixed', 
      zIndex: 1, 
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 50px',
      background: '#001529',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0, marginRight: '48px', color: 'white' }}>书店管理系统</h1>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </div>
      <div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" style={{ color: 'white' }}>
            <UserOutlined /> 用户
          </Button>
        </Dropdown>
      </div>
    </Header>
  );
};

export default Navbar; 