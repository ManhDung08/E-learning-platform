import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Container, Accordion, AccordionSummary, AccordionDetails, 
  Rating, Button, Grid, Typography, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, FormControl, CircularProgress,
  Tabs, Tab, TextField, IconButton, Tooltip, Snackbar, Alert
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
  const [reviews, setReviews] = useState([]);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- STATE CRUD CHUNG (Dùng cho cả Discussion và Reply khi Edit/Delete) ---
  const [discussions, setDiscussions] = useState([]);
  const [mainInputContent, setMainInputContent] = useState(''); // Nội dung cho ô nhập chính (Tạo mới / Sửa)
  const [editingId, setEditingId] = useState(null); // ID của item đang sửa (có thể là discussionId hoặc replyId)

  // --- STATE RIÊNG CHO TẠO REPLY MỚI ---
  const [replyingToId, setReplyingToId] = useState(null); // ID của bài gốc đang được reply
  const [replyInputContent, setReplyInputContent] = useState(''); // Nội dung form reply nhỏ

  // Check enrollment
  const isEnrolled = React.useMemo(() => {
    if (!course || !userEnrollments) return false;
    return userEnrollments.some(e => e.course && String(e.course.id) === String(course.id));
  }, [course, userEnrollments]);

  useEffect(() => { dispatch(getUserEnrollmentsAction()); }, [dispatch]);

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

  useEffect(() => {
    if (!course) return;
    if (activeTab === 1) fetchReviews();
    if (activeTab === 2) fetchDiscussions();
  }, [activeTab, course]);

  const fetchReviews = async () => {
    try {
        const res = await api.get(`/api/course/${course.id}/reviews`);
        if(res.data.success) setReviews(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (e) { console.error(e); }
  };

  // ============================================================
  // LOGIC CRUD THỐNG NHẤT
  // ============================================================

  // 1. GET LIST
  const fetchDiscussions = async () => {
    if (!course) return;
    try {
        const res = await api.get(`/api/course/${course.id}/discussions`, {
            params: { page: 1, limit: 50, sortOrder: 'desc' }
        });
        if(res.data.success) {
            const data = res.data.data;
            if (Array.isArray(data)) setDiscussions(data);
            else if (data?.content) setDiscussions(data.content);
            else if (data?.discussions) setDiscussions(data.discussions);
            else setDiscussions([]);
        }
    } catch (e) { console.error(e); }
  };

  // 2. SUBMIT FORM CHÍNH (Xử lý Tạo Discussion Mới HOẶC Sửa Bất Kỳ Item Nào)
  const handleMainSubmit = async () => {
    if (!mainInputContent.trim()) return showSnackbar("Vui lòng nhập nội dung!", "warning");
    
    try {
        if (editingId) {
            // MODE SỬA: Gọi PUT vào ID đang sửa (bất kể là discussion hay reply)
            // PUT /api/course/{cid}/discussions/{anyId}
            await api.put(`/api/course/${course.id}/discussions/${editingId}`, { content: mainInputContent });
            showSnackbar("Đã cập nhật thành công!");
        } else {
            // MODE TẠO MỚI (DISCUSSION): Gọi POST
            await api.post(`/api/course/${course.id}/discussions`, { content: mainInputContent });
            showSnackbar("Đã đăng thảo luận mới!");
        }
        
        // Reset
        setMainInputContent('');
        setEditingId(null);
        fetchDiscussions();
    } catch (error) { 
        showSnackbar(error.response?.data?.message || "Có lỗi xảy ra.", "error"); 
    }
  };

  // 3. XÓA BẤT KỲ (Discussion hoặc Reply)
  const handleDeleteAny = async (id) => {
      if(!window.confirm("Bạn có chắc chắn muốn xóa nội dung này?")) return;
      try {
          // DELETE /api/course/{cid}/discussions/{anyId}
          await api.delete(`/api/course/${course.id}/discussions/${id}`);
          showSnackbar("Đã xóa thành công.");
          fetchDiscussions();
      } catch (error) { 
          showSnackbar("Không thể xóa (Bạn không phải người đăng).", "error"); 
      }
  };

  // 4. TẠO REPLY MỚI (Vẫn dùng API riêng biệt này)
  const handleCreateReply = async (parentDiscId) => {
    if (!replyInputContent.trim()) return showSnackbar("Nhập nội dung trả lời!", "warning");
    try {
        // POST .../reply
        await api.post(`/api/course/${course.id}/discussions/${parentDiscId}/reply`, { content: replyInputContent });
        showSnackbar("Đã gửi trả lời!");
        setReplyInputContent('');
        setReplyingToId(null);
        fetchDiscussions();
    } catch (error) { showSnackbar("Lỗi gửi trả lời.", "error"); }
  };

  // ============================================================
  // UI HELPERS
  // ============================================================
  
  // Đưa nội dung lên form chính để sửa
  const startEditing = (id, currentContent) => {
      setEditingId(id);
      setMainInputContent(currentContent);
      // Cuộn lên form chính
      document.getElementById('main-discussion-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEditing = () => {
      setEditingId(null);
      setMainInputContent('');
  };

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleTabChange = (e, val) => setActiveTab(val);
  const handleEnrollClick = () => isEnrolled ? navigate(`/my-course/course/learn/${course.id}`) : setOpenPaymentModal(true);
  
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!course) return <Container sx={{ mt: 10, textAlign: 'center' }}><Typography variant="h5">Không tìm thấy khóa học</Typography></Container>;

  const { title, description, priceVND, image, updatedAt, enrollmentCount, totalLessons, totalDuration, averageRating, instructor, modules } = course;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
      {/* HEADER SECTION (Giữ nguyên) */}
      <Box sx={{ position: 'relative', color: 'white', py: 10, overflow: 'hidden', minHeight: '400px', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3) blur(4px)', transform: 'scale(1.1)', zIndex: 0 }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" fontWeight="bold" mb={2} sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{title}</Typography>
              <Typography variant="body1" mb={3} sx={{ color: '#e0e0e0', fontSize: '1.1rem', lineHeight: 1.6 }}>{description}</Typography>
              <Box display="flex" gap={3} alignItems="center" mb={3} flexWrap="wrap">
                <Box display="flex" alignItems="center" color="#f3ca8c" fontWeight="bold"><span style={{ marginRight: 4, fontSize: '1.2rem' }}>{averageRating || 0}</span> <Star /></Box>
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
                <Grid container spacing={2}>
                    {reviews && reviews.length > 0 ? reviews.map((rev) => (
                        <Grid item xs={12} key={rev.id}>
                            <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                                <Box display="flex" gap={2}>
                                    <Avatar src={rev.user?.profileImageUrl}>{(rev.user?.firstName && rev.user.firstName[0]) || "?"}</Avatar>
                                    <Box>
                                        <Typography fontWeight="bold">{rev.user ? `${rev.user.lastName || ''} ${rev.user.firstName || ''}` : "Người dùng"}</Typography>
                                        <Rating value={rev.rating || 5} readOnly size="small" />
                                    </Box>
                                </Box>
                                <Typography mt={1} variant="body2">{rev.comment}</Typography>
                            </Box>
                        </Grid>
                    )) : (
                        <Grid item xs={12}><Typography fontStyle="italic" color="text.secondary">Chưa có đánh giá nào.</Typography></Grid>
                    )}
                </Grid>
            )}
        </div>

        {/* TAB 2: THẢO LUẬN */}
        <div hidden={activeTab !== 2}>
            {activeTab === 2 && (
                <Box>
                    {/* KHUNG NHẬP LIỆU CHÍNH (Dùng cho Tạo mới và Sửa) */}
                    <Box id="main-discussion-form" mb={4} p={3} bgcolor="#f8f9fa" borderRadius={2} border={editingId ? "2px solid #1976d2" : "1px solid #eee"}>
                        <Typography variant="h6" mb={2} color={editingId ? "primary" : "text.primary"}>
                            {editingId ? "Chỉnh sửa nội dung" : "Đặt câu hỏi mới"}
                        </Typography>
                        <TextField 
                            fullWidth multiline rows={3} 
                            placeholder={editingId ? "Cập nhật nội dung..." : "Bạn đang thắc mắc điều gì? Hãy chia sẻ tại đây..."}
                            variant="outlined" sx={{ bgcolor: 'white' }} 
                            value={mainInputContent} onChange={(e) => setMainInputContent(e.target.value)}
                        />
                        <Box mt={2} display="flex" gap={2}>
                            <Button variant="contained" endIcon={editingId ? <Update /> : <Send />} sx={{ bgcolor: editingId ? '#1976d2' : '#1c1d1f' }} onClick={handleMainSubmit}>
                                {editingId ? "Cập nhật" : "Gửi câu hỏi"}
                            </Button>
                            {editingId && <Button variant="outlined" startIcon={<CancelIcon />} color="error" onClick={cancelEditing}>Hủy bỏ</Button>}
                        </Box>
                    </Box>

                    {/* DANH SÁCH THẢO LUẬN */}
                    {discussions && discussions.length > 0 ? discussions.map((disc) => (
                        <Box key={disc.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: editingId === disc.id ? '#e3f2fd' : 'white' }}>
                            <Box display="flex" gap={2} alignItems="flex-start">
                                <Avatar src={disc.user?.profileImageUrl} alt={disc.user?.firstName}>{(disc.user?.firstName && disc.user.firstName[0]) || "?"}</Avatar>
                                <Box flex={1}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {disc.user ? `${disc.user.lastName || ''} ${disc.user.firstName || ''}` : "Người dùng"}
                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 'normal' }}>
                                                • {disc.createdAt ? new Date(disc.createdAt).toLocaleString('vi-VN') : ""}
                                            </Typography>
                                        </Typography>
                                        
                                        {/* Actions cho Discussion Chính */}
                                        {currentUser && disc.user && (String(currentUser.id) === String(disc.user.id)) && (
                                            <Box>
                                                <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => startEditing(disc.id, disc.content)} color="primary"><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleDeleteAny(disc.id)} color="error"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                            </Box>
                                        )}
                                    </Box>

                                    <Typography variant="body1" mt={1} sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{disc.content}</Typography>

                                    <Button size="small" startIcon={<ReplyIcon fontSize="small"/>} sx={{ mt: 1, color: 'text.secondary', textTransform: 'none' }} onClick={() => setReplyingToId(replyingToId === disc.id ? null : disc.id)}>
                                        Trả lời
                                    </Button>

                                    {/* Form Trả Lời (Nhỏ) */}
                                    {replyingToId === disc.id && (
                                        <Box mt={2} ml={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                                            <TextField 
                                                fullWidth size="small" placeholder="Viết câu trả lời..." variant="outlined" sx={{ bgcolor: 'white', mb: 1 }}
                                                value={replyInputContent} onChange={(e) => setReplyInputContent(e.target.value)}
                                            />
                                            <Box display="flex" gap={1} justifyContent="flex-end">
                                                <Button size="small" onClick={() => setReplyingToId(null)}>Hủy</Button>
                                                <Button size="small" variant="contained" onClick={() => handleCreateReply(disc.id)}>Gửi</Button>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* DANH SÁCH REPLY */}
                                    {disc.replies && disc.replies.length > 0 && (
                                        <Box mt={2} ml={2} pl={2} borderLeft="2px solid #eee">
                                            {disc.replies.map((rep) => (
                                                <Box key={rep.id} mt={2} display="flex" gap={2} alignItems="flex-start" sx={{ bgcolor: editingId === rep.id ? '#e3f2fd' : 'transparent', p: editingId === rep.id ? 1 : 0, borderRadius: 1 }}>
                                                    <Avatar src={rep.user?.profileImageUrl} sx={{ width: 32, height: 32 }}>{(rep.user?.firstName && rep.user.firstName[0]) || "?"}</Avatar>
                                                    <Box flex={1} bgcolor={editingId === rep.id ? 'transparent' : "#f9f9f9"} p={editingId === rep.id ? 0 : 1.5} borderRadius={2}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <Typography variant="subtitle2" fontWeight="bold" fontSize="0.9rem">
                                                                {rep.user ? `${rep.user.lastName || ''} ${rep.user.firstName || ''}` : "Người dùng"}
                                                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                                    {rep.createdAt ? new Date(rep.createdAt).toLocaleString('vi-VN') : ""}
                                                                </Typography>
                                                            </Typography>

                                                            {/* Actions cho Reply (Dùng chung hàm handleDeleteAny và startEditing) */}
                                                            {currentUser && rep.user && (String(currentUser.id) === String(rep.user.id)) && (
                                                                <Box>
                                                                    <Tooltip title="Sửa trả lời"><IconButton size="small" onClick={() => startEditing(rep.id, rep.content)} sx={{ p: 0.5, color: '#bdbdbd', '&:hover': { color: '#1976d2' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                                    <Tooltip title="Xóa trả lời"><IconButton size="small" onClick={() => handleDeleteAny(rep.id)} sx={{ p: 0.5, color: '#bdbdbd', '&:hover': { color: '#d32f2f' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
                        <Box textAlign="center" py={4}><QuestionAnswer sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} /><Typography color="text.secondary">Chưa có thảo luận nào.</Typography></Box>
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