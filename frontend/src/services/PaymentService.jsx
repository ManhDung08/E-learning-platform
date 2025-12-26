import api from '../Redux/api';

export const createPaymentUrl = async (courseId, bankCode = "") => {
    try {
        const response = await api.post(`/payment/courses/${courseId}/payments`, {
            bankCode: bankCode, 
            locale: "vn"
        });
        
        if (response.data && response.data.success) {
            return response.data.data.paymentUrl; 
        } else {
            throw new Error(response.data.message || "Failed to retrieve payment link");
        }
    } catch (error) {
        console.error("Error creating payment:", error);
        throw error;
    }
};

export const verifyPayment = async (params) => {
    return api.post('/payment/verify', params);
};