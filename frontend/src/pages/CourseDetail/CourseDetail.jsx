import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { 
  Box, Container, Accordion, AccordionSummary, AccordionDetails, 
  Rating, Button, Grid, Typography, Divider, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, FormControl, CircularProgress,
  Tabs, Tab, TextField
} from '@mui/material';
import { 
  ExpandMore, PlayCircleOutline, Star, 
  Update, Lock, ReceiptLong, AccountBalance, School,
  Description, RateReview, QuestionAnswer, Send
} from '@mui/icons-material';

// --- CẤU HÌNH API URL ---
const API_BASE_URL = 'http://localhost:3000'; 

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDuration = (seconds) => {
  if (!seconds) return "0p";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
};

// --- SERVICE GỌI API ---
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

// --- COMPONENT CHÍNH ---
const CourseDetailPage = () => {
  const { slug } = useParams(); 
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State Tabs & Data phụ
  const [activeTab, setActiveTab] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});

  // State Modal
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchCourseDetail = async () => {
        try {
            const response = await api.get(`/api/course/slug/${slug}`);
            if (response.data && response.data.success) {
                setCourse(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi lấy chi tiết khóa học:", error);
        } finally {
            setLoading(false);
        }
    };
    if (slug) fetchCourseDetail();
  }, [slug]);

  // --- TAB CHANGE ---
  const handleTabChange = async (event, newValue) => {
      setActiveTab(newValue);
      if (!course) return;

      if (newValue === 1 && reviews.length === 0) {
          try {
              const res = await api.get(`/api/course/${course.id}/reviews`);
              if(res.data.success) setReviews(res.data.data);
          } catch (e) { console.error("Lỗi lấy reviews", e); }
      }
      if (newValue === 2 && discussions.length === 0) {
          try {
              const res = await api.get(`/api/course/${course.id}/discussions`);
              if(res.data.success) setDiscussions(res.data.data);
          } catch (e) { console.error("Lỗi lấy discussions", e); }
      }
  };

  const handleExpandAll = () => {
    if (!course?.modules) return;
    const allExpanded = {};
    course.modules.forEach((mod, index) => { allExpanded[index] = true; });
    setExpandedModules(allExpanded);
  };

  // --- THANH TOÁN ---
  const handleProceedPayment = async () => {
    setIsProcessing(true);
    try {
        const response = await api.post(`/api/payment/courses/${course.id}/payments`, {
            bankCode: "NCB",
            locale: "vn"
        });

        if (response.data && response.data.success) {
            window.location.href = response.data.data.paymentUrl; 
        }
    } catch (error) {
        alert(`Lỗi thanh toán: ${error.response?.data?.message || "Không xác định"}`);
        setIsProcessing(false);
    }
  };

  // --- RENDER ---
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!course) return <Container sx={{ mt: 10, textAlign: 'center' }}><Typography variant="h5">Không tìm thấy khóa học</Typography></Container>;

  const { title, description, priceVND, image, updatedAt, enrollmentCount, totalLessons, totalDuration, averageRating, instructor, modules } = course;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
      
      {/* ===================================================================== */}
      {/* HERO SECTION (BACKGROUND IMAGE) */}
      {/* ===================================================================== */}
      <Box sx={{ position: 'relative', color: 'white', py: 10, overflow: 'hidden', minHeight: '400px', display: 'flex', alignItems: 'center' }}>
        <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.3) blur(4px)',
            transform: 'scale(1.1)',
            zIndex: 0
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {/* INFO */}
            <Grid item xs={12} md={7}>
              <Typography variant="h3" fontWeight="bold" mb={2} sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {title}
              </Typography>
              <Typography variant="body1" mb={3} sx={{ color: '#e0e0e0', fontSize: '1.1rem', lineHeight: 1.6 }}>
                  {description}
              </Typography>
              
              <Box display="flex" gap={3} alignItems="center" mb={3} flexWrap="wrap">
                <Box display="flex" alignItems="center" color="#f3ca8c" fontWeight="bold">
                  <span style={{ marginRight: 4, fontSize: '1.2rem' }}>{averageRating || 0}</span> <Star />
                </Box>
                <Typography sx={{ color: '#fff', opacity: 0.9 }}>
                    <i className="fa-solid fa-user-group" style={{ marginRight: 8 }}></i>
                    {(enrollmentCount || 0).toLocaleString()} học viên
                </Typography>
                <Typography sx={{ color: '#fff', opacity: 0.9 }}>
                    <Update sx={{ fontSize: 16, mr: 0.5, mb: 0.3 }} />
                    Cập nhật: {new Date(updatedAt).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>

              <Box display="flex" gap={1.5} alignItems="center">
                <Avatar src={instructor?.profileImageUrl} sx={{ width: 40, height: 40, border: '2px solid white' }} />
                <Box>
                    <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>Giảng viên</Typography>
                    <Typography variant="body2" fontWeight="bold">{instructor?.lastName} {instructor?.firstName}</Typography>
                </Box>
              </Box>
            </Grid>

            {/* BUTTON & PRICE */}
            <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'left', md: 'center' }, mt: { xs: 4, md: 0 } }}>
                <Typography variant="h2" fontWeight="800" sx={{ color: '#fff', mb: 1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    {formatCurrency(priceVND)}
                </Typography>
                
                <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => setOpenPaymentModal(true)} 
                    sx={{ 
                        bgcolor: '#a435f0', color: 'white', fontWeight: 'bold', 
                        py: 2, px: 6, fontSize: '1.2rem', borderRadius: '50px',
                        boxShadow: '0 0 30px rgba(164, 53, 240, 0.6)',
                        '&:hover': { bgcolor: '#8710d8', transform: 'scale(1.05)' },
                        transition: 'all 0.3s ease'
                    }}
                >
                    Đăng ký học ngay
                </Button>
                
                <Typography variant="body2" sx={{ mt: 2, color: '#ddd', fontStyle: 'italic' }}>
                    Truy cập trọn đời • Hoàn tiền trong 7 ngày
                </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* TABS */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered variant="fullWidth">
            <Tab icon={<Description />} iconPosition="start" label="Nội dung" />
            <Tab icon={<RateReview />} iconPosition="start" label="Đánh giá" />
            <Tab icon={<QuestionAnswer />} iconPosition="start" label="Thảo luận" />
          </Tabs>
        </Box>

        {/* TAB 0: NỘI DUNG (KHÔNG FAKE DATA) */}
        <div hidden={activeTab !== 0}>
            {activeTab === 0 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Chương trình học</Typography>
                        <Box>
                            <Typography variant="body2" component="span" sx={{ mr: 2, fontWeight: 'bold' }}>
                                {modules?.length || 0} chương • {totalLessons || 0} bài học • {formatDuration(totalDuration || 0)}
                            </Typography>
                            <Button size="small" onClick={handleExpandAll} sx={{ fontWeight: 'bold' }}>Mở rộng tất cả</Button>
                        </Box>
                    </Box>
                    
                    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                        {modules && modules.length > 0 ? modules.map((mod, idx) => (
                            <Accordion key={idx} expanded={expandedModules[idx]} onChange={(e, x) => setExpandedModules({...expandedModules, [idx]: x})}>
                                <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f7f9fa' }}>
                                    <Typography fontWeight={600}>{mod.title}</Typography>
                                    <Typography sx={{ ml: 'auto', fontSize: '13px', color: 'text.secondary' }}>{mod.lessonCount} bài</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {/* CHỈ RENDER NẾU CÓ DỮ LIỆU THẬT */}
                                    {mod.lessons && mod.lessons.length > 0 ? (
                                        mod.lessons.map(lesson => (
                                            <Box key={lesson.id} display="flex" gap={2} py={1.5} borderBottom="1px dashed #eee" color="text.secondary" alignItems="center">
                                                <PlayCircleOutline fontSize="small" /> 
                                                <Typography variant="body2">{lesson.title}</Typography>
                                                {/* Nếu có trường isFree hoặc duration thì hiển thị, không thì thôi */}
                                                {lesson.isFree ? <Chip label="Học thử" size="small" color="success" variant="outlined" sx={{ ml: 'auto', height: 20 }} /> : <Lock fontSize="small" sx={{ ml: 'auto', opacity: 0.5 }}/>}
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography fontStyle="italic" color="text.secondary" align="center" py={1}>
                                            {mod.lessonCount > 0 
                                                ? "Nội dung bài học chỉ dành cho học viên đã đăng ký." 
                                                : "Chưa có bài học nào trong chương này."}
                                        </Typography>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        )) : <Box p={3} textAlign="center">Chưa có nội dung chương trình.</Box>}
                    </Box>
                </Box>
            )}
        </div>

        {/* TAB 1: ĐÁNH GIÁ */}
        <div hidden={activeTab !== 1}>
            {activeTab === 1 && (
                <Box>
                    <Typography variant="h6" mb={3}>Đánh giá từ học viên</Typography>
                    <Grid container spacing={2}>
                        {reviews.length > 0 ? reviews.map((rev) => (
                            <Grid item xs={12} key={rev.id}>
                                <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                                    <Box display="flex" gap={2}>
                                        <Avatar src={rev.user?.profileImageUrl}>{rev.user?.firstName?.[0]}</Avatar>
                                        <Box>
                                            <Typography fontWeight="bold">{rev.user?.lastName} {rev.user?.firstName}</Typography>
                                            <Rating value={rev.rating} readOnly size="small" />
                                        </Box>
                                    </Box>
                                    <Typography mt={1} variant="body2">{rev.comment}</Typography>
                                </Box>
                            </Grid>
                        )) : <Typography fontStyle="italic" color="text.secondary">Chưa có đánh giá nào.</Typography>}
                    </Grid>
                </Box>
            )}
        </div>

        {/* TAB 2: THẢO LUẬN */}
        <div hidden={activeTab !== 2}>
            {activeTab === 2 && (
                <Box>
                    <Box mb={4} p={3} bgcolor="#f8f9fa" borderRadius={2}>
                        <Typography variant="h6" mb={2}>Đặt câu hỏi</Typography>
                        <TextField fullWidth multiline rows={3} placeholder="Bạn thắc mắc gì?" variant="outlined" sx={{ bgcolor: 'white' }} />
                        <Button variant="contained" endIcon={<Send />} sx={{ mt: 2, bgcolor: '#1c1d1f' }}>Gửi câu hỏi</Button>
                    </Box>
                    {discussions.length > 0 ? discussions.map((disc) => (
                        <Box key={disc.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                            <Typography fontWeight="bold" color="primary">{disc.title || "Thảo luận"}</Typography>
                            <Typography variant="body2" mt={1}>{disc.content}</Typography>
                            <Typography variant="caption" color="text.secondary" mt={1} display="block">
                                Đăng bởi: {disc.user?.username} • {disc.replies?.length || 0} trả lời
                            </Typography>
                        </Box>
                    )) : <Typography fontStyle="italic" color="text.secondary">Chưa có thảo luận nào.</Typography>}
                </Box>
            )}
        </div>

      </Container>

      {/* MODAL THANH TOÁN */}
      <Dialog open={openPaymentModal} onClose={() => !isProcessing && setOpenPaymentModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptLong color="primary" /> Xác nhận đơn hàng
        </DialogTitle>
        <DialogContent dividers>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="text.secondary">Giá khóa học:</Typography>
                <Typography fontWeight="bold">{formatCurrency(priceVND)}</Typography>
            </Box>
            <Typography fontWeight="bold" mb={1}>Chọn phương thức:</Typography>
            <FormControl fullWidth>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <Box border="1px solid #ddd" borderRadius={2} p={1} mb={1}>
                        <FormControlLabel value="vnpay" control={<Radio />} label="Ví VNPay / Ngân hàng" />
                    </Box>
                </RadioGroup>
            </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
            <Button onClick={() => setOpenPaymentModal(false)} color="inherit" disabled={isProcessing}>Hủy</Button>
            <Button variant="contained" onClick={handleProceedPayment} disabled={isProcessing} startIcon={isProcessing && <CircularProgress size={20} color="inherit"/>} sx={{ bgcolor: '#a435f0' }}>
                Thanh toán {formatCurrency(priceVND)}
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetailPage;