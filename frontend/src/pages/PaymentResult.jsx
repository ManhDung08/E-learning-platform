import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Nhớ import axios
import { Box, Container, Typography, Button, Paper, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Các trạng thái: 'loading' | 'enrolling' | 'success' | 'failed' | 'enroll_failed'
  const [status, setStatus] = useState('loading'); 
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePaymentResult = async () => {
        // 1. Lấy tham số từ URL
        const searchParams = new URLSearchParams(location.search);
        const responseCode = searchParams.get('vnp_ResponseCode');

        // 2. Kiểm tra kết quả từ VNPAY
        if (responseCode !== '00') {
            setStatus('failed');
            setMessage('Giao dịch bị hủy hoặc lỗi tại cổng thanh toán.');
            return;
        }

        // 3. Nếu thanh toán OK -> Tiến hành Enroll (Thêm vào khóa học)
        setStatus('enrolling'); // Chuyển trạng thái sang đang đăng ký

        // Lấy ID khóa học đã lưu ở localStorage trước khi đi thanh toán
        const courseId = localStorage.getItem('pendingCourseId');

        if (!courseId) {
            setStatus('success'); // Vẫn báo success tiền nong, nhưng cảnh báo
            setMessage('Thanh toán thành công nhưng không tìm thấy ID khóa học để kích hoạt tự động. Vui lòng liên hệ Admin.');
            return;
        }

        try {
           
            await axios.post(
                `http://localhost:3000/api/course/${courseId}/enrollments`, 
                {}, 
                { withCredentials: true }
            );

            
            setStatus('success');
          
            localStorage.removeItem('pendingCourseId'); 

        } catch (error) {
            console.error(error);
            
            setStatus('enroll_failed'); 
            setMessage('lỗi kích hoạt khóa học. Hãy liên hệ hỗ trợ ngay.');
        }
    };

    handlePaymentResult();
  }, [location.search]);

  // --- GIAO DIỆN ---

  // 1. Loading hoặc đang Enroll
  if (status === 'loading' || status === 'enrolling') {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60vh">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
              {status === 'enrolling' ? 'Đang kích hoạt khóa học...' : 'Đang xử lý kết quả...'}
          </Typography>
        </Box>
    );
  }

  // 2. Màn hình Kết quả
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
        
        {/* TRƯỜNG HỢP: THÀNH CÔNG TOÀN DIỆN */}
        {status === 'success' && (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom fontWeight="bold">
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              {message || 'Khóa học đã được kích hoạt. Bạn có thể vào học ngay.'}
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

        {/* TRƯỜNG HỢP: TIỀN ĐÃ TRỪ NHƯNG ENROLL LỖI */}
        {status === 'enroll_failed' && (
             <>
             <ErrorIcon color="warning" sx={{ fontSize: 80, mb: 2 }} />
             <Typography variant="h4" color="warning.main" gutterBottom fontWeight="bold">
               Cần hỗ trợ!
             </Typography>
             <Typography variant="body1" color="text.secondary" paragraph>
               {message}
             </Typography>
             <Button variant="contained" onClick={() => window.location.reload()}>
                Thử lại (Nếu lỗi mạng)
             </Button>
           </>
        )}

        {/* TRƯỜNG HỢP: THANH TOÁN THẤT BẠI */}
        {status === 'failed' && (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="error.main" gutterBottom fontWeight="bold">
              Giao dịch thất bại
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {message}
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