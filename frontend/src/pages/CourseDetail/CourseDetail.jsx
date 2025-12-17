import React, { useState } from 'react';
import { 
  Box, Card, CardContent, CardMedia, Typography, Button, 
  Container, Divider, CircularProgress, Alert 
} from '@mui/material';


const CourseDetailPage = ({ course }) => {
  // Giả sử 'course' được truyền vào qua props hoặc lấy từ Redux store/API detail
  // Dữ liệu mẫu nếu chưa có API course detail
  const mockCourse = course || {
    id: 1,
    title: "ReactJS Advanced & Redux Toolkit",
    instructor: { firstName: "Nguyen", lastName: "Van A" },
    priceVND: 500000,
    image: "https://via.placeholder.com/300x200"
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Gọi API lấy link thanh toán
      const data = await createPaymentUrl(mockCourse.id);
      
      // 2. Redirect người dùng sang trang của VNPay
      if (data && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError("Không nhận được đường dẫn thanh toán từ hệ thống.");
      }
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi khởi tạo thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Xác nhận thanh toán
      </Typography>

      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardMedia
          component="img"
          height="200"
          image={mockCourse.image}
          alt={mockCourse.title}
        />
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {mockCourse.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Giảng viên: {mockCourse.instructor.lastName} {mockCourse.instructor.firstName}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Tổng cộng:</Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(mockCourse.priceVND)}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button
            variant="contained"
            color="success"
            size="large"
            fullWidth
            sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Thanh toán qua VNPay"}
          </Button>
          
          <Typography variant="caption" display="block" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
            Bạn sẽ được chuyển hướng đến cổng thanh toán an toàn của VNPay.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CourseDetailPage;