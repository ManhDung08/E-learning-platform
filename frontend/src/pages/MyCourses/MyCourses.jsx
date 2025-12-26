import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Button, Paper, IconButton, Chip, Stack } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { getUserEnrollmentsAction } from '../../Redux/Course/course.action';
import CourseCard from '../../components/courses/CourseCard'; 

// Removed axios instance since we are not using the certificate API anymore

const CourseRow = ({ title, courses, emptyMessage, icon }) => {
    const scrollRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 0);
            setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [courses]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const amount = 350;
            const newLeft = direction === 'left' ? scrollRef.current.scrollLeft - amount : scrollRef.current.scrollLeft + amount;
            scrollRef.current.scrollTo({ left: newLeft, behavior: 'smooth' });
        }
    };

    if (!courses || courses.length === 0) {
        return (
            <Box sx={{ py: 6, textAlign: 'center', opacity: 0.6, bgcolor: '#fff', borderRadius: 2, border: '1px dashed #e2e8f0', mb: 3 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {icon} {title}
                </Typography>
                <Typography variant="body2">{emptyMessage}</Typography>
            </Box>
        );
    }

    return (
        <div className='p-4 pt-2' style={{ paddingLeft: 0, paddingRight: 0, marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {icon} {title} <Chip label={courses.length} size="small" sx={{ bgcolor: '#e2e8f0', fontWeight: 'bold' }} />
                </h2>
            </div>

            <div style={{ overflow: 'hidden', position: 'relative' }}>
                {showLeft && (
                    <IconButton onClick={() => scroll('left')} sx={{ position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { bgcolor: '#f5f5f5' }, width: 40, height: 40 }}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
                {showRight && (
                    <IconButton onClick={() => scroll('right')} sx={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { bgcolor: '#f5f5f5' }, width: 40, height: 40 }}>
                        <ChevronRightIcon />
                    </IconButton>
                )}

                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '20px', paddingLeft: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
                    className="scrollbar-hide"
                >
                    {courses.map((courseData) => (
                        <div key={courseData.id} style={{ minWidth: '290px', flexShrink: 0 }}>
                            <CourseCard 
                                course={courseData} 
                                progress={courseData.progress || 0} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MyCourses = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { userEnrollments, loading } = useSelector(store => store.course);

    useEffect(() => {
        dispatch(getUserEnrollmentsAction()); 
    }, [dispatch]);

    const { inProgressCourses, finishedCourses } = useMemo(() => {
        if (!userEnrollments) return { inProgressCourses: [], finishedCourses: [] };
        
        const finished = [];
        const inProgress = [];

        userEnrollments.forEach(enrollment => {
            const courseData = enrollment.course;
            console.log("debug:", courseData);
            
            if (courseData) {
                if (courseData.progress === 100) {
                    finished.push(courseData);
                } else {
                    inProgress.push(courseData);
                }
            }
        });

        return { inProgressCourses: inProgress, finishedCourses: finished };
    }, [userEnrollments]);

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
                        p: 4, mb: 5, borderRadius: 4, 
                        background: 'linear-gradient(120deg, #ffffff 0%, #f0fdf4 100%)',
                        border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
                        <Typography variant="h3" fontWeight="800" sx={{ color: '#1a202c', mb: 1 }}>My Learning</Typography>
                        <Typography variant="body1" sx={{ color: '#4a5568', fontSize: '1.1rem', lineHeight: 1.6 }}>
                            You have <strong>{inProgressCourses.length}</strong> courses in progress and <strong>{finishedCourses.length}</strong> completed.
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' }, opacity: 0.1, transform: 'rotate(-15deg)', mr: 4 }}>
                        <AutoStoriesIcon sx={{ fontSize: 180, color: '#4c6b58' }} />
                    </Box>
                </Paper>

                <Stack spacing={6}>
                    {inProgressCourses.length >= 0 && (
                        <CourseRow 
                            title="Continue Learning" 
                            courses={inProgressCourses} 
                            icon={<PlayCircleOutlineIcon sx={{ color: '#4c6b58' }} />}
                            emptyMessage="You have no courses in progress." 
                        />
                    )}

                    <Box>
                        <CourseRow 
                            title="Finished Courses" 
                            courses={finishedCourses} 
                            icon={<EmojiEventsIcon sx={{ color: '#ecc94b' }} />}
                            emptyMessage="You haven't finished any courses yet. Keep going!" 
                        />
                    </Box>
                </Stack>

                {inProgressCourses.length === 0 && finishedCourses.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 4, border: '1px dashed #cbd5e0', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                        <Box sx={{ bgcolor: '#f0fdf4', p: 3, borderRadius: '50%', mb: 2 }}>
                            <SchoolIcon sx={{ fontSize: 40, color: '#4c6b58' }} />
                        </Box>
                        <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">No courses enrolled yet</Typography>
                        <Button variant="contained" size="large" startIcon={<PlayCircleOutlineIcon />} onClick={() => navigate('/')} sx={{ bgcolor: '#4c6b58', borderRadius: '50px', px: 4, py: 1.5, textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#3a5243' } }}>
                            Browse Courses
                        </Button>
                    </Box>
                )}

            </Container>
        </Box>
    );
};

export default MyCourses;