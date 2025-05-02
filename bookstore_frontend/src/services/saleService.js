import api from './api';

export const saleService = {
    // 获取所有销售记录
    getAllSales: async () => {
        const response = await api.get('/sales/');
        return response.data;
    },

    // 获取单条销售记录
    getSale: async (id) => {
        const response = await api.get(`/sales/${id}/`);
        return response.data;
    },

    // 创建销售记录
    createSale: async (saleData) => {
        const response = await api.post('/sales/', saleData);
        return response.data;
    },

    // 处理退货
    processReturn: async (id) => {
        const response = await api.post(`/sales/${id}/process_return/`);
        return response.data;
    }
}; 