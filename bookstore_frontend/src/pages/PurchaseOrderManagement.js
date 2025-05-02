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
  InputNumber,
  Popconfirm,
} from 'antd';
import { SearchOutlined, PlusOutlined, PayCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

console.log('PurchaseOrderManagement loaded');

// 配置 axios
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

const { Title } = Typography;
const { Option } = Select;

const PurchaseOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [shelveModalVisible, setShelveModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [retailPrice, setRetailPrice] = useState(null);
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

      const url = `/api/books/purchase-orders/?${params}`;
      console.log('Fetching orders from:', url);
      
      const response = await api.get(url);
      console.log('Orders fetched:', response.data);
      
      // 确保数据是数组
      const ordersData = Array.isArray(response.data) ? response.data : [];
      console.log('Processed orders data:', ordersData);
      
      setOrders(ordersData);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: ordersData.length,
      });
    } catch (error) {
      console.error('Fetch orders error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      message.error(`获取进货订单列表失败: ${error.message}`);
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
      console.log('Paying order:', record);
      const url = `/api/books/purchase-orders/${record.id}/pay/`;
      console.log('Pay URL:', url);
      
      const response = await api.post(url);
      console.log('Pay response:', response.data);
      
      if (response.data.status === 'paid') {
        message.success('付款成功');
        // 立即更新本地状态
        const updatedOrders = orders.map(order => {
          if (order.id === record.id) {
            console.log('Updating order:', { old: order, new: { ...order, status: 'paid' } });
            return { ...order, status: 'paid' };
          }
          return order;
        });
        console.log('Updated orders:', updatedOrders);
        setOrders(updatedOrders);
        // 然后刷新数据
        await fetchOrders(pagination.current, pagination.pageSize);
      } else {
        console.error('Unexpected pay response:', response.data);
        message.error('付款状态更新失败');
      }
    } catch (error) {
      console.error('Pay error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      message.error('付款失败');
    }
  };

  const handleReturn = async (record) => {
    try {
      await api.post(`/api/books/purchase-orders/${record.id}/return_order/`);
      message.success('退货成功');
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('退货失败');
      console.error('Error returning order:', error);
    }
  };

  const handleShelve = async () => {
    if (!retailPrice || retailPrice <= 0) {
      message.error('请输入有效的零售价格');
      return;
    }
    try {
      await api.post(`/api/books/purchase-orders/${selectedOrder.id}/shelve/`, {
        retail_price: retailPrice
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('上架成功');
      setShelveModalVisible(false);
      setRetailPrice(null);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      message.error(error.response?.data?.error || '上架失败');
      console.error('Error shelving order:', error);
    }
  };

  const showShelveModal = (record) => {
    setSelectedOrder(record);
    setRetailPrice(null);
    setShelveModalVisible(true);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '未付款' },
      paid: { color: 'green', text: '已付款' },
      returned: { color: 'red', text: '已退货' },
      shelved: { color: 'blue', text: '已上架' },
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
        <Space>
          {record.status === 'pending' && (
            <Button
              type="primary"
              icon={<PayCircleOutlined />}
              onClick={() => handlePay(record.id)}
            >
              付款
            </Button>
          )}
          {record.status === 'pending' && (
            <Popconfirm
              title="确定要退货吗？"
              onConfirm={() => handleReturn(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button icon={<RollbackOutlined />}>退货</Button>
            </Popconfirm>
          )}
          {record.status === 'paid' && (
            <Button
              type="primary"
              style={{ backgroundColor: '#52c41a' }}
              onClick={() => showShelveModal(record)}
            >
              上架
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 添加 useEffect 来监听 orders 变化
  useEffect(() => {
    console.log('Orders state updated:', orders);
  }, [orders]);

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

        <div style={{ marginBottom: '16px', padding: '8px', background: '#f5f5f5' }}>
          <p>订单数量: {orders.length}</p>
          <p>第一个订单状态: {orders[0]?.status || '无数据'}</p>
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

      <Modal
        title="上架图书"
        open={shelveModalVisible}
        onOk={handleShelve}
        onCancel={() => {
          setShelveModalVisible(false);
          setRetailPrice(null);
          setSelectedOrder(null);
        }}
        okText="确认上架"
        cancelText="取消"
      >
        {selectedOrder && (
          <div>
            <p>图书：{selectedOrder.book_title}</p>
            <p>ISBN：{selectedOrder.book_isbn}</p>
            <p>进货数量：{selectedOrder.quantity}</p>
            <div style={{ marginTop: 16 }}>
              <label>零售价格：</label>
              <InputNumber
                min={0.01}
                step={0.01}
                precision={2}
                value={retailPrice}
                onChange={setRetailPrice}
                style={{ width: 200 }}
                prefix="¥"
              />
            </div>
          </div>
        )}
      </Modal>

      <div style={{ color: 'red', fontSize: 16 }}>
        DEBUG: 页面已加载
      </div>
    </div>
  );
};

export default PurchaseOrderManagement; 