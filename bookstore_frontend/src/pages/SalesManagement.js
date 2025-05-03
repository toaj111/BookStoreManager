import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Popconfirm,
} from 'antd';
import { PlusOutlined, ShoppingCartOutlined, RollbackOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchText, setSearchText] = useState('');

  // 获取所有销售记录
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/books/sales/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSales(response.data);
    } catch (error) {
      message.error('获取销售记录失败');
      console.error('Error fetching sales:', error);
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
      console.log('Fetched books:', response.data); // 添加日志
      // 只显示在售状态且有库存的图书
      const availableBooks = response.data.filter(book => book.status === 'in_stock' && book.stock > 0);
      console.log('Available books:', availableBooks); // 添加日志
      setBooks(availableBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
      message.error('获取图书列表失败');
    }
  };

  useEffect(() => {
    fetchSales();
    fetchBooks();
  }, []);

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // 添加到购物车
  const handleAddToCart = () => {
    form.validateFields()
      .then(values => {
        const book = books.find(b => b.id === values.book);
        if (book) {
          if (values.quantity > book.stock) {
            message.error('库存不足');
            return;
          }
          const cartItem = {
            book_id: book.id,
            title: book.title,
            isbn: book.isbn,
            quantity: values.quantity,
            price: book.price,  // 使用图书的零售价
            total: book.price * values.quantity
          };
          setCart([...cart, cartItem]);
          form.resetFields();
        }
      });
  };

  // 从购物车移除
  const handleRemoveFromCart = (index) => {
    const newCart = cart.filter((_, idx) => idx !== index);
    setCart(newCart);
  };

  // 完成销售
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      message.warning('购物车为空');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/books/sales/create_batch/`,
        { items: cart },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data) {
        message.success('销售成功');
        setCart([]);
        setIsModalVisible(false);
        fetchSales();
        fetchBooks(); // 刷新图书列表以更新库存
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      message.error(error.response?.data?.error || '销售失败');
    }
  };

  // 处理退货
  const handleReturn = async (id) => {
    try {
      await axios.post(
        `${API_BASE_URL}/books/sales/${id}/return_sale/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      message.success('退货成功');
      fetchSales();
      fetchBooks(); // 刷新图书列表以更新库存
    } catch (error) {
      console.error('Error returning sale:', error);
      message.error(error.response?.data?.error || '退货失败');
    }
  };

  const columns = [
    {
      title: '销售编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '图书信息',
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
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '销售单价',
      dataIndex: 'sale_price',
      key: 'sale_price',
      render: (price) => `¥${price}`,
    },
    {
      title: '总金额',
      key: 'total_amount',
      render: (_, record) => `¥${(record.quantity * record.sale_price).toFixed(2)}`,
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
          {record.status === 'completed' && (
            <Popconfirm
              title="确定要退货吗？"
              onConfirm={() => handleReturn(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button icon={<RollbackOutlined />}>退货</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 计算总金额
  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={4}>销售管理</Title>
        
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Search
            placeholder="搜索销售记录"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            新建销售
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={sales}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title="新建销售"
          open={isModalVisible}
          onOk={handleCompleteSale}
          onCancel={() => {
            setIsModalVisible(false);
            setCart([]);
          }}
          width={800}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="book"
              label="选择图书"
              rules={[{ required: true, message: '请选择图书' }]}
            >
              <Select
                showSearch
                placeholder="搜索并选择图书"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {books.map(book => (
                  <Option key={book.id} value={book.id}>
                    {book.title} (库存: {book.stock}, 价格: ¥{book.price})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              label="数量"
              rules={[{ required: true, message: '请输入数量' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddToCart}
                style={{ width: '100%' }}
              >
                添加到购物车
              </Button>
            </Form.Item>
          </Form>

          <div style={{ marginTop: 16 }}>
            <Title level={5}>购物车</Title>
            <Table
              dataSource={cart}
              rowKey={(record, index) => index}
              pagination={false}
              columns={[
                {
                  title: '图书',
                  dataIndex: 'title',
                  key: 'title',
                },
                {
                  title: '数量',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: '单价',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => `¥${price}`,
                },
                {
                  title: '小计',
                  dataIndex: 'total',
                  key: 'total',
                  render: (_, record) => `¥${record.total.toFixed(2)}`,
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record, index) => (
                    <Button
                      type="link"
                      danger
                      onClick={() => handleRemoveFromCart(index)}
                    >
                      删除
                    </Button>
                  ),
                },
              ]}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Title level={4}>总计: ¥{totalAmount.toFixed(2)}</Title>
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default SalesManagement; 