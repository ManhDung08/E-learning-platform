import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Avatar, Rating, LinearProgress } from '@mui/material';

const formatPrice = (price) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Thêm prop 'progress' vào đây
const CourseCard = ({ course, progress }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (course.slug) {
            navigate(`/course/${course.slug}`); // Trang chi tiết (giới thiệu)
        } else {
            navigate(`/course/${course.id}`);
        }
    };

    // Nếu có prop 'progress' (số), nghĩa là đang ở trang MyCourses -> Chuyển hướng vào học luôn
    const handleContinueLearning = (e) => {
        e.stopPropagation();
        navigate(`/my-course/course/learn/${course.id}`);
    };

    const instructorName = course.instructor
        ? `${course.instructor.lastName} ${course.instructor.firstName}` 
        : 'Instructor';

    const instructorAvatar = course.instructor?.profileImageUrl
        || 'https://www.w3schools.com/howto/img_avatar.png';

    // Xử lý dữ liệu Rating
    const ratingValue = Number(course.averageRating) || 0;
    const reviewCount = course.reviewCount || 0; 
    
    // Kiểm tra xem có phải đang hiển thị trong trang "Khóa học của tôi" không
    // (Dựa vào việc prop progress có được truyền vào hay không)
    const isMyCourse = typeof progress === 'number';

    return (
        <Card 
            onClick={isMyCourse ? handleContinueLearning : handleCardClick}
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: '350px' },
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.12)',
                },
                position: 'relative'
            }}
        >
            <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: '#f0f0f0' }}>
                <CardMedia
                    component="img"
                    image={course.image || ''}
                    alt={course.title}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                <Typography variant="h6" component="div" sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    mb: 1,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '44px'
                }}>
                    {course.title}
                </Typography>

                {/* Thông tin giảng viên */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar src={instructorAvatar} sx={{ width: 24, height: 24 }} />
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {instructorName}
                    </Typography>
                </Box>

                {/* --- RATING: Chỉ hiển thị nếu > 0 --- */}
                {ratingValue > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#b4690e', fontSize: '0.9rem' }}>
                            {ratingValue.toFixed(1)}
                        </Typography>
                        <Rating 
                            name="read-only" 
                            value={ratingValue} 
                            readOnly 
                            precision={0.5} 
                            size="small"
                            sx={{ color: '#e59819' }}
                        />
                        {reviewCount > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                ({reviewCount})
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Nếu không có rating thì dùng margin để đẩy nội dung cho đều (tùy chọn) */}
                {ratingValue === 0 && <Box sx={{ mb: 1.5 }} />}

                <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2,
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: '0.85rem'
                }}>
                    {course.description}
                </Typography>

                {/* --- FOOTER: Hiển thị Tiến độ (nếu là MyCourse) HOẶC Giá (nếu là Store) --- */}
                <Box sx={{ 
                    borderTop: '1px solid #eee', 
                    pt: 1.5, 
                    mt: 'auto'
                }}>
                    {isMyCourse ? (
                        // Giao diện cho trang "Khóa học của tôi"
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                    {progress === 100 ? 'Completed' : `${progress}% Complete`}
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                sx={{ 
                                    height: 6, 
                                    borderRadius: 5,
                                    bgcolor: '#e2e8f0',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: progress === 100 ? '#4caf50' : '#97A87A'
                                    }
                                }} 
                            />
                        </Box>
                    ) : (
                        // Giao diện cho trang "Cửa hàng / Tìm kiếm"
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#608f4d' }}>
                                {formatPrice(course.priceVND)}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#999', fontSize: '12px' }}>
                                <Typography variant="caption">{course.totalLessons || 0} lessons</Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default CourseCard;