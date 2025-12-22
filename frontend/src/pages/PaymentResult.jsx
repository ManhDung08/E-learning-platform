import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mặc định là 'loading' để chờ check URL
  const [status, setStatus] = useState(null); 

  useEffect(() => {
    // 1. Lấy tham số từ URL xuống
    const searchParams = new URLSearchParams(location.search);
    const responseCode = searchParams.get('vnp_ResponseCode'); // Mã trả về từ VNPAY

    // 2. Kiểm tra mã "vnp_ResponseCode"
    // '00' là thành công, tất cả mã khác là thất bại
    if (responseCode === '00') {
        setStatus('success');
    } else {
        setStatus('failed');
    }
    
  }, [location.search]);

  // --- GIAO DIỆN ---

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
        
        {/* TRƯỜNG HỢP 1: THÀNH CÔNG */}
        {status === 'success' && (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom fontWeight="bold">
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Cảm ơn bạn đã thanh toán. Khóa học đã sẵn sàng.
            </Typography>
            
            <Box mt={4}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/my-courses')} 
                  sx={{ borderRadius: 20, px: 4 }}
                >
                  Vào học ngay
                </Button>
            </Box>
          </>
        )}

        {/* TRƯỜNG HỢP 2: THẤT BẠI HOẶC KHÔNG CÓ MÃ */}
        {status === 'failed' && (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="error.main" gutterBottom fontWeight="bold">
              Giao dịch thất bại
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình thanh toán.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/')}>
                    Về trang chủ
                </Button>
                <Button variant="contained" color="primary" onClick={() => navigate(-2)}>
                    Thử thanh toán lại
                </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentResultPage;