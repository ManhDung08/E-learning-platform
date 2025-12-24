import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, Typography, Card, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Avatar, 
    LinearProgress, MenuItem, Select, FormControl, InputLabel, Stack 
} from '@mui/material';
import { getInstructorCoursesAction, getEnrolledStudentsAction } from '../../Redux/Course/course.action';

const MyStudents = () => {
    const dispatch = useDispatch();
    const [selectedCourse, setSelectedCourse] = useState('');
    
    const { instructorCourses, enrolledStudents, loading } = useSelector(store => store.course);
    const customColor = '#97A87A';

    useEffect(() => {
        dispatch(getInstructorCoursesAction());
    }, [dispatch]);

    useEffect(() => {
        if (instructorCourses.length > 0 && !selectedCourse) {
            setSelectedCourse(instructorCourses[0].id);
        }
    }, [instructorCourses, selectedCourse]);

    useEffect(() => {
        if (selectedCourse) {
            dispatch(getEnrolledStudentsAction(selectedCourse));
        }
    }, [selectedCourse, dispatch]);

    const handleCourseChange = (event) => {
        setSelectedCourse(event.target.value);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Học viên của tôi
            </Typography>

            {/* Bộ lọc khóa học */}
            <Card sx={{ p: 2, mb: 3 }}>
                <FormControl fullWidth sx={{ maxWidth: 400 }}>
                    <InputLabel>Chọn khóa học để xem học viên</InputLabel>
                    <Select
                        value={selectedCourse}
                        label="Chọn khóa học để xem học viên"
                        onChange={handleCourseChange}
                    >
                        {instructorCourses.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                                {course.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Card>

            {/* Bảng danh sách học viên */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Học viên</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Ngày tham gia</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tiến độ học tập</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">% Hoàn thành</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} align="center">Đang tải...</TableCell></TableRow>
                        ) : enrolledStudents.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center">Chưa có học viên nào đăng ký khóa học này.</TableCell></TableRow>
                        ) : (
                            enrolledStudents.map((item) => (
                                <TableRow key={item.enrollmentId} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={item.student.profileImageUrl}>
                                                {item.student.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {item.student.firstName} {item.student.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {item.student.email}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(item.enrolledAt).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell sx={{ width: '30%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{ width: '100%', mr: 1 }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={item.progress.progressPercentage} 
                                                    sx={{ 
                                                        height: 8, 
                                                        borderRadius: 5,
                                                        bgcolor: '#eee',
                                                        '& .MuiLinearProgress-bar': { bgcolor: customColor }
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="caption">
                                                {item.progress.completedLessons}/{item.progress.totalLessons}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" fontWeight="bold" color={customColor}>
                                            {item.progress.progressPercentage}%
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MyStudents;