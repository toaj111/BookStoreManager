import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message } from 'antd';
import { bookService } from '../services/bookService';
import ErrorMessage from './ErrorMessage';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [form] = Form.useForm();

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await bookService.getAllBooks();
            setBooks(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleAdd = () => {
        setEditingBook(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingBook(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await bookService.deleteBook(id);
            message.success('删除成功');
            fetchBooks();
        } catch (err) {
            setError(err);
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingBook) {
                await bookService.updateBook(editingBook.id, values);
                message.success('更新成功');
            } else {
                await bookService.createBook(values);
                message.success('创建成功');
            }
            setModalVisible(false);
            fetchBooks();
        } catch (err) {
            setError(err);
        }
    };

    const columns = [
        {
            title: 'ISBN',
            dataIndex: 'isbn',
            key: 'isbn',
        },
        {
            title: '书名',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '作者',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: '出版社',
            dataIndex: 'publisher',
            key: 'publisher',
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `¥${price}`,
        },
        {
            title: '库存',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={handleAdd}>
                    添加图书
                </Button>
            </div>

            <ErrorMessage error={error} />

            <Table
                columns={columns}
                dataSource={books}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title={editingBook ? '编辑图书' : '添加图书'}
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
                        name="isbn"
                        label="ISBN"
                        rules={[{ required: true, message: '请输入ISBN' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="title"
                        label="书名"
                        rules={[{ required: true, message: '请输入书名' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="author"
                        label="作者"
                        rules={[{ required: true, message: '请输入作者' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="publisher"
                        label="出版社"
                        rules={[{ required: true, message: '请输入出版社' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="价格"
                        rules={[{ required: true, message: '请输入价格' }]}
                    >
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="stock_quantity"
                        label="库存"
                        rules={[{ required: true, message: '请输入库存' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingBook ? '更新' : '创建'}
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

export default BookList; 