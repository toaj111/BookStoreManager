import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Descriptions } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const { user: currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // 只允许超级管理员访问
    useEffect(() => {
        if (!currentUser?.is_superuser) {
            message.error('无权限访问用户管理页面');
            navigate('/'); // 跳转到首页或其他有权限页面
        }
    }, [currentUser, navigate]);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const handleAuthError = (error) => {
        if (error.response?.status === 401) {
            message.error('登录已过期，请重新登录');
            logout();
            navigate('/login');
            return true;
        }
        return false;
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/accounts/users/`, {
                headers: getAuthHeader()
            });
            setUsers(response.data);
        } catch (error) {
            if (!handleAuthError(error)) {
                message.error('获取用户列表失败');
                console.error('Error fetching users:', error);
            }
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
            first_name: record.first_name,
            last_name: record.last_name,
            role: record.role,
            is_staff: record.is_staff,
            is_superuser: record.is_superuser
        });
        setModalVisible(true);
    };

    const handleView = (record) => {
        setViewingUser(record);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/accounts/users/${id}/`, {
                headers: getAuthHeader()
            });
            message.success('删除用户成功');
            fetchUsers();
        } catch (error) {
            if (!handleAuthError(error)) {
                message.error('删除用户失败');
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log('Form values:', values);

            // 根据角色自动设置权限
            let is_staff = false;
            let is_superuser = false;
            if (values.role === 'admin') {
                is_staff = true;
                is_superuser = true;
            } else if (values.role === 'manager') {
                is_staff = true;
                is_superuser = false;
            }

            if (editingUser) {
                await axios.put(`${API_BASE_URL}/accounts/users/${editingUser.id}/`, {
                    ...values,
                    is_staff,
                    is_superuser
                }, {
                    headers: getAuthHeader()
                });
                message.success('更新用户成功');
            } else {
                const userData = {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    confirm_password: values.password,
                    first_name: values.first_name,
                    last_name: values.last_name,
                    role: values.role || 'staff',
                    is_active: true,
                    is_staff,
                    is_superuser
                };
                console.log('Sending user data:', userData);

                const response = await axios.post(`${API_BASE_URL}/accounts/users/`, userData, {
                    headers: getAuthHeader()
                });
                console.log('Server response:', response.data);
                message.success('创建用户成功');
            }
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            if (!handleAuthError(error)) {
                console.error('Error details:', error.response?.data);
                const errorMessage = error.response?.data?.detail || 
                                   (typeof error.response?.data === 'object' ? 
                                    Object.values(error.response.data).flat().join(', ') : 
                                    '创建用户失败');
                message.error(errorMessage);
                console.error('Error submitting user:', error);
            }
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
                        type="default"
                        onClick={() => handleView(record)}
                    >
                        查看
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
            {/* 查看用户信息弹窗 */}
            <Modal
                title="用户信息"
                open={!!viewingUser}
                onCancel={() => setViewingUser(null)}
                footer={null}
            >
                {viewingUser && (
                    <Descriptions column={1} bordered size="small">
                        {Object.entries(viewingUser).map(([key, value]) => (
                            <Descriptions.Item label={key} key={key}>
                                {typeof value === 'boolean' ? (value ? '是' : '否') : String(value)}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                )}
            </Modal>
            {/* 添加/编辑用户弹窗 */}
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
                                { min: 8, message: '密码至少8个字符' },
                                { 
                                    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                                    message: '密码必须包含字母和数字'
                                }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="first_name"
                        label="名字"
                        rules={[{ required: true, message: '请输入名字' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="last_name"
                        label="姓氏"
                        rules={[{ required: true, message: '请输入姓氏' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select>
                            <Select.Option value="admin">管理员</Select.Option>
                            <Select.Option value="manager">经理</Select.Option>
                            <Select.Option value="staff">普通员工</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement; 