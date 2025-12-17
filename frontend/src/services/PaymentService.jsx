import axios from './axiosConfig'; // Config axios của bạn (base URL, token...)

// 1. Tạo URL thanh toán (Gọi khi bấm nút Mua)
export const createPaymentUrl = async (courseId) => {
  try {
    const response = await axios.post(`/api/payment/courses/${courseId}/payments`);
    // Giả định response trả về có dạng { paymentUrl: 'https://sandbox.vnpayment.vn/...' }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 2. Xác thực thanh toán (Gọi khi VNPay redirect về)
export const verifyPayment = async (queryParams) => {
  try {
    // API: POST /api/payment/verify
    // queryParams là object chứa các tham số VNPay trả về (vnp_Amount, vnp_ResponseCode...)
    const response = await axios.post('/api/payment/verify', queryParams);
    return response.data;
  } catch (error) {
    throw error;
  }
};