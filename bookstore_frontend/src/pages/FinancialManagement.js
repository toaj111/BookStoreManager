import React, { useState } from 'react';
import { Table, Card, Row, Col, DatePicker, Statistic, Button, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;

const FinancialManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment()]);

  // 表格列定义
  const columns = [
    {
      title: '交易编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '交易类型',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (type) => {
        const typeMap = {
          purchase: '进货支出',
          sale: '销售收入',
          refund: '退货退款',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => {
        const isIncome = record.transaction_type === 'sale';
        return (
          <span style={{ color: isIncome ? '#52c41a' : '#f5222d' }}>
            {isIncome ? '+' : '-'}¥{Math.abs(amount).toFixed(2)}
          </span>
        );
      },
    },
    {
      title: '关联订单',
      dataIndex: 'reference_id',
      key: 'reference_id',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
        <Button type="link" onClick={() => handleViewDetails(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  // 处理日期范围变化
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    // TODO: 根据日期范围获取数据
  };

  // 处理查看详情
  const handleViewDetails = (record) => {
    // TODO: 实现查看详情功能
  };

  // 导出报表
  const handleExport = () => {
    // TODO: 实现导出功能
  };

  // 计算统计数据
  const statistics = {
    totalIncome: 15000,
    totalExpense: 10000,
    netIncome: 5000,
    transactionCount: 50,
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={statistics.totalIncome}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总支出"
              value={statistics.totalExpense}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
              suffix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="净收入"
              value={statistics.netIncome}
              precision={2}
              prefix="¥"
              valueStyle={{ color: statistics.netIncome >= 0 ? '#3f8600' : '#cf1322' }}
              suffix={statistics.netIncome >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="交易笔数"
              value={statistics.transactionCount}
              suffix="笔"
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ marginRight: 16 }}
            />
            <Button type="primary" onClick={handleExport}>
              导出报表
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          pagination={{
            total: transactions.length,
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default FinancialManagement; 