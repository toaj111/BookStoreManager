import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { BookOutlined, ShoppingCartOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const [statistics, setStatistics] = useState({
    total_books: 0,
    total_orders: 0,
    net_balance: 0,
    total_users: 0
  })

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  const fetchFinancialSummary = async () => {
    try {
      console.log('Fetching summary from:', `${API_BASE_URL}/financials/financials/summary/`);
      const response = await axios.get(`${API_BASE_URL}/financials/financials/summary/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Summary response:', response.data);
      const updateNetBalance = () => {
        setStatistics(prevState => ({
          ...prevState,
          net_balance: response.data.net_balance
          }));
      };
      updateNetBalance();
    } catch (error) {
      console.error('Error fetching summary:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
    }
  };
  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总图书数"
              value={0}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总销售额"
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
              title="总用户数"
              value={0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="最近销售">
            <p>暂无数据</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="库存预警">
            <p>暂无数据</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 