import React, { useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Search } = Input;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  // 表格列定义
  const columns = [
    {
      title: '员工编号',
      dataIndex: 'employee_id',
      key: 'employee_id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'first_name',
      key: 'first_name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role === 'super_admin' ? '超级管理员' : '普通管理员',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => {
        const genderMap = { 'M': '男', 'F': '女', 'O': '其他' };
        return genderMap[gender] || '未知';
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={record.role === 'super_admin'}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = (value) => {
    console.log('搜索:', value);
    // TODO: 实现搜索功能
  };

  // 处理添加/编辑
  const handleAddEdit = () => {
    form.validateFields()
      .then(values => {
        console.log('表单数据:', values);
        // TODO: 实现添加/编辑功能
        form.resetFields();
        setIsModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };

  // 处理编辑
  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // 处理删除
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 ${record.username} 吗？`,
      onOk() {
        // TODO: 实现删除功能
        message.success('删除成功');
      },
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            添加用户
          </Button>
          <Search
            placeholder="输入用户名或员工编号搜索"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="employee_id"
        loading={loading}
      />

      <Modal
        title={editingUser ? "编辑用户" : "添加用户"}
        open={isModalVisible}
        onOk={handleAddEdit}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="employee_id"
            label="员工编号"
            rules={[{ required: true, message: '请输入员工编号' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input disabled={!!editingUser} />
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
            name="first_name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Select.Option value="admin">普通管理员</Select.Option>
              <Select.Option value="super_admin">超级管理员</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="电话"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="gender"
            label="性别"
          >
            <Select>
              <Select.Option value="M">男</Select.Option>
              <Select.Option value="F">女</Select.Option>
              <Select.Option value="O">其他</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 