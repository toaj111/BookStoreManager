import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Typography,
  Tabs,
  InputNumber,
  message,
  Spin,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const CreatePurchaseOrder = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/books/categories/');
      setCategories(response.data.results);
    } catch (error) {
      message.error('获取分类列表失败');
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async (search) => {
    if (!search) return;
    setBookLoading(true);
    try {
      const response = await axios.get(`/api/books/books/?search=${search}`);
      setBooks(response.data.results);
    } catch (error) {
      message.error('获取图书列表失败');
      console.error('Error fetching books:', error);
    } finally {
      setBookLoading(false);
    }
  };

  const handleSearch = (value) => {
    fetchBooks(value);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (values.type === 'existing') {
        await axios.post('/api/books/purchase-orders/', {
          book: values.book,
          purchase_price: values.purchase_price,
          quantity: values.quantity,
        });
      } else {
        await axios.post('/api/books/purchase-orders/create_with_new_book/', {
          isbn: values.isbn,
          title: values.title,
          author: values.author,
          publisher: values.publisher,
          category: values.category,
          description: values.description,
          purchase_price: values.purchase_price,
          quantity: values.quantity,
        });
      }
      message.success('创建进货订单成功');
      navigate('/purchase-orders');
    } catch (error) {
      message.error('创建进货订单失败');
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={4}>创建进货订单</Title>
        <Tabs defaultActiveKey="existing">
          <TabPane tab="已有图书" key="existing">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ type: 'existing' }}
            >
              <Form.Item
                name="book"
                label="选择图书"
                rules={[{ required: true, message: '请选择图书' }]}
              >
                <Select
                  showSearch
                  placeholder="输入图书标题、作者、出版社或ISBN搜索"
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  filterOption={false}
                  onSearch={handleSearch}
                  loading={bookLoading}
                  notFoundContent={null}
                >
                  {books.map((book) => (
                    <Option key={book.id} value={book.id}>
                      {book.title} - {book.author} - {book.publisher} - ISBN: {book.isbn}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="purchase_price"
                label="进货价格"
                rules={[
                  { required: true, message: '请输入进货价格' },
                  { type: 'number', min: 0.01, message: '价格必须大于0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  step={0.01}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[
                  { required: true, message: '请输入数量' },
                  { type: 'number', min: 1, message: '数量必须大于0' },
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  创建订单
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="新书" key="new">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ type: 'new' }}
            >
              <Form.Item
                name="isbn"
                label="ISBN"
                rules={[
                  { required: true, message: '请输入ISBN' },
                  { pattern: /^\d{13}$/, message: 'ISBN必须是13位数字' },
                ]}
              >
                <Input placeholder="请输入13位ISBN号码" maxLength={13} />
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
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="description" label="描述">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name="purchase_price"
                label="进货价格"
                rules={[
                  { required: true, message: '请输入进货价格' },
                  { type: 'number', min: 0.01, message: '价格必须大于0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  step={0.01}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[
                  { required: true, message: '请输入数量' },
                  { type: 'number', min: 1, message: '数量必须大于0' },
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  创建订单
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CreatePurchaseOrder; 