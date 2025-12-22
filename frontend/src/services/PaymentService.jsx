import axios from 'axios'; // Hoặc import instance axios đã cấu hình của bạn


export const createPaymentUrl = async (courseId, bankCode = "") => {
    try {
        // Gọi đúng đường dẫn API bạn cung cấp
        const response = await axios.post(`/api/payment/courses/${courseId}/payments`, {
            bankCode: bankCode, 
            locale: "vn"
        });

        
        if (response.data && response.data.success) {
            return response.data.data.paymentUrl; 
        } else {
            throw new Error(response.data.message || "Không lấy được link thanh toán");
        }
    } catch (error) {
        console.error("Lỗi tạo thanh toán:", error);
        throw error;
    }
};


export const verifyPayment = async (params) => {
    return axios.post('/api/payment/verify', params);
};