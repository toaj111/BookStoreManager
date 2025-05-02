import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Select, DatePicker } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

const { Option } = Select;

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                gender: user.gender,
                phone: user.phone,
                hire_date: user.hire_date ? new Date(user.hire_date) : null,
            });
        }
    }, [user, form]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const response = await userService.updateProfile(values);
            updateUser(response.data);
            message.success('个人信息更新成功');
        } catch (error) {
            message.error('更新失败：' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="个人信息" style={{ maxWidth: 600, margin: '0 auto' }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    role: user?.role,
                    gender: user?.gender,
                }}
            >
                <Form.Item
                    name="username"
                    label="用户名"
                    rules={[{ required: true, message: '请输入用户名' }]}
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="first_name"
                    label="名字"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="last_name"
                    label="姓氏"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="role"
                    label="角色"
                >
                    <Select disabled>
                        <Option value="admin">管理员</Option>
                        <Option value="manager">经理</Option>
                        <Option value="staff">普通员工</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="gender"
                    label="性别"
                >
                    <Select>
                        <Option value="M">男</Option>
                        <Option value="F">女</Option>
                        <Option value="O">其他</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="电话"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="hire_date"
                    label="入职日期"
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        保存
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default Profile; 