import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, CircularProgress, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { verifyPayment } from '../../services/paymentService';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      // 1. Lấy query params từ URL (vnp_Amount, vnp_ResponseCode,...)
      const searchParams = new URLSearchParams(location.search);
      const params = Object.fromEntries(searchParams.entries());

      // Nếu không có params thì không phải redirect từ VNPay
      if (Object.keys(params).length === 0) {
        setStatus('failed');
        setMessage('Không tìm thấy thông tin giao dịch.');
        return;
      }

      try {
        // 2. Gọi API POST /api/payment/verify để check với Backend
        await verifyPayment(params);
        
        // Nếu API không ném lỗi -> Thành công
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('failed');
        // Backend có thể trả về message lỗi cụ thể
        setMessage(error.response?.data?.message || 'Giao dịch thất bại hoặc lỗi xác thực.');
      }
    };

    verify();
  }, [location.search]);

  // Giao diện Loading
  if (status === 'loading') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang xác thực giao dịch...</Typography>
      </Box>
    );
  }

  // Giao diện Thành công/Thất bại
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
        {status === 'success' ? (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom fontWeight="bold">
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" paragraph>
              Cảm ơn bạn đã mua khóa học. Bạn có thể bắt đầu học ngay bây giờ.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/my-courses')} // Điều hướng về trang khóa học của tôi
              sx={{ mt: 2 }}
            >
              Vào khóa học ngay
            </Button>
          </>
        ) : (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="error.main" gutterBottom fontWeight="bold">
              Thanh toán thất bại
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {message || "Có lỗi xảy ra trong quá trình xử lý giao dịch."}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={() => navigate('/')}>
                    Về trang chủ
                </Button>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Thử lại
                </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentResult;