import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Select, InputNumber, message } from 'antd';
import { purchaseService } from '../services/purchaseService';
import { bookService } from '../services/bookService';
import ErrorMessage from './ErrorMessage';

const PurchaseList = () => {
    const [purchases, setPurchases] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await purchaseService.getAllOrders();
            setPurchases(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const data = await bookService.getAllBooks();
            setBooks(data);
        } catch (err) {
            setError(err);
        }
    };

    useEffect(() => {
        fetchPurchases();
        fetchBooks();
    }, []);

    const handleAdd = () => {
        form.resetFields();
        setModalVisible(true);
    };

    const handlePay = async (id) => {
        try {
            await purchaseService.payOrder(id);
            message.success('支付成功');
            fetchPurchases();
        } catch (err) {
            setError(err);
        }
    };

    const handleSubmit = async (values) => {
        try {
            await purchaseService.createOrder(values);
            message.success('创建成功');
            setModalVisible(false);
            fetchPurchases();
        } catch (err) {
            setError(err);
        }
    };

    const columns = [
        {
            title: '订单编号',
            dataIndex: 'order_number',
            key: 'order_number',
        },
        {
            title: '图书',
            dataIndex: 'book_title',
            key: 'book_title',
        },
        {
            title: '数量',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: '单价',
            dataIndex: 'unit_price',
            key: 'unit_price',
            render: (price) => `¥${price}`,
        },
        {
            title: '总金额',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => `¥${amount}`,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => status === 'paid' ? '已支付' : '待付款',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status === 'pending' && (
                        <Button type="link" onClick={() => handlePay(record.id)}>
                            支付
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={handleAdd}>
                    创建进货订单
                </Button>
            </div>

            <ErrorMessage error={error} />

            <Table
                columns={columns}
                dataSource={purchases}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title="创建进货订单"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="book"
                        label="图书"
                        rules={[{ required: true, message: '请选择图书' }]}
                    >
                        <Select>
                            {books.map(book => (
                                <Select.Option key={book.id} value={book.id}>
                                    {book.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="quantity"
                        label="数量"
                        rules={[{ required: true, message: '请输入数量' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="unit_price"
                        label="单价"
                        rules={[{ required: true, message: '请输入单价' }]}
                    >
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                创建
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                取消
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PurchaseList; 