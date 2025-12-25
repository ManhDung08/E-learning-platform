import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Avatar } from '@mui/material';

const formatPrice = (price) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (course.slug) {
            navigate(`/course/${course.slug}`);
        } else {
            navigate(`/course/${course.id}`);
        }
    };

    const instructorName = course.instructor
        ? `${course.instructor.lastName} ${course.instructor.firstName}` 
        : 'Instructor';

    const instructorAvatar = course.instructor?.profileImageUrl
        || 'https://www.w3schools.com/howto/img_avatar.png';

    return (
        <Card 
            onClick={handleCardClick}
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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Avatar src={instructorAvatar} sx={{ width: 24, height: 24 }} />
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {instructorName}
                    </Typography>
                </Box>

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

                <Box sx={{ 
                    borderTop: '1px solid #eee', 
                    pt: 1.5, 
                    mt: 'auto',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#608f4d' }}>
                        {formatPrice(course.priceVND)}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#999', fontSize: '12px' }}>
                        <i className="fa-regular fa-file-lines" style={{ fontSize: '12px' }}></i>
                        <Typography variant="caption">{course.totalLessons || 0} lessons</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CourseCard;