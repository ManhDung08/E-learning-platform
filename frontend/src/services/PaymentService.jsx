import axios from 'axios'; 

const API_URL = 'http://localhost:8080'; 

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
}

export const createPaymentUrl = async (courseId) => {
  // Phải tự ghép URL và tự thêm header
  const response = await axios.post(
      `${API_URL}/api/payment/courses/${courseId}/payments`, 
      {}, // body rỗng
      getHeaders() // Header chứa token
  );
  return response.data;
};

export const verifyPayment = async (queryParams) => {
  const response = await axios.post(
      `${API_URL}/api/payment/verify`, 
      queryParams,
      getHeaders()
  );
  return response.data;
};

