import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Select, InputNumber, message } from 'antd';
import { saleService } from '../services/saleService';
import { bookService } from '../services/bookService';
import ErrorMessage from './ErrorMessage';

const SaleList = () => {
    const [sales, setSales] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchSales = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await saleService.getAllSales();
            setSales(data);
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
        fetchSales();
        fetchBooks();
    }, []);

    const handleAdd = () => {
        form.resetFields();
        setModalVisible(true);
    };

    const handleReturn = async (id) => {
        try {
            await saleService.processReturn(id);
            message.success('退货成功');
            fetchSales();
        } catch (err) {
            setError(err);
        }
    };

    const handleSubmit = async (values) => {
        try {
            await saleService.createSale(values);
            message.success('创建成功');
            setModalVisible(false);
            fetchSales();
        } catch (err) {
            setError(err);
        }
    };

    const columns = [
        {
            title: '销售单号',
            dataIndex: 'sale_number',
            key: 'sale_number',
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
            render: (status) => status === 'completed' ? '已完成' : '已退货',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status === 'completed' && (
                        <Button type="link" onClick={() => handleReturn(record.id)}>
                            退货
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
                    创建销售记录
                </Button>
            </div>

            <ErrorMessage error={error} />

            <Table
                columns={columns}
                dataSource={sales}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title="创建销售记录"
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
                                    {book.title} (库存: {book.stock_quantity})
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

export default SaleList; 