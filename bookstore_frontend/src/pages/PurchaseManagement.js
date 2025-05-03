import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Card,
  Typography,
  Popconfirm,
} from 'antd';
import { PlusOutlined, PayCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { Title } = Typography;
const { Option } = Select;

const PurchaseManagement = () => {
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isNewBook, setIsNewBook] = useState(false);
  const [form] = Form.useForm();
  const [shelveModalVisible, setShelveModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [retailPrice, setRetailPrice] = useState(null);

  // 获取所有进货订单
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/books/purchase-orders/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      message.error('获取进货订单失败');
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  // 获取所有图书
  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/books/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // 获取所有分类
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

  useEffect(() => {
    fetchOrders();
    fetchBooks();
    fetchCategories();
  }, []);

  // 打开进货弹窗
  const handleAdd = () => {
    setIsNewBook(false);
    form.resetFields();
    setModalVisible(true);
  };

  // 切换新书/已有书
  const handleBookTypeChange = (val) => {
    setIsNewBook(val === 'new');
    form.resetFields();
  };

  // 提交进货订单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isNewBook) {
        // 新书进货
        await axios.post(`${API_BASE_URL}/books/purchase-orders/create_with_new_book/`, values, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        // 已有书进货
        await axios.post(`${API_BASE_URL}/books/purchase-orders/`, values, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      message.success('进货订单创建成功');
      setModalVisible(false);
      fetchOrders();
    } catch (error) {
      message.error('进货订单创建失败');
      console.error('Error submitting purchase:', error);
    }
  };

  // 付款
  const handlePay = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/books/purchase-orders/${id}/pay/`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('付款成功');
      fetchOrders();
    } catch (error) {
      message.error('付款失败');
      console.error('Error paying order:', error);
    }
  };

  // 退货
  const handleReturn = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/books/purchase-orders/${id}/return_order/`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('退货成功');
      fetchOrders();
    } catch (error) {
      message.error('退货失败');
      console.error('Error returning order:', error);
    }
  };

  // 上架功能
  const handleShelve = async () => {
    // 如果是新书（库存为0），则必须输入零售价格
    if (selectedOrder.book_stock === 0 && (!retailPrice || retailPrice <= 0)) {
      message.error('请输入有效的零售价格');
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/books/purchase-orders/${selectedOrder.id}/shelve/`,
        {
          retail_price: selectedOrder.book_stock === 0 ? retailPrice : undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data) {
        message.success('上架成功');
        setShelveModalVisible(false);
        setRetailPrice(null);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error shelving order:', error);
      message.error(error.response?.data?.error || '上架失败');
    }
  };

  const showShelveModal = (record) => {
    setSelectedOrder(record);
    setRetailPrice(null);
    setShelveModalVisible(true);
  };

  const columns = [
    {
      title: '图书',
      dataIndex: 'book_title',
      key: 'book_title',
      render: (text, record) => (
        <span>
          {text} <br />
          <span style={{ color: '#999', fontSize: 12 }}>ISBN: {record.book_isbn}</span>
        </span>
      ),
    },
    {
      title: '进货价格',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      render: (price) => `¥${price}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '状态',
      dataIndex: 'status_display',
      key: 'status_display',
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

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={4}>进货管理</Title>
        <div style={{ marginBottom: '16px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建进货订单
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
        />
        <Modal
          title="新建进货订单"
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Form.Item label="进货类型" name="type" initialValue="exist">
              <Select onChange={handleBookTypeChange}>
                <Option value="exist">已有图书</Option>
                <Option value="new">新书进货</Option>
              </Select>
            </Form.Item>
            {isNewBook ? (
              <>
                <Form.Item
                  name="isbn"
                  label="ISBN"
                  rules={[{ required: true, message: '请输入ISBN' }, { len: 13, message: 'ISBN必须为13位' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="title"
                  label="书名"
                  rules={[{ required: true, message: '请输入书名' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="author"
                  label="作者"
                  rules={[{ required: true, message: '请输入作者' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="publisher"
                  label="出版社"
                  rules={[{ required: true, message: '请输入出版社' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="category"
                  label="分类"
                  rules={[{ required: true, message: '请选择分类' }]}
                >
                  <Select>
                    {categories.map((cat) => (
                      <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="description"
                  label="描述"
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  name="purchase_price"
                  label="进货价格"
                  rules={[{ required: true, message: '请输入进货价格' }]}
                >
                  <InputNumber min={0.01} style={{ width: '100%' }} prefix="¥" />
                </Form.Item>
                <Form.Item
                  name="quantity"
                  label="进货数量"
                  rules={[{ required: true, message: '请输入进货数量' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  name="book"
                  label="选择图书"
                  rules={[{ required: true, message: '请选择图书' }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {books.map((book) => (
                      <Option key={book.id} value={book.id}>
                        {book.title}（{book.author}）
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="purchase_price"
                  label="进货价格"
                  rules={[{ required: true, message: '请输入进货价格' }]}
                >
                  <InputNumber min={0.01} style={{ width: '100%' }} prefix="¥" />
                </Form.Item>
                <Form.Item
                  name="quantity"
                  label="进货数量"
                  rules={[{ required: true, message: '请输入进货数量' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

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
              {selectedOrder.book_stock === 0 ? (
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
                  <div style={{ marginTop: 8, color: '#666' }}>
                    （新书首次上架，需要设置零售价格）
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 16, color: '#666' }}>
                  该书已有库存，将直接增加库存数量。
                </div>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default PurchaseManagement; 