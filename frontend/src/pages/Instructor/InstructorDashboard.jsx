import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, Grid, Typography, Stack, Avatar, Divider, 
    List, ListItem, ListItemAvatar, ListItemText, 
    Paper, Button, alpha, Chip, Skeleton 
} from '@mui/material';
import { MenuBook, People, ChevronRight, Add } from '@mui/icons-material';
import { getInstructorCoursesAction } from '../../Redux/Course/course.action';

const InstructorDashboard = () => {
    const dispatch = useDispatch();
    
    const { instructorCourses = [], loading } = useSelector(store => store.course);
    const { user } = useSelector(store => store.auth);
    
    const primaryColor = '#97A87A'; 

    useEffect(() => {
        dispatch(getInstructorCoursesAction());
    }, [dispatch]);

    const totalCourses = instructorCourses?.length || 0;

    const totalStudents = instructorCourses?.reduce((acc, course) => {
        const count = course.enrollmentCount || (course.enrollments?.length) || 0;
        return acc + count;
    }, 0);


    const stats = [
        { label: 'Khóa học', value: totalCourses, icon: <MenuBook />, color: '#6366f1' },
        { label: 'Học viên', value: totalStudents, icon: <People />, color: '#10b981' },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fdfdfd', minHeight: '100vh' }}>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }} spacing={2}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2027', letterSpacing: '-0.5px' }}>
                        Dashboard Instructor
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#546E7A', mt: 0.5, ml: 2 }}>
                        Chào mừng trở lại, <span style={{ color: primaryColor, fontWeight: 700 }}>{user?.firstName || 'Giảng viên'}</span>! 
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid size={{xs: 12, sm: 4}}  key={index}>
                        <Paper elevation={0} sx={{ 
                            p: 3, borderRadius: '16px', border: '1px solid #EFF2F5',
                            display: 'flex', alignItems: 'center',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': { boxShadow: '0 12px 24px rgba(0,0,0,0.04)', transform: 'translateY(-2px)' }
                        }}>
                            <Avatar sx={{ 
                                bgcolor: alpha(stat.color, 0.1), color: stat.color,
                                width: 52, height: 52, borderRadius: '12px', mr: 2
                            }}>
                                {stat.icon}
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2027' }}>
                                    {loading ? <Skeleton width={40} /> : stat.value}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#90A4AE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {stat.label}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #EFF2F5' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Khóa học mới nhất</Typography>
                        </Stack>
                        
                        <List disablePadding>
                            {loading ? (
                                [1, 2, 3].map((i) => <Skeleton key={i} height={80} sx={{ mb: 1 }} />)
                            ) : instructorCourses.length === 0 ? (
                                <Typography sx={{ py: 4, textAlign: 'center', color: '#90A4AE' }}>Bạn chưa có khóa học nào.</Typography>
                            ) : (
                                instructorCourses.slice(0, 4).map((course, idx) => (
                                    <ListItem key={course.id} sx={{ 
                                        px: 0, py: 2, borderBottom: idx !== 3 ? '1px solid #F1F3F5' : 'none' 
                                    }}>
                                        <ListItemAvatar sx={{ mr: 2 }}>
                                            <Avatar 
                                                variant="rounded" 
                                                src={course.image || course.thumbnailUrl}
                                                sx={{ width: 84, height: 56, borderRadius: '8px' }} 
                                            />
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#2D3748' }}>{course.title}</Typography>}
                                            secondary={
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <Typography variant="caption" sx={{ color: '#718096' }}>
                                                        • {course.enrollmentCount || course.enrollments?.length || 0} học viên
                                                    </Typography>
                                                </Stack>
                                            }
                                        />
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                                {course.priceVND ? `${course.priceVND.toLocaleString()}đ` : 'Miễn phí'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#48BB78', fontWeight: 700 }}>Hoạt động</Typography>
                                        </Box>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4} size={{xs: 12, lg: 4}}>
                    <Stack spacing={3}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #EFF2F5' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Lưu ý</Typography>
                            <Box sx={{ p: 2, bgcolor: '#F7FAFC', borderRadius: '12px', borderLeft: `4px solid ${primaryColor}` }}>
                                <Typography variant="body2" sx={{ color: '#4A5568', fontStyle: 'italic' }}>
                                    "Dưới ánh mặt trời không có nghề nào cao quý hơn nghề dạy học"
                                </Typography>
                            </Box>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default InstructorDashboard;