import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 如果已经登录，直接跳转到仪表盘
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const onFinish = async (values) => {
    try {
      // 临时模拟登录成功
      if (values.username === 'admin' && values.password === 'admin123') {
        localStorage.setItem('token', 'dummy-token');
        localStorage.setItem('user', JSON.stringify({
          username: 'admin',
          role: 'super_admin'
        }));
        message.success('登录成功！');
        navigate('/dashboard');
        return;
      }

      const response = await axios.post('http://localhost:8000/api/login/', {
        username: values.username,
        password: values.password,
      });

      if (response.data.token) {
        // 保存token到localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        message.success('登录成功！');
        navigate('/dashboard');
      }
    } catch (error) {
      message.error('登录失败：用户名或密码错误');
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
      <Card title="图书销售管理系统" style={{ width: 400 }}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 