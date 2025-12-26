import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Container, Accordion, AccordionSummary, AccordionDetails, 
  Rating, Button, Grid, Typography, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, FormControl, CircularProgress,
  Tabs, Tab, TextField, IconButton, Tooltip, Snackbar, Alert, LinearProgress, Pagination, Stack, Paper, Divider,
  useMediaQuery, useTheme 
} from '@mui/material';
import { 
  ExpandMore, PlayCircleOutline, Star, Update, Lock, ReceiptLong, 
  Description, RateReview, QuestionAnswer, Send,
  Edit as EditIcon, Delete as DeleteIcon, Cancel as CancelIcon,
  Reply as ReplyIcon, AccessTime, PeopleAlt, VerifiedUser, School, Language, CheckCircle,
  PlayArrow 
} from '@mui/icons-material';
import { getUserEnrollmentsAction } from '../../Redux/Course/course.action';
import api from '../../Redux/api';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
const formatDuration = (seconds) => {
  if (!seconds) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// --- STYLES CONSTANTS ---
const PRIMARY_COLOR = '#97A87A'; 
const SECONDARY_COLOR = '#1c1d1f';
const BG_COLOR = '#f7f9fa';
const GLASS_STYLE = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
};

const CourseDetailPage = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

  // --- STATE ---
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useSelector(store => store.auth);
  const { userEnrollments } = useSelector(store => store.course);
  
  const [activeTab, setActiveTab] = useState(0);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Review & Discussion States
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [reviewRating, setReviewRating] = useState(5); 
  const [reviewComment, setReviewComment] = useState(''); 
  const [editingReviewId, setEditingReviewId] = useState(null); 

  const [discussions, setDiscussions] = useState([]);
  const [discPage, setDiscPage] = useState(1);
  const [totalDiscPages, setTotalDiscPages] = useState(1);
  const [discContent, setDiscContent] = useState(''); 
  const [editingDiscId, setEditingDiscId] = useState(null);
  const [replyingToId, setReplyingToId] = useState(null); 
  const [replyInputContent, setReplyInputContent] = useState(''); 

  // --- MEMO & HELPERS ---
  const isEnrolled = useMemo(() => {
    // Check thêm currentUser để reset khi logout
    if (!currentUser || !course || !userEnrollments) return false;
    return userEnrollments.some(e => e.course && String(e.course.id) === String(course.id));
  }, [currentUser, course, userEnrollments]);

  const calculatedRating = useMemo(() => {
      if (!reviews || reviews.length === 0) return 0;
      const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      return (total / reviews.length).toFixed(1);
  }, [reviews]);

  // --- API CALLS ---
  useEffect(() => { if(currentUser) dispatch(getUserEnrollmentsAction()); }, [dispatch, currentUser]);

  useEffect(() => {
    const fetchCourseDetail = async () => {
        try {
            const res = await api.get(`/course/slug/${slug}`);
            if (res.data?.success) setCourse(res.data.data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    if (slug) fetchCourseDetail();
  }, [slug]);

  const fetchReviews = async (page = 1) => {
    if (!course) return;
    try {
        const res = await api.get(`/course/${course.id}/reviews`, {
            params: { page: page, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' } 
        });
        if(res.data.success && res.data.data) {
            setReviews(res.data.data.reviews || []);
            if (res.data.data.pagination) setTotalReviewPages(res.data.data.pagination.totalPages);
        }
    } catch (e) { console.error(e); }
  };

  const fetchDiscussions = async (page = 1) => {
    if (!course) return;
    try {
        const res = await api.get(`/course/${course.id}/discussions`, { 
            params: { page: page, limit: 5, sortOrder: 'desc' } 
        });
        if(res.data.success && res.data.data) {
            const data = res.data.data;
            let list = Array.isArray(data) ? data : (data.content || data.discussions || []);
            setDiscussions(list);
            if (data.pagination?.totalPages) setTotalDiscPages(data.pagination.totalPages);
            else if (data.totalPages) setTotalDiscPages(data.totalPages);
        }
    } catch (e) { console.error(e); }
  };

  // --- HANDLERS ---
  const handleSubmitReview = async () => {
      if (!reviewComment.trim()) return showSnackbar("Please enter a review comment", "warning");
      try {
          if (editingReviewId) {
              await api.put(`/course/${course.id}/reviews/${editingReviewId}`, { rating: reviewRating, comment: reviewComment });
              showSnackbar("Review updated!");
          } else {
              await api.post(`/course/${course.id}/reviews`, { rating: reviewRating, comment: reviewComment });
              showSnackbar("Review submitted successfully!");
              setReviewPage(1);
          }
          setEditingReviewId(null); setReviewComment(''); setReviewRating(5);
          fetchReviews(editingReviewId ? reviewPage : 1); 
      } catch (error) {
          if (error.response?.status === 409) showSnackbar("You have already reviewed this course!", "error");
          else showSnackbar(error.response?.data?.message || "Error submitting review.", "error");
      }
  };

  const handleDeleteReview = async (reviewId) => {
      if (!window.confirm("Delete this review?")) return;
      try {
          await api.delete(`/course/${course.id}/reviews/${reviewId}`);
          showSnackbar("Review deleted.");
          fetchReviews(reviewPage); 
      } catch (error) { showSnackbar("Unable to delete review.", "error"); }
  };

  const handleSubmitDiscussion = async () => {
    if (!discContent.trim()) return showSnackbar("Please enter content!", "warning");
    try {
        if (editingDiscId) {
            await api.put(`/course/${course.id}/discussions/${editingDiscId}`, { content: discContent });
            showSnackbar("Updated successfully!");
        } else {
            await api.post(`/course/${course.id}/discussions`, { content: discContent });
            showSnackbar("Discussion posted!");
            setDiscPage(1);
        }
        setDiscContent(''); setEditingDiscId(null);
        fetchDiscussions(editingDiscId ? discPage : 1); 
    } catch (error) { showSnackbar("Error posting content.", "error"); }
  };

  const handleDeleteAny = async (id) => {
      if(!window.confirm("Delete this content?")) return;
      try {
          await api.delete(`/course/${course.id}/discussions/${id}`);
          showSnackbar("Deleted successfully.");
          fetchDiscussions(discPage); 
      } catch (error) { showSnackbar("Unable to delete.", "error"); }
  };

  const handleCreateReply = async (parentDiscId) => {
    if (!replyInputContent.trim()) return showSnackbar("Please enter a reply!", "warning");
    try {
        await api.post(`/course/${course.id}/discussions/${parentDiscId}/reply`, { content: replyInputContent });
        showSnackbar("Reply sent!");
        setReplyInputContent(''); setReplyingToId(null);
        fetchDiscussions(discPage);
    } catch (error) { showSnackbar("Error sending reply.", "error"); }
  };

  const handleEnrollClick = () => {
    if (isEnrolled) { navigate(`/my-course/course/learn/${course.id}`); return; }
    if (!currentUser) { showSnackbar("You need to login to enroll!", "warning"); return; }
    setOpenPaymentModal(true);
  };
  
  const handleProceedPayment = async () => {
    setIsProcessing(true);
    try {
        const res = await api.post(`/payment/courses/${course.id}/payments`, { bankCode: "NCB", locale: "vn" });
        if (res.data?.success) window.location.href = res.data.data.paymentUrl; 
    } catch (error) { showSnackbar(`Payment error: ${error.response?.data?.message}`, "error"); setIsProcessing(false); }
  };

  // --- EFFECTS FOR TABS ---
  useEffect(() => { if (course && activeTab === 1) fetchReviews(reviewPage); }, [activeTab, course, reviewPage]);
  useEffect(() => { if (course && activeTab === 2) fetchDiscussions(discPage); }, [activeTab, course, discPage]);

  // --- HELPERS ---
  const startEditReview = (review) => { setEditingReviewId(review.id); setReviewRating(review.rating); setReviewComment(review.comment); document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' }); };
  const cancelEditReview = () => { setEditingReviewId(null); setReviewComment(''); setReviewRating(5); };
  const startEditingDisc = (id, currentContent) => { setEditingDiscId(id); setDiscContent(currentContent); document.getElementById('discussion-form')?.scrollIntoView({ behavior: 'smooth' }); };
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleExpandAll = () => { const all = {}; course?.modules?.forEach((_, i) => { all[i] = true; }); setExpandedModules(all); };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: BG_COLOR }}><CircularProgress sx={{ color: PRIMARY_COLOR }} /></Box>;
  if (!course) return <Container sx={{ mt: 10, textAlign: 'center' }}><Typography variant="h5">Course not found</Typography></Container>;

  const { title, description, priceVND, image, updatedAt, enrollmentCount, totalLessons, totalDuration, instructor, modules } = course;

  return (
    <Box sx={{ bgcolor: BG_COLOR, minHeight: '100vh', pb: 10 }}>
      {/* --- HEADER SECTION --- */}
      <Box sx={{ 
          position: 'relative', 
          color: 'white', 
          pt: { xs: 8, md: 12 }, 
          pb: { xs: 8, md: 10 },
          overflow: 'hidden',
          background: '#1c1d1f' // Fallback
      }}>
        {/* Background & Overlay */}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4, zIndex: 0 }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)', zIndex: 1 }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left Content */}
            <Grid item xs={12} md={7} size={{xs: 12, md: 7}}>
              <Box mb={3}>
                <Chip label={isEnrolled ? "Enrolled" : "Premium Course"} color={isEnrolled ? "success" : "primary"} sx={{ fontWeight: 600, mb: 2 }} />
                <Typography variant="h2" fontWeight="800" sx={{ fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.2, mb: 2 }}>{title}</Typography>
                <Typography variant="h6" sx={{ color: '#d1d7dc', fontWeight: 400, lineHeight: 1.6, mb: 3 }}>{description}</Typography>
              </Box>

              <Stack direction="row" spacing={3} alignItems="center" mb={4} flexWrap="wrap" useFlexGap>
                <Box display="flex" alignItems="center" color="white"><PeopleAlt fontSize="small" sx={{ mr: 1, opacity: 0.7 }} /><Typography variant="body2">{(enrollmentCount || 0).toLocaleString()} students</Typography></Box>
                <Box display="flex" alignItems="center" color="white"><Update fontSize="small" sx={{ mr: 1, opacity: 0.7 }} /><Typography variant="body2">Updated {new Date(updatedAt).toLocaleDateString('en-US')}</Typography></Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar src={instructor?.profileImageUrl} sx={{ width: 48, height: 48, border: '2px solid rgba(255,255,255,0.2)' }} />
                <Box>
                    <Typography variant="caption" sx={{ color: '#d1d7dc' }}>Created by</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>{instructor?.lastName} {instructor?.firstName} <VerifiedUser fontSize="inherit" sx={{ ml: 0.5, color: '#4caf50', verticalAlign: 'middle' }} /></Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Right Card */}
            <Grid item xs={12} md={5} size={{xs: 12, md: 5}}>
                <Paper sx={{ ...GLASS_STYLE, p: 4, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <Box mb={3}>
                        <img src={image} alt={title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    </Box>

                    {/* Logic hiển thị nút và giá */}
                    {isEnrolled ? (
                        <Box>
                            {/* Nếu đã mua: Ẩn giá, hiển thị nút Go to Course nổi bật */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3, color: '#2e7d32', bgcolor: '#e8f5e9', py: 1, borderRadius: 2 }}>
                                <CheckCircle fontSize="small" />
                                <Typography variant="subtitle2" fontWeight="bold">You own this course</Typography>
                            </Box>
                            
                            <Button 
                                variant="contained" 
                                fullWidth 
                                size="large" 
                                onClick={handleEnrollClick} 
                                sx={{ 
                                    bgcolor: '#1c1d1f', // Màu tối sang trọng thay vì màu xanh lá
                                    color: 'white', 
                                    fontWeight: 'bold', 
                                    py: 1.5, 
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    '&:hover': { bgcolor: 'black' }
                                }}
                            >
                                Continue Learning
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            {/* Nếu chưa mua: Hiển thị giá và nút Enroll */}
                            <Typography variant="h3" fontWeight="800" sx={{ color: '#1c1d1f', mb: 1 }}>{formatCurrency(priceVND)}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', mb: 3 }}>{formatCurrency(priceVND * 1.2)}</Typography>
                            
                            <Button 
                                variant="contained" 
                                fullWidth 
                                size="large" 
                                onClick={handleEnrollClick} 
                                sx={{ 
                                    bgcolor: PRIMARY_COLOR, 
                                    color: 'white', 
                                    fontWeight: 'bold', 
                                    py: 2, 
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 14px 0 rgba(164, 53, 240, 0.39)',
                                    '&:hover': { bgcolor: '#8710d8', transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(164, 53, 240, 0.23)' },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Enroll Now
                            </Button>
                            <Typography variant="caption" display="block" mt={2} color="text.secondary">30-Day Money-Back Guarantee. Full Lifetime Access.</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
  
      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 3 }}>
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #eee' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
            <Tabs 
                value={activeTab} 
                onChange={(e, val) => setActiveTab(val)} 
                variant="fullWidth" // Dùng fullWidth hoặc centered đều được, fullWidth sẽ chia đều
                centered // Để icon luôn ở giữa nếu dùng fixed width
                sx={{ 
                    '& .MuiTab-root': { 
                        textTransform: 'none', 
                        fontWeight: 600, 
                        fontSize: '1rem', 
                        minHeight: 60,
                        minWidth: isMobile ? 50 : 90 // Thu nhỏ width tab trên mobile
                    },
                    '& .Mui-selected': { color: PRIMARY_COLOR },
                    '& .MuiTabs-indicator': { backgroundColor: PRIMARY_COLOR, height: 3 }
                }}
            >
                {/* LOGIC RESPONSIVE LABEL: 
                    Dùng điều kiện !isMobile để ẩn label khi màn hình nhỏ 
                */}
                <Tab icon={<School />} iconPosition="start" label={!isMobile ? "Course Content" : null} />
                <Tab icon={<RateReview />} iconPosition="start" label={!isMobile ? "Reviews & Ratings" : null} />
                <Tab icon={<QuestionAnswer />} iconPosition="start" label={!isMobile ? "Q&A Discussion" : null} />
            </Tabs>
            </Box>

            <Box p={{ xs: 2, md: 4 }} bgcolor="white" minHeight={400}>
                {/* TAB 0: CONTENT */}
                <div hidden={activeTab !== 0}>
                    {activeTab === 0 && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6" fontWeight="bold">Course Content ({modules?.length || 0} modules • {totalLessons || 0} lessons)</Typography>
                                <Button size="small" onClick={handleExpandAll} sx={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}>Expand All</Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {modules?.map((mod, idx) => (
                                    // FIX LỖI TẠI ĐÂY: Thêm !! để ép kiểu thành boolean
                                    <Accordion 
                                        key={idx} 
                                        expanded={!!expandedModules[idx]} // Quan trọng: !! để tránh undefined
                                        onChange={(e, x) => setExpandedModules({...expandedModules, [idx]: x})}
                                        elevation={0}
                                        sx={{ 
                                            border: '1px solid #e0e0e0', 
                                            borderRadius: '8px !important', 
                                            '&:before': { display: 'none' },
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f7f9fa', '&.Mui-expanded': { minHeight: 48 } }}>
                                            <Typography fontWeight={700} sx={{ flex: 1 }}>{mod.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{mod.lessonCount} lectures</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ p: 0 }}>
                                            {mod.lessons?.map((lesson, lIdx) => (
                                                <Box key={lesson.id} display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom={lIdx < mod.lessons.length - 1 ? "1px solid #eee" : "none"} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <PlayCircleOutline fontSize="small" color="action" />
                                                        <Typography variant="body2" color="#1c1d1f">{lesson.title}</Typography>
                                                    </Box>
                                                    <Box>
                                                        {/* LOGIC HIỂN THỊ TRẠNG THÁI BÀI HỌC */}
                                                        {isEnrolled ? (
                                                            // TH1: Đã đăng ký -> Hiện nút Play
                                                            <Tooltip title="Start Learning">
                                                                <IconButton 
                                                                    onClick={(e) => { e.stopPropagation(); navigate(`/my-course/course/learn/${course.id}`); }} 
                                                                    sx={{ color: PRIMARY_COLOR, border: `1px solid ${PRIMARY_COLOR}`, p: 0.5 }}
                                                                >
                                                                    <PlayArrow fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : lesson.isFree ? (
                                                            // TH2: Chưa đăng ký nhưng Free -> Hiện chữ Preview
                                                            <Tooltip title="Watch Preview">
                                                                <Chip 
                                                                    label="Preview" 
                                                                    size="small" 
                                                                    variant="outlined"
                                                                    color="primary" 
                                                                    onClick={(e) => { e.stopPropagation(); navigate(`/my-course/course/learn/${course.id}`); }} 
                                                                    sx={{ height: 24, cursor: 'pointer', fontWeight: 600, borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }} 
                                                                />
                                                            </Tooltip> 
                                                        ) : (
                                                            // TH3: Chưa đăng ký và Không Free -> Hiện Lock
                                                            <Lock fontSize="small" sx={{ opacity: 0.4, color: '#aaa' }}/>
                                                        )}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        </Box>
                    )}
                </div>

                {/* TAB 1: REVIEWS */}
                <div hidden={activeTab !== 1}>
                    {activeTab === 1 && (
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4} size={{xs: 12, md: 4}}>
                                <Box p={3} borderRadius={2} bgcolor="#fff" border="1px solid #eee" textAlign="center">
                                    <Typography variant="h2" fontWeight="800" color="#b4690e">{calculatedRating}</Typography>
                                    <Rating value={Number(calculatedRating)} precision={0.1} readOnly size="large" sx={{ my: 1, color: '#e59819' }} />
                                    <Typography variant="subtitle1" fontWeight="bold">Course Rating</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={8} size={{xs: 12, md: 8}}>
                                {isEnrolled && (
                                    <Box id="review-form" mb={4} p={3} border="1px solid #eee" borderRadius={2} bgcolor="#fafafa">
                                            <Typography variant="h6" mb={2} fontWeight="bold">{editingReviewId ? "Edit Your Review" : "Write a Review"}</Typography>
                                            <Rating value={reviewRating} onChange={(e, val) => setReviewRating(val)} size="large" sx={{ mb: 2 }} />
                                            <TextField fullWidth multiline rows={3} placeholder="Tell us about your own personal experience taking this course..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} sx={{ bgcolor: 'white', mb: 2 }} />
                                            <Box display="flex" gap={2}>
                                                <Button variant="contained" onClick={handleSubmitReview} sx={{ bgcolor: PRIMARY_COLOR }}>{editingReviewId ? "Update" : "Submit"}</Button>
                                                {editingReviewId && <Button onClick={cancelEditReview}>Cancel</Button>}
                                            </Box>
                                    </Box>
                                )}

                                <Stack spacing={3}>
                                    {reviews && reviews.length > 0 ? reviews.map((rev) => (
                                        <Box key={rev.id} borderBottom="1px solid #eee" pb={3}>
                                            <Box display="flex" gap={2} mb={2}>
                                                <Avatar src={rev.user?.profileImageUrl} sx={{ bgcolor: PRIMARY_COLOR }}>{(rev.user?.firstName?.[0]) || "U"}</Avatar>
                                                <Box>
                                                    <Typography fontWeight="bold">{rev.user ? `${rev.user.lastName} ${rev.user.firstName}` : "User"}</Typography>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Rating value={rev.rating} readOnly size="small" sx={{ color: '#e59819' }} />
                                                        <Typography variant="caption" color="text.secondary">{new Date(rev.createdAt).toLocaleDateString('en-US')}</Typography>
                                                    </Box>
                                                </Box>
                                                {currentUser && rev.user && (String(currentUser.id) === String(rev.user.id)) && (
                                                    <Box ml="auto">
                                                        <IconButton size="small" onClick={() => startEditReview(rev)}><EditIcon fontSize="small" /></IconButton>
                                                        <IconButton size="small" onClick={() => handleDeleteReview(rev.id)}><DeleteIcon fontSize="small" /></IconButton>
                                                    </Box>
                                                )}
                                            </Box>
                                            <Typography variant="body1" color="#1c1d1f">{rev.comment}</Typography>
                                        </Box>
                                    )) : <Typography fontStyle="italic" color="text.secondary">No reviews yet.</Typography>}
                                </Stack>
                                {totalReviewPages > 1 && <Box display="flex" justifyContent="center" mt={4}><Pagination count={totalReviewPages} page={reviewPage} onChange={(e, v) => setReviewPage(v)} color="primary" /></Box>}
                            </Grid>
                        </Grid>
                    )}
                </div>

                {/* TAB 2: DISCUSSIONS */}
                <div hidden={activeTab !== 2}>
                    {activeTab === 2 && (
                        <Box maxWidth="800px" mx="auto">
                            <Box id="discussion-form" mb={4} p={3} borderRadius={2} border="1px solid #eee">
                                <Typography variant="h6" mb={2} fontWeight="bold">{editingDiscId ? "Edit Discussion" : "Ask a Question"}</Typography>
                                <TextField fullWidth multiline rows={3} placeholder="What are you curious about?" variant="outlined" value={discContent} onChange={(e) => setDiscContent(e.target.value)} sx={{ mb: 2 }} />
                                <Box display="flex" gap={2}>
                                    <Button variant="contained" endIcon={<Send />} sx={{ bgcolor: PRIMARY_COLOR }} onClick={handleSubmitDiscussion}>{editingDiscId ? "Update" : "Post Question"}</Button>
                                    {editingDiscId && <Button color="error" onClick={() => { setEditingDiscId(null); setDiscContent(''); }}>Cancel</Button>}
                                </Box>
                            </Box>

                            <Stack spacing={3}>
                                {discussions && discussions.length > 0 ? discussions.map((disc) => (
                                    <Box key={disc.id} p={3} border="1px solid #eee" borderRadius={2} bgcolor="white">
                                            <Box display="flex" gap={2}>
                                                <Avatar src={disc.user?.profileImageUrl} sx={{ bgcolor: '#1c1d1f' }}>{(disc.user?.firstName?.[0]) || "U"}</Avatar>
                                                <Box flex={1}>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography fontWeight="bold" variant="subtitle1">{disc.user ? `${disc.user.lastName} ${disc.user.firstName}` : "User"}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{new Date(disc.createdAt).toLocaleDateString('en-US')}</Typography>
                                                    </Box>
                                                    <Typography variant="body1" mt={1} mb={2}>{disc.content}</Typography>
                                                    
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <Button size="small" startIcon={<ReplyIcon />} onClick={() => setReplyingToId(replyingToId === disc.id ? null : disc.id)}>Reply</Button>
                                                        {currentUser && disc.user && (String(currentUser.id) === String(disc.user.id)) && (
                                                            <>
                                                                <Button size="small" startIcon={<EditIcon />} onClick={() => startEditingDisc(disc.id, disc.content)}>Edit</Button>
                                                                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteAny(disc.id)}>Delete</Button>
                                                            </>
                                                        )}
                                                    </Box>

                                                    {/* Reply Input */}
                                                    {replyingToId === disc.id && (
                                                        <Box mt={2} display="flex" gap={2}>
                                                                <TextField fullWidth size="small" placeholder="Write a reply..." value={replyInputContent} onChange={(e) => setReplyInputContent(e.target.value)} />
                                                                <Button variant="contained" size="small" onClick={() => handleCreateReply(disc.id)} sx={{ bgcolor: PRIMARY_COLOR }}>Send</Button>
                                                        </Box>
                                                    )}

                                                    {/* Nested Replies */}
                                                    {disc.replies && disc.replies.length > 0 && (
                                                        <Box mt={3} pl={3} borderLeft="3px solid #eee">
                                                                {disc.replies.map((rep) => (
                                                                    <Box key={rep.id} mt={2}>
                                                                        <Box display="flex" gap={1.5} alignItems="center">
                                                                            <Avatar src={rep.user?.profileImageUrl} sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>{(rep.user?.firstName?.[0]) || "U"}</Avatar>
                                                                            <Typography variant="subtitle2" fontWeight="bold">{rep.user ? `${rep.user.lastName} ${rep.user.firstName}` : "User"}</Typography>
                                                                            <Typography variant="caption" color="text.secondary">• {new Date(rep.createdAt).toLocaleDateString('en-US')}</Typography>
                                                                        </Box>
                                                                        <Typography variant="body2" mt={0.5} ml={4.5} color="text.secondary">{rep.content}</Typography>
                                                                        {currentUser && rep.user && (String(currentUser.id) === String(rep.user.id)) && (
                                                                            <Box ml={4.5} mt={0.5}>
                                                                                    <Typography variant="caption" sx={{ cursor: 'pointer', mr: 2, color: 'primary.main' }} onClick={() => startEditingDisc(rep.id, rep.content)}>Edit</Typography>
                                                                                    <Typography variant="caption" sx={{ cursor: 'pointer', color: 'error.main' }} onClick={() => handleDeleteAny(rep.id)}>Delete</Typography>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                    </Box>
                                )) : <Typography fontStyle="italic" textAlign="center" color="text.secondary">No discussions yet. Be the first to ask!</Typography>}
                            </Stack>
                            {totalDiscPages > 1 && <Box display="flex" justifyContent="center" mt={4}><Pagination count={totalDiscPages} page={discPage} onChange={(e, v) => setDiscPage(v)} color="primary" /></Box>}
                        </Box>
                    )}
                </div>
            </Box>
        </Paper>
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={openPaymentModal} onClose={() => !isProcessing && setOpenPaymentModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ReceiptLong color="primary" /> Checkout</DialogTitle>
        <DialogContent dividers>
            <Box display="flex" justifyContent="space-between" mb={2}><Typography color="text.secondary">Course Price:</Typography><Typography fontWeight="bold">{formatCurrency(priceVND)}</Typography></Box>
            <Typography fontWeight="bold" mb={1}>Payment Method:</Typography>
            <FormControl fullWidth>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <Box border="1px solid #ddd" borderRadius={2} p={1}><FormControlLabel value="vnpay" control={<Radio />} label="VNPay Wallet / Banking" /></Box>
                </RadioGroup>
            </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
            <Button onClick={() => setOpenPaymentModal(false)} color="inherit" disabled={isProcessing}>Cancel</Button>
            <Button variant="contained" onClick={handleProceedPayment} disabled={isProcessing} startIcon={isProcessing && <CircularProgress size={20} color="inherit"/>} sx={{ bgcolor: PRIMARY_COLOR }}>Proceed Payment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetailPage;