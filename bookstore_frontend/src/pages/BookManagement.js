import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [searchText, categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/books/categories/');
      setCategories(response.data.results);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        page_size: pageSize,
      });
      if (searchText) params.append('search', searchText);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/api/books/books/?${params}`);
      setBooks(response.data.results);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.data.count,
      });
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
      render: (price) => `¥${price.toFixed(2)}`,
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
      </Card>
    </div>
  );
};

export default BookManagement; 