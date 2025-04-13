import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { BookOutlined, ShoppingCartOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';

const Dashboard = () => {
  return (
    <div>
      <h2>系统概览</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="图书总数"
              value={123}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日销售额"
              value={2802}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理订单"
              value={14}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户数量"
              value={25}
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