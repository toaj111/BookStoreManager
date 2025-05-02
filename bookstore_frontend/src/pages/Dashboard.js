import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { BookOutlined, ShoppingCartOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';

const Dashboard = () => {
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
              value={0}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
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