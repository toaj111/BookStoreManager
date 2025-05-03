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
  Select,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FinancialManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/financials/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTransactions(response.data.results || response.data);
    } catch (error) {
      message.error('获取财务记录失败');
      console.error('Error fetching transactions:', error);
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
      values.transaction_date = values.transaction_date.format('YYYY-MM-DD');
      
      await axios.post(`${API_BASE_URL}/financials/`, values, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('添加财务记录成功');
      setModalVisible(false);
      fetchTransactions();
    } catch (error) {
      if (error.response?.data) {
        message.error(Object.values(error.response.data).join('\n'));
      } else {
        message.error('操作失败');
      }
      console.error('Error submitting transaction:', error);
    }
  };

  const columns = [
    {
      title: '交易日期',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: '交易类型',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '交易对象',
      dataIndex: 'counterparty',
      key: 'counterparty',
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
          <Title level={4}>财务管理</Title>
          {/* <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加财务记录
          </Button> */}
        </div>

        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title="添加财务记录"
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
              name="transaction_date"
              label="交易日期"
              rules={[{ required: true, message: '请选择交易日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="transaction_type"
              label="交易类型"
              rules={[{ required: true, message: '请选择交易类型' }]}
            >
              <Select placeholder="请选择交易类型">
                <Option value="income">收入</Option>
                <Option value="expense">支出</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="金额"
              rules={[
                { required: true, message: '请输入金额' },
                { type: 'number', min: 0, message: '金额必须大于0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入金额"
                precision={2}
                prefix="¥"
              />
            </Form.Item>

            <Form.Item
              name="counterparty"
              label="交易对象"
              rules={[
                { required: true, message: '请输入交易对象' },
                { max: 100, message: '交易对象不能超过100个字符' },
              ]}
            >
              <Input placeholder="请输入交易对象" />
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

export default FinancialManagement; 