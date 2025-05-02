import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Select,
  Card,
  Typography,
} from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const PurchaseOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  const fetchOrders = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        page_size: pageSize,
      });
      if (searchText) params.append('search', searchText);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/api/books/purchase-orders/?${params}`);
      setOrders(response.data.results);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.data.count,
      });
    } catch (error) {
      message.error('获取进货订单列表失败');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchText, statusFilter]);

  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, pagination.pageSize);
  };

  const handlePay = async (record) => {
    try {
      await axios.post(`/api/books/purchase-orders/${record.id}/pay/`);
      message.success('付款成功');
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('付款失败');
      console.error('Error paying order:', error);
    }
  };

  const handleReturn = async (record) => {
    try {
      await axios.post(`/api/books/purchase-orders/${record.id}/return_order/`);
      message.success('退货成功');
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('退货失败');
      console.error('Error returning order:', error);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '未付款' },
      paid: { color: 'green', text: '已付款' },
      returned: { color: 'red', text: '已退货' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns = [
    {
      title: '图书信息',
      dataIndex: 'book',
      key: 'book',
      render: (_, record) => (
        <div>
          <div>{record.book_title}</div>
          <div style={{ color: '#999' }}>ISBN: {record.book_isbn}</div>
        </div>
      ),
    },
    {
      title: '进货价格',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      render: (price) => `¥${price.toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '创建人',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button type="primary" onClick={() => handlePay(record)}>
                付款
              </Button>
              <Button danger onClick={() => handleReturn(record)}>
                退货
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Title level={4}>进货订单管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/purchase-orders/create')}
          >
            创建进货订单
          </Button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Input
            placeholder="搜索图书标题、作者、出版社或ISBN"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="选择状态"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="pending">未付款</Option>
            <Option value="paid">已付款</Option>
            <Option value="returned">已退货</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default PurchaseOrderManagement; 