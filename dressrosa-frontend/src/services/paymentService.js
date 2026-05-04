import api from './api';

export const paymentService = {
  /**
   * Create a payment intent for a BANK_CARD order
   */
  createPaymentIntent: async (orderId) => {
    const response = await api.post('/payments/create-intent', { orderId });
    return response.data;
  },

  /**
   * Confirm a completed payment by transactionId
   */
  confirmPayment: async (transactionId) => {
    const response = await api.post(`/payments/confirm?transactionId=${transactionId}`);
    return response.data;
  },

  /**
   * Get payment details for an order
   */
  getPaymentByOrder: async (orderId) => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },
};
