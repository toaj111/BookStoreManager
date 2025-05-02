import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Card,
  Typography,
  DatePicker,
  InputNumber,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;

const SaleManagement = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/sales/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSales(response.data.results || response.data);
    } catch (error) {
      message.error('获取销售记录失败');
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.sale_date = values.sale_date.format('YYYY-MM-DD');
      
      await axios.post(`${API_BASE_URL}/sales/`, values, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('添加销售记录成功');
      setModalVisible(false);
      fetchSales();
    } catch (error) {
      if (error.response?.data) {
        message.error(Object.values(error.response.data).join('\n'));
      } else {
        message.error('操作失败');
      }
      console.error('Error submitting sale:', error);
    }
  };

  const columns = [
    {
      title: '销售日期',
      dataIndex: 'sale_date',
      key: 'sale_date',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: '客户名称',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: '销售金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Title level={4}>销售管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加销售记录
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={sales}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title="添加销售记录"
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="sale_date"
              label="销售日期"
              rules={[{ required: true, message: '请选择销售日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="customer_name"
              label="客户名称"
              rules={[
                { required: true, message: '请输入客户名称' },
                { max: 100, message: '客户名称不能超过100个字符' },
              ]}
            >
              <Input placeholder="请输入客户名称" />
            </Form.Item>

            <Form.Item
              name="amount"
              label="销售金额"
              rules={[
                { required: true, message: '请输入销售金额' },
                { type: 'number', min: 0, message: '销售金额必须大于0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入销售金额"
                precision={2}
                prefix="¥"
              />
            </Form.Item>

            <Form.Item
              name="payment_method"
              label="支付方式"
              rules={[{ required: true, message: '请选择支付方式' }]}
            >
              <Input placeholder="请输入支付方式" />
            </Form.Item>

            <Form.Item
              name="notes"
              label="备注"
              rules={[{ max: 500, message: '备注不能超过500个字符' }]}
            >
              <TextArea
                placeholder="请输入备注"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default SaleManagement; 