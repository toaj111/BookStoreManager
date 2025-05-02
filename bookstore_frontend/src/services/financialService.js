import api from './api';

export const financialService = {
    // 获取所有财务记录
    getAllTransactions: async () => {
        const response = await api.get('/financials/');
        return response.data;
    },

    // 获取单条财务记录
    getTransaction: async (id) => {
        const response = await api.get(`/financials/${id}/`);
        return response.data;
    },

    // 获取财务统计信息
    getSummary: async () => {
        const response = await api.get('/financials/summary/');
        return response.data;
    }
}; 