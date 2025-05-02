import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, message,
    Space, Popconfirm, Tag
} from 'antd';
import api from '../services/api';

const { Option } = Select;

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);
    const [roles, setRoles] = useState({});

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/');
            setUsers(response.data);
        } catch (error) {
            message.error('获取用户列表失败');
        }
        setLoading(false);
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/users/roles/');
            setRoles(response.data.roles);
        } catch (error) {
            message.error('获取角色列表失败');
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        form.resetFields();
        setVisible(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/users/${id}/`);
            message.success('删除用户成功');
            fetchUsers();
        } catch (error) {
            message.error('删除用户失败');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                await api.put(`/users/${editingUser.id}/`, values);
                message.success('更新用户成功');
            } else {
                await api.post('/users/', values);
                message.success('创建用户成功');
            }
            setVisible(false);
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.detail || '操作失败');
        }
    };

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '姓名',
            key: 'name',
            render: (_, record) => `${record.first_name} ${record.last_name}`,
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'green'}>
                    {roles[role] || role}
                </Tag>
            ),
        },
        {
            title: '状态',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? '启用' : '禁用'}
                </Tag>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个用户吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={handleCreate}>
                    创建用户
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
            />
            <Modal
                title={editingUser ? '编辑用户' : '创建用户'}
                open={visible}
                onOk={handleSubmit}
                onCancel={() => setVisible(false)}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input />
                    </Form.Item>
                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
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
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select>
                            {Object.entries(roles).map(([value, label]) => (
                                <Option key={value} value={value}>{label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="is_active"
                        label="状态"
                        valuePropName="checked"
                    >
                        <Select>
                            <Option value={true}>启用</Option>
                            <Option value={false}>禁用</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserList; 