import api from './api';

export const purchaseService = {
    // 获取所有进货订单
    getAllOrders: async () => {
        const response = await api.get('/purchases/');
        return response.data;
    },

    // 获取单个进货订单
    getOrder: async (id) => {
        const response = await api.get(`/purchases/${id}/`);
        return response.data;
    },

    // 创建进货订单
    createOrder: async (orderData) => {
        const response = await api.post('/purchases/', orderData);
        return response.data;
    },

    // 支付进货订单
    payOrder: async (id) => {
        const response = await api.post(`/purchases/${id}/pay/`);
        return response.data;
    }
}; 