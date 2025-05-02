import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await authService.login(values.username, values.password);
            if (response.access) {
                message.success('登录成功');
                authService.getCurrentUser();
                navigate('/', { replace: true });
            }
        } catch (error) {
            message.error('登录失败：' + (error.response?.data?.detail || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 300, margin: '100px auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: 24 }}>书店管理系统</h1>
            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="用户名" />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        登录
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login; 