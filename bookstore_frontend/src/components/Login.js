import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import ErrorMessage from './ErrorMessage';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            setError(null);
            await authService.login(values.username, values.password);
            message.success('登录成功');
            navigate('/books');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f0f2f5'
        }}>
            <Card
                title="书店管理系统"
                style={{
                    width: 400,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                <ErrorMessage error={error} />
                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login; 