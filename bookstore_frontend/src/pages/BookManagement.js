import React, { useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Search } = Input;

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingBook, setEditingBook] = useState(null);

  // 表格列定义
  const columns = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: '零售价',
      dataIndex: 'retail_price',
      key: 'retail_price',
      render: (price) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'current_stock',
      key: 'current_stock',
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
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
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

  // 处理添加/编辑
  const handleAddEdit = () => {
    form.validateFields()
      .then(values => {
        console.log('表单数据:', values);
        // TODO: 实现添加/编辑功能
        form.resetFields();
        setIsModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };

  // 处理编辑
  const handleEdit = (record) => {
    setEditingBook(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // 处理删除
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除《${record.title}》吗？`,
      onOk() {
        // TODO: 实现删除功能
        message.success('删除成功');
      },
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
              setEditingBook(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            添加图书
          </Button>
          <Search
            placeholder="输入书名或ISBN搜索"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={books}
        rowKey="isbn"
        loading={loading}
      />

      <Modal
        title={editingBook ? "编辑图书" : "添加图书"}
        open={isModalVisible}
        onOk={handleAddEdit}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="isbn"
            label="ISBN"
            rules={[{ required: true, message: '请输入ISBN' }]}
          >
            <Input disabled={!!editingBook} />
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
            name="retail_price"
            label="零售价"
            rules={[{ required: true, message: '请输入零售价' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              prefix="¥"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="current_stock"
            label="库存"
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookManagement; 