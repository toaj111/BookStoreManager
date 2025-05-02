import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    BookOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    AccountBookOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content, Sider } = Layout;

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, hasPermission } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to="/profile">个人信息</Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    const menuItems = [
        {
            key: '/books',
            icon: <BookOutlined />,
            label: '图书管理',
        },
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

    if (hasPermission('manage_users')) {
        menuItems.push({
            key: '/users',
            icon: <UserOutlined />,
            label: '用户管理',
        });
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: '20px' }}>书店管理系统</div>
                <Dropdown overlay={userMenu} placement="bottomRight">
                    <Space style={{ cursor: 'pointer', color: 'white' }}>
                        <Avatar icon={<UserOutlined />} />
                        <span>{user?.username}</span>
                    </Space>
                </Dropdown>
            </Header>
            <Layout>
                <Sider width={200} theme="light">
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={({ key }) => navigate(key)}
                    />
                </Sider>
                <Layout style={{ padding: '24px' }}>
                    <Content>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainLayout; 