import { api } from "./api";

export const paymentService = {
  payment: async (registrationId, idempotencyKey, amount) => {
    try {
      const response = await api.post('/api/payments', {
        registrationId,
        idempotencyKey,
        amount
      }, {});

      return response?.data;
    } catch (e) {
      console.log(e);
    }

  }
}