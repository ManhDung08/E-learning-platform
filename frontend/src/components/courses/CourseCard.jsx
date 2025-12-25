import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Avatar, LinearProgress } from '@mui/material';

const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const CourseCard = ({ course, progress }) => {
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

    // Determine if we should show the progress bar
    // We show it if 'progress' prop is passed and is a valid number
    const showProgress = typeof progress === 'number';

    return (
        <Card 
            onClick={handleCardClick}
            sx={{
                width: '280px', 
                minWidth: '280px',
                maxWidth: '280px',
                height: '380px', 
                minHeight: '380px',
                maxHeight: '380px',
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.12)',
                },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box sx={{ height: '160px', bgcolor: '#f0f0f0', flexShrink: 0, position: 'relative' }}>
                <CardMedia
                    component="img"
                    image={course.image || ''}
                    alt={course.title}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
                {/* Optional: Overlay for enrolled courses */}
                {showProgress && (
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', bgcolor: 'rgba(0,0,0,0.6)', p: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', ml: 1 }}>
                            {progress === 100 ? 'Completed' : `${Math.round(progress)}% Complete`}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Show Linear Progress Bar right below image if progress exists */}
            {showProgress && (
                <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                        height: 4, 
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: progress === 100 ? '#4caf50' : '#1976d2' // Green if done, Blue if in progress
                        }
                    }} 
                />
            )}

            <CardContent sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                p: 2,
                height: showProgress ? 'calc(380px - 164px)' : 'calc(380px - 160px)', // Adjust height calculation slightly
                overflow: 'hidden'
            }}>
                <Typography variant="h6" component="div" sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    mb: 1,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '42px',
                    flexShrink: 0
                }}>
                    {course.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexShrink: 0 }}>
                    <Avatar src={instructorAvatar} sx={{ width: 24, height: 24 }} />
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '200px' }}>
                        {instructorName}
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2,
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                    textOverflow: 'ellipsis'
                }}>
                    {course.description}
                </Typography>

                <Box sx={{ 
                    borderTop: '1px solid #eee', 
                    pt: 1.5, 
                    mt: 'auto',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    {/* Hide price if enrolled/progress shown, or keep it. Often for enrolled courses price is irrelevant. */}
                    {!showProgress ? (
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#608f4d' }}>
                            {formatPrice(course.priceVND)}
                        </Typography>
                    ) : (
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2' }}>
                            {progress === 100 ? 'Review Course' : 'Continue Learning'}
                        </Typography>
                    )}

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