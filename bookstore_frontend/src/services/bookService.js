import api from './api';

export const bookService = {
    // 获取所有图书
    getAllBooks: async () => {
        const response = await api.get('/books/');
        return response.data;
    },

    // 获取单本图书
    getBook: async (id) => {
        const response = await api.get(`/books/${id}/`);
        return response.data;
    },

    // 创建图书
    createBook: async (bookData) => {
        const response = await api.post('/books/', bookData);
        return response.data;
    },

    // 更新图书
    updateBook: async (id, bookData) => {
        const response = await api.put(`/books/${id}/`, bookData);
        return response.data;
    },

    // 删除图书
    deleteBook: async (id) => {
        const response = await api.delete(`/books/${id}/`);
        return response.data;
    },

    // 更新库存
    updateStock: async (id, quantity) => {
        const response = await api.post(`/books/${id}/update_stock/`, { quantity });
        return response.data;
    }
}; 