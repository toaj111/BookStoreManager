import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  AccountBookOutlined,
  LogoutOutlined,
  TagsOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, logout } = useAuth();

  const menuItems = [
    {
      key: '/books',
      icon: <BookOutlined />,
      label: '图书管理',
    },
    {
      key: '/categories',
      icon: <TagsOutlined />,
      label: '分类管理',
    },
    {
      key: '/purchase-orders',
      icon: <ShoppingCartOutlined />,
      label: '进货管理',
    },
    ...(isAdmin() ? [{
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    }] : []),
    {
      key: '/sales',
      icon: <ShoppingCartOutlined />,
      label: '销售管理',
    },
    {
      key: '/purchases',
      icon: <ShoppingOutlined />,
      label: '采购管理',
    },
    {
      key: '/financials',
      icon: <AccountBookOutlined />,
      label: '财务管理',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sider width={200} style={{ background: '#fff' }}>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ width: '100%' }}
        >
          退出登录
        </Button>
      </div>
    </Sider>
  );
};

export default Sidebar; 