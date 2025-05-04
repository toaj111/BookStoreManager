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
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import { PlusOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FinancialManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
    transaction_count: 0
  });

  useEffect(() => {
    fetchRecords();
    fetchSummary();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      console.log('Fetching records from:', `${API_BASE_URL}/financials/financials/`);
      const response = await axios.get(`${API_BASE_URL}/financials/financials/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Financial records response:', response.data);
      if (!Array.isArray(response.data)) {
        console.warn('Response data is not an array:', response.data);
      }
      setRecords(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching financial records:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      message.error('获取财务记录失败');
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      console.log('Fetching summary from:', `${API_BASE_URL}/financials/financials/summary/`);
      const response = await axios.get(`${API_BASE_URL}/financials/financials/summary/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Summary response:', response.data);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
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
      fetchRecords();
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type === 'income' ? '收入' : '支出'}
        </Tag>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const categoryMap = {
          'sale': '销售',
          'purchase': '采购',
          'salary': '工资',
          'rent': '租金',
          'utility': '水电',
          'other': '其他'
        };
        return categoryMap[category] || category;
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      render: (operator) => operator?.username,
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
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={statistics.total_income}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总支出"
              value={statistics.total_expense}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="净余额"
              value={statistics.net_balance}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
              valueStyle={{ color: statistics.net_balance >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="交易笔数"
              value={statistics.transaction_count}
            />
          </Card>
        </Col>
      </Row>

      <Card title="财务记录">
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
        />
      </Card>

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
    </div>
  );
};

export default FinancialManagement; 