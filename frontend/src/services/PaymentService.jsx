import axios from 'axios'; // Or import your configured axios instance

export const createPaymentUrl = async (courseId, bankCode = "") => {
    try {
        // Call the correct API endpoint
        const response = await axios.post(`/api/payment/courses/${courseId}/payments`, {
            bankCode: bankCode, 
            locale: "vn" // You can change this to "en" if your payment gateway supports English interface
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
    return axios.post('/api/payment/verify', params);
};