import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  InputNumber,
  Button,
  Space,
  Tag,
  Select,
  Card,
  Typography,
  Tooltip,
} from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { EditOutlined } from '@ant-design/icons';
import { Modal, Form } from 'antd';

const { Title } = Typography;
const { Option } = Select;


const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [searchText, categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/categories/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/books/books/`;
      const params = new URLSearchParams();
      
      if (searchText) params.append('search', searchText);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    fetchBooks(pagination.current, pagination.pageSize);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      in_stock: { color: 'green', text: '在库' },
      out_of_stock: { color: 'red', text: '缺货' },
      discontinued: { color: 'gray', text: '停售' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const handleEdit = (record) => {
    setEditingBook(record);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      isbn: record.isbn,
      title: record.title,
      author: record.author,
      publisher: record.publisher,
      price: record.price,
    });
  };
  
  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      await axios.put(`${API_BASE_URL}/books/books/${editingBook.id}/`, values, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      setEditModalVisible(false);
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };
  
  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingBook(null);
    editForm.resetFields();
  };

  const columns = [
    {
      title: '图书信息',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.title}</div>
          <div style={{ color: '#666' }}>
            {record.author} | {record.publisher}
          </div>
          <div style={{ color: '#999' }}>ISBN: {record.isbn}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => {
        if (price === null || price === undefined) return '-';
        const numPrice = Number(price);
        return isNaN(numPrice) ? '-' : `¥${numPrice.toFixed(2)}`;
      },
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        text ? (
          <Tooltip title={text}>
            <InfoCircleOutlined style={{ cursor: 'pointer' }} />
          </Tooltip>
        ) : '-'
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={4}>图书管理</Title>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Input
            placeholder="搜索图书标题、作者、出版社或ISBN"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="选择分类"
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
            allowClear
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="in_stock">在库</Option>
            <Option value="out_of_stock">缺货</Option>
            <Option value="discontinued">停售</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={books}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
        <Modal
              title="编辑图书信息"
              open={editModalVisible}
              onOk={handleEditOk}
              onCancel={handleEditCancel}
              destroyOnClose
            >

              <Form form={editForm} layout="vertical">
                <Form.Item label="ISBN" name="isbn" rules={[{ required: true, message: '请输入ISBN' }]}>
                  <Input disabled/>
                </Form.Item>
                <Form.Item label="书籍名称" name="title" rules={[{ required: true, message: '请输入书籍名称' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="作者" name="author" rules={[{ required: true, message: '请输入作者' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="出版社" name="publisher" rules={[{ required: true, message: '请输入出版社' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="零售价格" name="price" rules={[
                  { required: true, message: '请输入零售价格' }
                ]}>
                  <InputNumber min={0.01} style={{ width: '100%' }} prefix="¥" />
                </Form.Item>
              </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default BookManagement; 