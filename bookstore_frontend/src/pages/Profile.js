import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Spin, Select } from 'antd';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { user, logout } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState(null);

    useEffect(() => {
        if (user) {
            setInitialValues(user);
            form.setFieldsValue(user);
        }
    }, [user, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            // 只允许修改部分字段
            const updateData = {
                username: user.username,
                email: values.email,
                first_name: values.first_name,
                last_name: values.last_name,
                phone: values.phone,
                address: values.address,
                department: values.department,
                position: values.position,
                role: user.role,
                is_active: user.is_active,
                is_staff: user.is_staff,
                is_superuser: user.is_superuser,
                password: values.password, // 不修改密码时传空字符串
                confirm_password: values.confirm_password
            };
            await axios.put(`${API_BASE_URL}/accounts/users/${user.id}/`, updateData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            message.success('个人信息更新成功');
        } catch (error) {
            if (error.response?.status === 401) {
                message.error('登录已过期，请重新登录');
                logout();
            } else {
                message.error('个人信息更新失败');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Spin />;
    }

    return (
        <Card title="个人信息" style={{ maxWidth: 500, margin: '40px auto' }}>
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleSubmit}
            >
                <Form.Item label="用户名" name="username">
                    <Input disabled />
                </Form.Item>
                <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}> 
                    <Input />
                </Form.Item>
                <Form.Item label="名字" name="first_name" rules={[{ required: true, message: '请输入名字' }]}> 
                    <Input />
                </Form.Item>
                <Form.Item label="姓氏" name="last_name" rules={[{ required: true, message: '请输入姓氏' }]}> 
                    <Input />
                </Form.Item>
                <Form.Item label="性别" name="gender">
                    <Select allowClear>
                        <Select.Option value="male">男</Select.Option>
                        <Select.Option value="female">女</Select.Option>
                        <Select.Option value="secret">保密</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="电话" name="phone">
                    <Input />
                </Form.Item>
                <Form.Item label="地址" name="address">
                    <Input />
                </Form.Item>
                <Form.Item label="部门" name="department">
                    <Input />
                </Form.Item>
                <Form.Item label="职位" name="position">
                    <Input />
                </Form.Item>
                {/* 新增密码修改功能 */}
                <Form.Item label="新密码" name="password" rules={[
                    { min: 8, message: '密码至少8个字符' },
                    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: '密码必须包含字母和数字' }
                ]} hasFeedback>
                    <Input.Password autoComplete="new-password" />
                </Form.Item>
                <Form.Item label="确认新密码" name="confirm_password" dependencies={["password"]} hasFeedback
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!getFieldValue('password') || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致'));
                            },
                        }),
                    ]}
                >
                    <Input.Password autoComplete="new-password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        保存修改
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
export default Profile; 