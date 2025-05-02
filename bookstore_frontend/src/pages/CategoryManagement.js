import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Card,
  Typography,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { Title } = Typography;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/books/categories/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCategories(response.data.results || response.data);
    } catch (error) {
      message.error('获取分类列表失败');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/books/categories/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('删除分类成功');
      fetchCategories();
    } catch (error) {
      message.error('删除分类失败');
      console.error('Error deleting category:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await axios.put(`${API_BASE_URL}/books/categories/${editingCategory.id}/`, values, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        message.success('更新分类成功');
      } else {
        await axios.post(`${API_BASE_URL}/books/categories/`, values, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        message.success('添加分类成功');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      if (error.response?.data) {
        message.error(Object.values(error.response.data).join('\n'));
      } else {
        message.error('操作失败');
      }
      console.error('Error submitting category:', error);
    }
  };

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleString(),
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
          <Popconfirm
            title="确定要删除这个分类吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Title level={4}>分类管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加分类
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title={editingCategory ? '编辑分类' : '添加分类'}
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
              name="name"
              label="分类名称"
              rules={[
                { required: true, message: '请输入分类名称' },
                { max: 100, message: '分类名称不能超过100个字符' },
              ]}
            >
              <Input placeholder="请输入分类名称" />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
              rules={[
                { max: 500, message: '描述不能超过500个字符' },
              ]}
            >
              <Input.TextArea
                placeholder="请输入分类描述"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CategoryManagement; 