import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Button,Paper,Avatar } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories'; // Icon trang trí

import { getUserEnrollmentsAction } from '../../Redux/Course/course.action';

import CourseCard from '../../components/courses/CourseCard'; 

const MyCourses = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { userEnrollments, loading } = useSelector(store => store.course);

    useEffect(() => {
        dispatch(getUserEnrollmentsAction()); 
    }, [dispatch]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress size={50} sx={{ color: '#4c6b58' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8f9fa', py: 5 }}>
            <Container maxWidth="xl">
                
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 4, 
                        mb: 5, 
                        borderRadius: 4, 
                        background: 'linear-gradient(120deg, #ffffff 0%, #f0fdf4 100%)',
                        border: '1px solid #eef2f6',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
                        <Typography variant="h3" fontWeight="800" sx={{ color: '#1a202c', mb: 1 }}>
                            My Learning
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#4a5568', fontSize: '1.1rem', lineHeight: 1.6 }}>
                            Welcome back! You have <strong>{userEnrollments?.length || 0}</strong> courses in progress. 
                            <br />
                            Keep up the momentum and reach your goals.
                        </Typography>
                    </Box>

                    <Box sx={{ 
                        display: { xs: 'none', md: 'block' }, 
                        opacity: 0.1, 
                        transform: 'rotate(-15deg)',
                        mr: 4
                    }}>
                        <AutoStoriesIcon sx={{ fontSize: 180, color: '#4c6b58' }} />
                    </Box>
                </Paper>

                <div className='p-4 pt-2' style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <h2 style={{fontSize: '24px', fontWeight: '700', margin: 0, color: '#2d3748'}}>
                            Continue Watching
                        </h2>
                    </div>

                    {userEnrollments && userEnrollments.length > 0 ? (
                        <div style={{ overflow: 'hidden', position: 'relative'}}>
                            <div style={{ 
                                display: 'flex', 
                                gap: '24px', 
                                overflowX: 'auto', 
                                paddingBottom: '20px',
                                paddingLeft: '4px',
                                scrollbarWidth: 'none', 
                                msOverflowStyle: 'none'
                            }}
                            className="scrollbar-hide"
                            >
                                {userEnrollments.map((item) => {
                                    const courseData = item.course;
                                    const progressValue = courseData.progress !== undefined ? courseData.progress : 0;

                                    return (
                                        <div key={item.id} style={{ minWidth: '290px' }}>
                                            <CourseCard 
                                                course={courseData} 
                                                isEnrolled={true} 
                                                progress={progressValue}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <Box sx={{ 
                            textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 4, 
                            border: '1px dashed #cbd5e0',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <Box sx={{ bgcolor: '#f0fdf4', p: 3, borderRadius: '50%', mb: 2 }}>
                                <SchoolIcon sx={{ fontSize: 40, color: '#4c6b58' }} />
                            </Box>
                            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
                                No courses enrolled yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={4} maxWidth="400px">
                                You haven't started any courses yet. Browse our library to find your next learning adventure.
                            </Typography>
                            <Button 
                                variant="contained" 
                                size="large"
                                startIcon={<PlayCircleOutlineIcon />}
                                onClick={() => navigate('/')}
                                sx={{ 
                                    bgcolor: '#4c6b58', borderRadius: '50px', px: 4, py: 1.5,
                                    textTransform: 'none', fontWeight: 'bold', boxShadow: 'none',
                                    '&:hover': { bgcolor: '#3a5243', boxShadow: '0 4px 12px rgba(76, 107, 88, 0.2)' }
                                }}
                            >
                                Browse Courses
                            </Button>
                        </Box>
                    )}
                </div>

            </Container>
        </Box>
    );
};

export default MyCourses;