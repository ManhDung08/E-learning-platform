import axios from 'axios'; // Hoặc import instance axios đã cấu hình của bạn

// API 1: Tạo link thanh toán VNPay
export const createPaymentUrl = async (courseId, bankCode = "") => {
    try {
        // Gọi đúng đường dẫn API bạn cung cấp
        const response = await axios.post(`/api/payment/courses/${courseId}/payments`, {
            bankCode: bankCode, // Nếu để rỗng, sang VNPay user sẽ tự chọn ngân hàng
            locale: "vn"
        });

        // QUAN TRỌNG: Dựa vào hình ảnh Response, link nằm trong data.data.paymentUrl
        // (Axios bọc 1 lớp 'data', Backend trả về 1 lớp 'data' nữa)
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

// API 2: Verify (Dùng ở trang PaymentResult)
export const verifyPayment = async (params) => {
    return axios.post('/api/payment/verify', params);
};