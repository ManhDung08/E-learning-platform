import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Container, Accordion, AccordionSummary, AccordionDetails, 
  Rating, Button, Grid, Typography, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, FormControl, CircularProgress,
  Tabs, Tab, TextField, IconButton, Tooltip, Snackbar, Alert, LinearProgress, Pagination, Stack
} from '@mui/material';
import { 
  ExpandMore, PlayCircleOutline, Star, Update, Lock, ReceiptLong, 
  Description, RateReview, QuestionAnswer, Send,
  Edit as EditIcon, Delete as DeleteIcon, Cancel as CancelIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { getUserEnrollmentsAction } from '../../Redux/Course/course.action';

const API_BASE_URL = 'http://localhost:3000'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
const formatDuration = (seconds) => {
  if (!seconds) return "0p";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
};

const CourseDetailPage = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- STATE DATA ---
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useSelector(store => store.auth);
  const { userEnrollments } = useSelector(store => store.course);
  
  // --- STATE UI ---
  const [activeTab, setActiveTab] = useState(0);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- STATE REVIEWS ---
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [reviewRating, setReviewRating] = useState(5); 
  const [reviewComment, setReviewComment] = useState(''); 
  const [editingReviewId, setEditingReviewId] = useState(null); 

  // --- STATE DISCUSSIONS ---
  const [discussions, setDiscussions] = useState([]);
  const [discPage, setDiscPage] = useState(1);
  const [totalDiscPages, setTotalDiscPages] = useState(1);
  const [discContent, setDiscContent] = useState(''); 
  const [editingDiscId, setEditingDiscId] = useState(null); // Dùng chung cho cả Discussion và Reply
  const [replyingToId, setReplyingToId] = useState(null); 
  const [replyInputContent, setReplyInputContent] = useState(''); 

  const isEnrolled = useMemo(() => {
    if (!course || !userEnrollments) return false;
    return userEnrollments.some(e => e.course && String(e.course.id) === String(course.id));
  }, [course, userEnrollments]);

  const calculatedRating = useMemo(() => {
      if (!reviews || reviews.length === 0) return 0;
      const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      return (total / reviews.length).toFixed(1);
  }, [reviews]);

  useEffect(() => { 
        if(currentUser)
            dispatch(getUserEnrollmentsAction());
    }, [dispatch]);

  useEffect(() => {
    const fetchCourseDetail = async () => {
        try {
            const res = await api.get(`/api/course/slug/${slug}`);
            if (res.data?.success) setCourse(res.data.data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    if (slug) fetchCourseDetail();
  }, [slug]);

  // ============================================================
  // API FUNCTIONS (FETCH DATA)
  // ============================================================

  const fetchReviews = async (page = 1) => {
    if (!course) return;
    try {
        const res = await api.get(`/api/course/${course.id}/reviews`, {
            params: { page: page, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' } 
        });
        if(res.data.success && res.data.data) {
            setReviews(res.data.data.reviews || []);
            // Cập nhật thông tin phân trang từ API
            if (res.data.data.pagination) {
                setTotalReviewPages(res.data.data.pagination.totalPages);
            }
        }
    } catch (e) { console.error("Lỗi fetch review", e); }
  };

  const fetchDiscussions = async (page = 1) => {
    if (!course) return;
    try {
        const res = await api.get(`/api/course/${course.id}/discussions`, { 
            params: { page: page, limit: 10, sortOrder: 'desc' } 
        });
        if(res.data.success && res.data.data) {
            // Xử lý linh hoạt cấu trúc trả về
            const data = res.data.data;
            let list = [];
            let pagination = {};

            if (Array.isArray(data)) {
                list = data;
            } else {
                list = data.content || data.discussions || [];
                pagination = data.pagination || {};
            }
            
            setDiscussions(list);
            if (pagination.totalPages) {
                setTotalDiscPages(pagination.totalPages);
            } else if (data.totalPages) { // Trường hợp Spring Boot trả về trực tiếp
                setTotalDiscPages(data.totalPages);
            }
        }
    } catch (e) { console.error(e); }
  };

  // ============================================================
  // ACTION HANDLERS
  // ============================================================

  // --- REVIEW HANDLERS ---
  const handleSubmitReview = async () => {
      if (!reviewComment.trim()) return showSnackbar("Vui lòng nhập nội dung đánh giá", "warning");
      try {
          if (editingReviewId) {
              await api.put(`/api/course/${course.id}/reviews/${editingReviewId}`, {
                  rating: reviewRating,
                  comment: reviewComment
              });
              showSnackbar("Đã cập nhật đánh giá!");
          } else {
              await api.post(`/api/course/${course.id}/reviews`, {
                  rating: reviewRating,
                  comment: reviewComment
              });
              showSnackbar("Đã gửi đánh giá thành công!");
              setReviewPage(1); // Về trang 1 sau khi đăng mới
          }
          setEditingReviewId(null);
          setReviewComment('');
          setReviewRating(5);
          fetchReviews(editingReviewId ? reviewPage : 1); 
      } catch (error) {
          if (error.response?.status === 409) showSnackbar("Bạn đã đánh giá khóa học này rồi!", "error");
          else showSnackbar(error.response?.data?.message || "Lỗi khi gửi đánh giá.", "error");
      }
  };

  const handleDeleteReview = async (reviewId) => {
      if (!window.confirm("Xóa đánh giá này?")) return;
      try {
          await api.delete(`/api/course/${course.id}/reviews/${reviewId}`);
          showSnackbar("Đã xóa đánh giá.");
          fetchReviews(reviewPage); 
      } catch (error) { showSnackbar("Không thể xóa đánh giá này.", "error"); }
  };

  // --- DISCUSSION HANDLERS ---
  const handleSubmitDiscussion = async () => {
    if (!discContent.trim()) return showSnackbar("Vui lòng nhập nội dung!", "warning");
    try {
        if (editingDiscId) {
            // Sửa (Dùng chung cho cả Discussion và Reply)
            await api.put(`/api/course/${course.id}/discussions/${editingDiscId}`, { content: discContent });
            showSnackbar("Đã cập nhật!");
        } else {
            // Tạo mới Discussion
            await api.post(`/api/course/${course.id}/discussions`, { content: discContent });
            showSnackbar("Đã đăng thảo luận!");
            setDiscPage(1); // Về trang 1
        }
        setDiscContent('');
        setEditingDiscId(null);
        fetchDiscussions(editingDiscId ? discPage : 1); 
    } catch (error) { showSnackbar("Lỗi khi gửi nội dung.", "error"); }
  };

  const handleDeleteAny = async (id) => {
      if(!window.confirm("Xóa nội dung này?")) return;
      try {
          // API dùng chung để xóa Discussion hoặc Reply
          await api.delete(`/api/course/${course.id}/discussions/${id}`);
          showSnackbar("Đã xóa.");
          fetchDiscussions(discPage); 
      } catch (error) { showSnackbar("Không thể xóa.", "error"); }
  };

  const handleCreateReply = async (parentDiscId) => {
    if (!replyInputContent.trim()) return showSnackbar("Nhập nội dung trả lời!", "warning");
    try {
        await api.post(`/api/course/${course.id}/discussions/${parentDiscId}/reply`, { content: replyInputContent });
        showSnackbar("Đã gửi trả lời!");
        setReplyInputContent('');
        setReplyingToId(null);
        fetchDiscussions(discPage); // Refresh lại trang hiện tại
    } catch (error) { showSnackbar("Lỗi gửi trả lời.", "error"); }
  };

  // ============================================================
  // EFFECTS & HELPERS
  // ============================================================
  
  useEffect(() => {
    if (!course) return;
    if (activeTab === 1) fetchReviews(reviewPage);
  }, [activeTab, course, reviewPage]);

  useEffect(() => {
    if (!course) return;
    if (activeTab === 2) fetchDiscussions(discPage);
  }, [activeTab, course, discPage]);

  // UI Helpers
  const startEditReview = (review) => {
      setEditingReviewId(review.id);
      setReviewRating(review.rating);
      setReviewComment(review.comment);
      document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  const cancelEditReview = () => { setEditingReviewId(null); setReviewComment(''); setReviewRating(5); };
  
  // Dùng chung cho sửa Discussion và Reply
  const startEditingDisc = (id, currentContent) => {
      setEditingDiscId(id);
      setDiscContent(currentContent);
      document.getElementById('discussion-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleTabChange = (e, val) => setActiveTab(val);
  const handleEnrollClick = () => {
    if (isEnrolled) {
        navigate(`/my-course/course/learn/${course.id}`);
        return;
    }
    if (!currentUser) {
        showSnackbar("Bạn cần đăng nhập để đăng ký khóa học này!", "warning");
        
        return;
    }

    setOpenPaymentModal(true);
};
  
  const handleProceedPayment = async () => {
    setIsProcessing(true);
    try {
        const res = await api.post(`/api/payment/courses/${course.id}/payments`, { bankCode: "NCB", locale: "vn" });
        if (res.data?.success) window.location.href = res.data.data.paymentUrl; 
    } catch (error) { showSnackbar(`Lỗi thanh toán: ${error.response?.data?.message}`, "error"); setIsProcessing(false); }
  };
  
  const handleExpandAll = () => {
    const all = {}; course?.modules?.forEach((_, i) => { all[i] = true; }); setExpandedModules(all);
  };

  // --- RENDER ---
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!course) return <Container sx={{ mt: 10, textAlign: 'center' }}><Typography variant="h5">Không tìm thấy khóa học</Typography></Container>;

  const { title, description, priceVND, image, updatedAt, enrollmentCount, totalLessons, totalDuration, instructor, modules } = course;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
      {/* HEADER SECTION - Giữ nguyên */}
      <Box sx={{ position: 'relative', color: 'white', py: 10, overflow: 'hidden', minHeight: '400px', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3) blur(4px)', transform: 'scale(1.1)', zIndex: 0 }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" fontWeight="bold" mb={2} sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{title}</Typography>
              <Typography variant="body1" mb={3} sx={{ color: '#e0e0e0', fontSize: '1.1rem', lineHeight: 1.6 }}>{description}</Typography>
              <Box display="flex" gap={3} alignItems="center" mb={3} flexWrap="wrap">
                <Box display="flex" alignItems="center" color="#f3ca8c" fontWeight="bold">
                    <span style={{ marginRight: 4, fontSize: '1.2rem' }}>{calculatedRating}</span> <Star />
                </Box>
                <Typography sx={{ color: '#fff', opacity: 0.9 }}>{(enrollmentCount || 0).toLocaleString()} học viên</Typography>
                <Typography sx={{ color: '#fff', opacity: 0.9 }}>Cập nhật: {new Date(updatedAt).toLocaleDateString('vi-VN')}</Typography>
              </Box>
              <Box display="flex" gap={1.5} alignItems="center">
                <Avatar src={instructor?.profileImageUrl} sx={{ width: 40, height: 40, border: '2px solid white' }} />
                <Box><Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>Giảng viên</Typography><Typography variant="body2" fontWeight="bold">{instructor?.lastName} {instructor?.firstName}</Typography></Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'left', md: 'center' }, mt: { xs: 4, md: 0 } }}>
                {!isEnrolled && <Typography variant="h2" fontWeight="800" sx={{ color: '#fff', mb: 1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{formatCurrency(priceVND)}</Typography>}
                <Button variant="contained" size="large" onClick={handleEnrollClick} sx={{ bgcolor: isEnrolled ? '#97A87A' : '#a435f0', color: 'white', fontWeight: 'bold', py: 2, px: 6, borderRadius: '50px', '&:hover': { transform: 'scale(1.05)' }, transition: 'all 0.3s ease' }}>{isEnrolled ? "Tiếp tục học" : "Đăng ký học ngay"}</Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
  
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered variant="fullWidth">
            <Tab icon={<Description />} iconPosition="start" label="Nội dung" />
            <Tab icon={<RateReview />} iconPosition="start" label="Đánh giá" />
            <Tab icon={<QuestionAnswer />} iconPosition="start" label="Thảo luận" />
          </Tabs>
        </Box>

        {/* TAB 0: NỘI DUNG */}
        <div hidden={activeTab !== 0}>
            {activeTab === 0 && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Chương trình học</Typography>
                        <Button size="small" onClick={handleExpandAll} sx={{ fontWeight: 'bold' }}>Mở rộng</Button>
                    </Box>
                    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                        {modules?.map((mod, idx) => (
                            <Accordion key={idx} expanded={expandedModules[idx]} onChange={(e, x) => setExpandedModules({...expandedModules, [idx]: x})}>
                                <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f7f9fa' }}>
                                    <Typography fontWeight={600}>{mod.title}</Typography>
                                    <Typography sx={{ ml: 'auto', fontSize: '13px', color: 'text.secondary' }}>{mod.lessonCount} bài</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {mod.lessons?.map(lesson => (
                                        <Box key={lesson.id} display="flex" gap={2} py={1.5} borderBottom="1px dashed #eee" alignItems="center">
                                            <PlayCircleOutline fontSize="small" color="action" /> 
                                            <Typography variant="body2" color="text.secondary">{lesson.title}</Typography>
                                            {(lesson.isFree || isEnrolled) ? 
                                                <Chip label="Học" size="small" color="primary" onClick={() => navigate(`/my-course/course/learn/${course.id}`)} sx={{ ml: 'auto', height: 20, cursor: 'pointer' }} /> : 
                                                <Lock fontSize="small" sx={{ ml: 'auto', opacity: 0.5 }}/>}
                                        </Box>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                </Box>
            )}
        </div>

        {/* TAB 1: ĐÁNH GIÁ */}
        <div hidden={activeTab !== 1}>
            {activeTab === 1 && (
                <Box>
                    {/* Thống kê */}
                    <Box display="flex" alignItems="center" gap={4} mb={4} p={3} bgcolor="#f8f9fa" borderRadius={2}>
                        <Box textAlign="center">
                            <Typography variant="h2" fontWeight="bold" color="#b4690e">{calculatedRating}</Typography>
                            <Rating value={Number(calculatedRating)} precision={0.1} readOnly size="large" />
                            <Typography variant="caption" display="block">Đánh giá trung bình</Typography>
                        </Box>
                        <Box flex={1}>
                            <Typography variant="body2">Dựa trên {reviews.length} đánh giá</Typography>
                            <LinearProgress variant="determinate" value={reviews.length > 0 ? 100 : 0} sx={{ mt: 1, height: 8, borderRadius: 4, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#b4690e' } }} />
                        </Box>
                    </Box>

                    {/* Form Review */}
                    {isEnrolled && (
                        <Box id="review-form" mb={4} p={3} border="1px solid #ddd" borderRadius={2}>
                            <Typography variant="h6" mb={2}>{editingReviewId ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}</Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Rating value={reviewRating} onChange={(e, val) => setReviewRating(val)} size="large" />
                                </Box>
                                <TextField fullWidth multiline rows={3} placeholder="Chia sẻ cảm nghĩ..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                                <Box display="flex" gap={2}>
                                    <Button variant="contained" onClick={handleSubmitReview} sx={{ bgcolor: '#1c1d1f' }}>{editingReviewId ? "Cập nhật" : "Gửi"}</Button>
                                    {editingReviewId && <Button variant="outlined" color="error" onClick={cancelEditReview}>Hủy</Button>}
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Danh sách Reviews */}
                    <Stack spacing={2} mb={3}>
                        {reviews && reviews.length > 0 ? reviews.map((rev) => (
                            <Box key={rev.id} sx={{ p: 2, bgcolor: editingReviewId === rev.id ? '#e3f2fd' : '#f9fafb', borderRadius: 2, border: editingReviewId === rev.id ? '1px solid #2196f3' : 'none' }}>
                                <Box display="flex" gap={2} alignItems="flex-start">
                                    <Avatar src={rev.user?.profileImageUrl}>{(rev.user?.firstName && rev.user.firstName[0]) || "?"}</Avatar>
                                    <Box flex={1}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Box>
                                                <Typography fontWeight="bold">{rev.user ? `${rev.user.lastName} ${rev.user.firstName}` : "Người dùng"}</Typography>
                                                <Rating value={rev.rating} readOnly size="small" />
                                            </Box>
                                            {currentUser && rev.user && (String(currentUser.id) === String(rev.user.id)) && (
                                                <Box>
                                                    <Tooltip title="Sửa"><IconButton size="small" color="primary" onClick={() => startEditReview(rev)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => handleDeleteReview(rev.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                </Box>
                                            )}
                                        </Box>
                                        <Typography mt={1} variant="body2">{rev.comment}</Typography>
                                        <Typography variant="caption" color="text.secondary" mt={1} display="block">{new Date(rev.createdAt).toLocaleString('vi-VN')}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )) : (
                            <Typography fontStyle="italic" color="text.secondary">Chưa có đánh giá nào.</Typography>
                        )}
                    </Stack>

                    {/* Phân trang Reviews */}
                    {totalReviewPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={2}>
                            <Pagination count={totalReviewPages} page={reviewPage} onChange={(e, v) => setReviewPage(v)} color="primary" />
                        </Box>
                    )}
                </Box>
            )}
        </div>

        {/* TAB 2: THẢO LUẬN */}
        <div hidden={activeTab !== 2}>
            {activeTab === 2 && (
                <Box>
                    <Box id="discussion-form" mb={4} p={3} bgcolor="#f8f9fa" borderRadius={2} border={editingDiscId ? "2px solid #1976d2" : "1px solid #eee"}>
                        <Typography variant="h6" mb={2} color={editingDiscId ? "primary" : "text.primary"}>{editingDiscId ? "Chỉnh sửa nội dung" : "Đặt câu hỏi mới"}</Typography>
                        <TextField 
                            fullWidth multiline rows={3} placeholder={editingDiscId ? "Cập nhật nội dung..." : "Bạn đang thắc mắc điều gì..."}
                            variant="outlined" sx={{ bgcolor: 'white' }} value={discContent} onChange={(e) => setDiscContent(e.target.value)}
                        />
                        <Box mt={2} display="flex" gap={2}>
                            <Button variant="contained" endIcon={editingDiscId ? <Update /> : <Send />} sx={{ bgcolor: editingDiscId ? '#1976d2' : '#1c1d1f' }} onClick={handleSubmitDiscussion}>{editingDiscId ? "Cập nhật" : "Gửi"}</Button>
                            {editingDiscId && <Button variant="outlined" startIcon={<CancelIcon />} color="error" onClick={() => { setEditingDiscId(null); setDiscContent(''); }}>Hủy bỏ</Button>}
                        </Box>
                    </Box>

                    {/* List Discussions */}
                    <Stack spacing={2} mb={3}>
                        {discussions && discussions.length > 0 ? discussions.map((disc) => (
                            <Box key={disc.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: editingDiscId === disc.id ? '#e3f2fd' : 'white' }}>
                                <Box display="flex" gap={2} alignItems="flex-start">
                                    <Avatar src={disc.user?.profileImageUrl} alt={disc.user?.firstName}>{(disc.user?.firstName && disc.user.firstName[0]) || "?"}</Avatar>
                                    <Box flex={1}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {disc.user ? `${disc.user.lastName} ${disc.user.firstName}` : "Người dùng"}
                                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 'normal' }}> • {disc.createdAt ? new Date(disc.createdAt).toLocaleString('vi-VN') : ""}</Typography>
                                            </Typography>
                                            {/* Sửa/Xóa Discussion */}
                                            {currentUser && disc.user && (String(currentUser.id) === String(disc.user.id)) && (
                                                <Box>
                                                    <Tooltip title="Sửa"><IconButton size="small" onClick={() => startEditingDisc(disc.id, disc.content)} color="primary"><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleDeleteAny(disc.id)} color="error"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                </Box>
                                            )}
                                        </Box>
                                        <Typography variant="body1" mt={1} sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{disc.content}</Typography>
                                        <Button size="small" startIcon={<ReplyIcon fontSize="small"/>} sx={{ mt: 1, color: 'text.secondary', textTransform: 'none' }} onClick={() => setReplyingToId(replyingToId === disc.id ? null : disc.id)}>Trả lời</Button>
                                        
                                        {/* Form Reply */}
                                        {replyingToId === disc.id && (
                                            <Box mt={2} ml={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                                                <TextField fullWidth size="small" placeholder="Viết câu trả lời..." variant="outlined" sx={{ bgcolor: 'white', mb: 1 }} value={replyInputContent} onChange={(e) => setReplyInputContent(e.target.value)} />
                                                <Box display="flex" gap={1} justifyContent="flex-end">
                                                    <Button size="small" onClick={() => setReplyingToId(null)}>Hủy</Button>
                                                    <Button size="small" variant="contained" onClick={() => handleCreateReply(disc.id)}>Gửi</Button>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Nested Replies */}
                                        {disc.replies && disc.replies.length > 0 && (
                                            <Box mt={2} ml={2} pl={2} borderLeft="2px solid #eee">
                                                {disc.replies.map((rep) => (
                                                    <Box key={rep.id} mt={2} display="flex" gap={2} alignItems="flex-start" sx={{ bgcolor: editingDiscId === rep.id ? '#e3f2fd' : 'transparent', p: editingDiscId === rep.id ? 1 : 0, borderRadius: 1 }}>
                                                        <Avatar src={rep.user?.profileImageUrl} sx={{ width: 32, height: 32 }}>{(rep.user?.firstName && rep.user.firstName[0]) || "?"}</Avatar>
                                                        <Box flex={1} bgcolor={editingDiscId === rep.id ? 'transparent' : "#f9f9f9"} p={editingDiscId === rep.id ? 0 : 1.5} borderRadius={2}>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                <Typography variant="subtitle2" fontWeight="bold" fontSize="0.9rem">
                                                                    {rep.user ? `${rep.user.lastName} ${rep.user.firstName}` : "Người dùng"}
                                                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>{rep.createdAt ? new Date(rep.createdAt).toLocaleString('vi-VN') : ""}</Typography>
                                                                </Typography>
                                                                {/* Sửa/Xóa Reply */}
                                                                {currentUser && rep.user && (String(currentUser.id) === String(rep.user.id)) && (
                                                                    <Box>
                                                                        <Tooltip title="Sửa"><IconButton size="small" onClick={() => startEditingDisc(rep.id, rep.content)} sx={{ p: 0.5 }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                                        <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleDeleteAny(rep.id)} sx={{ p: 0.5, color: '#bdbdbd', '&:hover': { color: '#d32f2f' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                            <Typography variant="body2" mt={0.5}>{rep.content}</Typography>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        )) : (
                            <Typography fontStyle="italic" color="text.secondary">Chưa có thảo luận nào.</Typography>
                        )}
                    </Stack>

                    {/* Phân trang Discussions */}
                    {totalDiscPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={2}>
                            <Pagination count={totalDiscPages} page={discPage} onChange={(e, v) => setDiscPage(v)} color="primary" />
                        </Box>
                    )}
                </Box>
            )}
        </div>
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={openPaymentModal} onClose={() => !isProcessing && setOpenPaymentModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ReceiptLong color="primary" /> Xác nhận đơn hàng</DialogTitle>
        <DialogContent dividers>
            <Box display="flex" justifyContent="space-between" mb={2}><Typography color="text.secondary">Giá khóa học:</Typography><Typography fontWeight="bold">{formatCurrency(priceVND)}</Typography></Box>
            <Typography fontWeight="bold" mb={1}>Chọn phương thức:</Typography>
            <FormControl fullWidth>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <Box border="1px solid #ddd" borderRadius={2} p={1}><FormControlLabel value="vnpay" control={<Radio />} label="Ví VNPay / Ngân hàng" /></Box>
                </RadioGroup>
            </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
            <Button onClick={() => setOpenPaymentModal(false)} color="inherit" disabled={isProcessing}>Hủy</Button>
            <Button variant="contained" onClick={handleProceedPayment} disabled={isProcessing} startIcon={isProcessing && <CircularProgress size={20} color="inherit"/>} sx={{ bgcolor: '#a435f0' }}>Thanh toán</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetailPage;