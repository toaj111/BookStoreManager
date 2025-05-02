import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
    BookOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    DollarOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const { Header, Content, Sider } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleMenuClick = (key) => {
        if (key === 'logout') {
            authService.logout();
            navigate('/login');
        } else {
            navigate(key);
        }
    };

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
            label: '进货管理',
        },
        {
            key: '/financial',
            icon: <DollarOutlined />,
            label: '财务管理',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ 
                display: 'flex', 
                alignItems: 'center',
                background: colorBgContainer,
                padding: '0 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    color: '#1890ff'
                }}>
                    书店管理系统
                </div>
            </Header>
            <Layout>
                <Sider 
                    width={200} 
                    collapsible 
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    style={{ 
                        background: colorBgContainer,
                        borderRight: '1px solid #f0f0f0'
                    }}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        style={{ height: '100%', borderRight: 0 }}
                        items={menuItems}
                        onClick={({ key }) => handleMenuClick(key)}
                    />
                </Sider>
                <Layout style={{ padding: '24px' }}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainLayout; 