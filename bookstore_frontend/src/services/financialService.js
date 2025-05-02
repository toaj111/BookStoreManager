import api from './api';

export const financialService = {
    // 获取所有财务记录
    getAllTransactions: async () => {
        const response = await api.get('/financial/');
        return response.data;
    },

    // 获取单条财务记录
    getTransaction: async (id) => {
        const response = await api.get(`/financial/${id}/`);
        return response.data;
    },

    // 获取财务统计信息
    getSummary: async () => {
        const response = await api.get('/financial/summary/');
        return response.data;
    }
}; 