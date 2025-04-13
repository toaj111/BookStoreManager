import React, { useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, InputNumber, Select, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Search } = Input;

const PurchaseManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingOrder, setEditingOrder] = useState(null);
  const [books, setBooks] = useState([]); // 这里应该从API获取图书列表

  // 订单状态标签颜色映射
  const statusColors = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'error',
  };

  // 表格列定义
  const columns = [
    {
      title: '订单编号',
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
      title: '进货单价',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      render: (price) => `¥${price.toFixed(2)}`,
    },
    {
      title: '总金额',
      key: 'total_amount',
      render: (_, record) => `¥${(record.quantity * record.purchase_price).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: '待付款',
          paid: '已付款',
          cancelled: '已取消',
        };
        return <Tag color={statusColors[status]}>{statusMap[status]}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary"
                onClick={() => handlePay(record)}
              >
                付款
              </Button>
              <Button 
                type="primary" 
                danger
                onClick={() => handleCancel(record)}
              >
                取消
              </Button>
            </>
          )}
          <Button 
            type="link"
            onClick={() => handleViewDetails(record)}
          >
            查看详情
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

  // 处理付款
  const handlePay = (record) => {
    Modal.confirm({
      title: '确认付款',
      content: `确定要为订单 ${record.id} 付款 ¥${(record.quantity * record.purchase_price).toFixed(2)} 吗？`,
      onOk() {
        // TODO: 实现付款功能
        message.success('付款成功');
      },
    });
  };

  // 处理取消
  const handleCancel = (record) => {
    Modal.confirm({
      title: '确认取消',
      content: `确定要取消订单 ${record.id} 吗？`,
      onOk() {
        // TODO: 实现取消功能
        message.success('订单已取消');
      },
    });
  };

  // 处理查看详情
  const handleViewDetails = (record) => {
    // TODO: 实现查看详情功能
  };

  // 处理添加订单
  const handleAddOrder = () => {
    form.validateFields()
      .then(values => {
        console.log('表单数据:', values);
        // TODO: 实现添加订单功能
        form.resetFields();
        setIsModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
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
              setEditingOrder(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            新建进货单
          </Button>
          <Search
            placeholder="输入订单编号或图书名称搜索"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="新建进货单"
        open={isModalVisible}
        onOk={handleAddOrder}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
        width={600}
      >
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
                  {book.title} (ISBN: {book.isbn})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="进货数量"
            rules={[{ required: true, message: '请输入进货数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="purchase_price"
            label="进货单价"
            rules={[{ required: true, message: '请输入进货单价' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              prefix="¥"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseManagement; 