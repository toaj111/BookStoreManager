import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/accounts/users/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            message.error('获取用户列表失败');
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            username: record.username,
            email: record.email,
            is_staff: record.is_staff,
            is_superuser: record.is_superuser
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/accounts/users/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            message.success('删除用户成功');
            fetchUsers();
        } catch (error) {
            message.error('删除用户失败');
            console.error('Error deleting user:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                await axios.put(`${API_BASE_URL}/accounts/users/${editingUser.id}/`, values, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                message.success('更新用户成功');
            } else {
                await axios.post(`${API_BASE_URL}/accounts/users/`, values, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                message.success('创建用户成功');
            }
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            message.error(editingUser ? '更新用户失败' : '创建用户失败');
            console.error('Error submitting user:', error);
        }
    };

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '管理员',
            dataIndex: 'is_staff',
            key: 'is_staff',
            render: (isStaff) => isStaff ? '是' : '否'
        },
        {
            title: '超级管理员',
            dataIndex: 'is_superuser',
            key: 'is_superuser',
            render: (isSuperuser) => isSuperuser ? '是' : '否'
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        disabled={record.id === currentUser?.id}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个用户吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                        disabled={record.id === currentUser?.id}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            disabled={record.id === currentUser?.id}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    添加用户
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
            />
            <Modal
                title={editingUser ? '编辑用户' : '添加用户'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 3, message: '用户名至少3个字符' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
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
                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[
                                { required: true, message: '请输入密码' },
                                { min: 6, message: '密码至少6个字符' }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="is_staff"
                        label="管理员权限"
                        valuePropName="checked"
                    >
                        <Select>
                            <Select.Option value={true}>是</Select.Option>
                            <Select.Option value={false}>否</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="is_superuser"
                        label="超级管理员权限"
                        valuePropName="checked"
                    >
                        <Select>
                            <Select.Option value={true}>是</Select.Option>
                            <Select.Option value={false}>否</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement; 