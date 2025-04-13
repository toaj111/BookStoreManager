import React, { useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, InputNumber, Select, message, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Search } = Input;

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [books, setBooks] = useState([]); // 这里应该从API获取图书列表
  const [cart, setCart] = useState([]); // 购物车

  // 表格列定义
  const columns = [
    {
      title: '销售编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '图书ISBN',
      dataIndex: 'book_isbn',
      key: 'book_isbn',
    },
    {
      title: '图书名称',
      dataIndex: 'book_title',
      key: 'book_title',
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
      render: (price) => `¥${price.toFixed(2)}`,
    },
    {
      title: '总金额',
      key: 'total_amount',
      render: (_, record) => `¥${(record.quantity * record.sale_price).toFixed(2)}`,
    },
    {
      title: '销售时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link"
          onClick={() => handleViewDetails(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = (value) => {
    console.log('搜索:', value);
    // TODO: 实现搜索功能
  };

  // 处理查看详情
  const handleViewDetails = (record) => {
    // TODO: 实现查看详情功能
  };

  // 添加到购物车
  const handleAddToCart = () => {
    form.validateFields()
      .then(values => {
        // 查找对应的图书信息
        const book = books.find(b => b.isbn === values.book_id);
        if (book) {
          const cartItem = {
            isbn: book.isbn,
            title: book.title,
            quantity: values.quantity,
            price: book.retail_price,
            total: book.retail_price * values.quantity
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
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      message.warning('购物车为空');
      return;
    }

    Modal.confirm({
      title: '确认销售',
      content: `总金额: ¥${cart.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`,
      onOk() {
        // TODO: 实现销售功能
        message.success('销售成功');
        setCart([]);
      },
    });
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={16}>
          <Card title="销售记录" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Search
                placeholder="输入销售编号或图书名称搜索"
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
            </div>
            <Table
              columns={columns}
              dataSource={sales}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="新建销售" style={{ marginBottom: 16 }}>
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="book_id"
                label="选择图书"
                rules={[{ required: true, message: '请选择图书' }]}
              >
                <Select
                  showSearch
                  placeholder="搜索并选择图书"
                  optionFilterProp="children"
                >
                  {books.map(book => (
                    <Select.Option key={book.isbn} value={book.isbn}>
                      {book.title} (¥{book.retail_price})
                    </Select.Option>
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
          </Card>

          <Card title="购物车" extra={
            <Button 
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
            >
              完成销售
            </Button>
          }>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                购物车为空
              </div>
            ) : (
              <>
                {cart.map((item, index) => (
                  <Card.Grid style={{ width: '100%' }} key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div>{item.title}</div>
                        <div>数量: {item.quantity} × ¥{item.price}</div>
                      </div>
                      <div>
                        <Button 
                          type="link" 
                          danger
                          onClick={() => handleRemoveFromCart(index)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </Card.Grid>
                ))}
                <Statistic 
                  title="总计" 
                  value={cart.reduce((sum, item) => sum + item.total, 0)} 
                  precision={2} 
                  prefix="¥"
                  style={{ margin: '16px 0' }}
                />
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SalesManagement; 