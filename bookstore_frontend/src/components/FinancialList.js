import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Statistic } from 'antd';
import { financialService } from '../services/financialService';
import ErrorMessage from './ErrorMessage';

const FinancialList = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [transactionsData, summaryData] = await Promise.all([
                financialService.getAllTransactions(),
                financialService.getSummary()
            ]);
            setTransactions(transactionsData);
            setSummary(summaryData);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: '交易编号',
            dataIndex: 'transaction_number',
            key: 'transaction_number',
        },
        {
            title: '类型',
            dataIndex: 'transaction_type',
            key: 'transaction_type',
            render: (type) => type === 'income' ? '收入' : '支出',
        },
        {
            title: '金额',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `¥${amount}`,
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
            render: (date) => new Date(date).toLocaleString(),
        },
    ];

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="总收入"
                            value={summary?.total_income || 0}
                            precision={2}
                            prefix="¥"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="总支出"
                            value={summary?.total_expense || 0}
                            precision={2}
                            prefix="¥"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="净余额"
                            value={summary?.net_balance || 0}
                            precision={2}
                            prefix="¥"
                            valueStyle={{
                                color: (summary?.net_balance || 0) >= 0 ? '#3f8600' : '#cf1322',
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            <ErrorMessage error={error} />

            <Table
                columns={columns}
                dataSource={transactions}
                rowKey="id"
                loading={loading}
            />
        </div>
    );
};

export default FinancialList; 