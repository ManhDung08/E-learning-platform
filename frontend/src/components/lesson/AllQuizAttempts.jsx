import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Avatar, Chip, Button, MenuItem, Select, FormControl } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { getAllAttemptsOfQuizAction, getAllQuizzesForLessonAction } from '../../Redux/Quiz/quiz.action';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const AllQuizAttempts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { quizId } = useParams();

    const passedLessonId = location.state?.lessonId;
    console.log(passedLessonId);
    
    const { user } = useSelector(store => store.auth);
    const role = user?.role || 'instructor'; 

    const { instructorQuizAttempts, quizzes, loading } = useSelector(store => store.quiz);

    // lưu trạng thái để chuyển bảng quiz
    const [currentQuizId, setCurrentQuizId] = useState(quizId);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    //lấy danh sách quiz của lesson
    useEffect(() => {
        if (passedLessonId) {
            dispatch(getAllQuizzesForLessonAction(passedLessonId));
        }
    }, [passedLessonId, dispatch]);

    //lấy attempts của quiz mỗi khi quizid hiện tại thay đổi
    useEffect(() => {
        if (currentQuizId) {
            dispatch(getAllAttemptsOfQuizAction(currentQuizId));
        }
    }, [currentQuizId, dispatch]);

    useEffect(() => {
        if(quizId) 
            setCurrentQuizId(quizId);
    }, [quizId]);

    const handleSwitchQuiz = (event) => {
        const newQuizId = event.target.value;
        setCurrentQuizId(newQuizId);

        const prefix = role === 'admin' ? '/admin' : '/instructor';
        navigate(`${prefix}/quiz/${newQuizId}/attempts`, { state: { lessonId: passedLessonId } });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const columns = useMemo(() => {
        const baseColumns = [
            ...(role === 'admin' ? [{ 
                field: 'userId', headerName: 'User ID', width: 90, 
                valueGetter: (value, row) => row?.user?.id 
            }] : []),

            { 
                field: 'student', headerName: 'Student', flex: 1, minWidth: 250,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
                        {/* do không trả về kèm avt image nên để tạm tên */}
                        <Avatar src={params.row.user?.profileImageUrl} sx={{ bgcolor: '#97A87A', width: 32, height: 32, fontSize: '0.8rem' }}>
                            {params.row.user?.firstName?.charAt(0) || "U"}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight="600">
                                {params.row.user?.firstName} {params.row.user?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                                {params.row.user?.email}
                            </Typography>
                        </Box>
                    </Box>
                )
            },
            { 
                field: 'status', headerName: 'Status', 
                width: 150, align: 'center', headerAlign: 'center',
                renderCell: (params) => {
                    const isCompleted = !!params.row.completedAt;
                    return (
                        <Chip 
                            icon={isCompleted ? <CheckCircleIcon style={{fontSize: 16}} /> : <PendingIcon style={{fontSize: 16}} />} 
                            label={isCompleted ? "Completed" : "In Progress"} 
                            size="small" variant="outlined" 
                            sx={{ 
                                fontWeight: 'bold', fontSize: '0.75rem',
                                bgcolor: isCompleted ? '#e8f5e9' : '#fff3e0', 
                                borderColor: isCompleted ? '#c8e6c9' : '#ffe0b2', 
                                color: isCompleted ? '#2e7d32' : '#ef6c00',
                                minWidth: 100 
                            }}
                        />
                    );
                }
            },
            { 
                field: 'score', headerName: 'Score', width: 120, align: 'center', headerAlign: 'center',
                renderCell: (params) => {
                    if (!params.row.completedAt) return "-";
                    const score = Math.round(params.row.score);
                    return (
                        <Typography fontWeight="bold" color={score >= 50 ? "success.main" : "error.main"} sx={{paddingTop: '12px'}}>
                            {score}%
                        </Typography>
                    );
                }
            },
            { 
                field: 'submittedAt', headerName: 'Submitted At', width: 180,
                align: 'right', headerAlign: 'right',
                valueGetter: (value, row) => formatDate(row?.completedAt)
            }
        ];
        return baseColumns;
    }, [role]);

    const handleGoBack = () => {
        if (role === 'admin') navigate('/admin/courses');
        else navigate('/instructor/courses');
    };

    const CustomToolbar = () => (
        <GridToolbarContainer sx={{ p: 1 }}>
            <GridToolbarExport sx={{ color: '#97A87A' }} />
        </GridToolbarContainer>
    );

    return (
        <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'transparent' }}>
            <Box mb={3}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={handleGoBack}
                    sx={{ color: '#666', borderRadius: '24px', mb: 2, textTransform: 'none', '&:hover': { bgcolor: '#f0f0f0' } }}
                >
                    Back to Courses
                </Button>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            Quiz Attempts Management
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={1}>
                            <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                                Currently viewing: 
                            </Typography>
                            
                            {passedLessonId && quizzes && quizzes.length > 0 ? (
                                <FormControl variant="standard" sx={{ minWidth: 200 }}>
                                    <Select
                                        value={currentQuizId}
                                        onChange={handleSwitchQuiz}
                                        disableUnderline
                                        sx={{ 
                                            fontSize: '1.1rem', 
                                            fontWeight: 'bold', 
                                            color: '#97A87A',
                                            '& .MuiSelect-select': { py: 0.5, px: 1 }
                                        }}
                                    >
                                        {quizzes.map((q) => (
                                            <MenuItem key={q.id} value={q.id}>
                                                {q.title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : (
                                <Typography fontWeight="bold" color='#97A87A' sx={{ pt: 1 }}>
                                    Quiz ID: {currentQuizId}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper sx={{ p: 1.5, px: 3, borderRadius: '24px', bgcolor: '#f1f5eb',
                            color: '#97A87A' }}>
                            <Typography variant="caption" fontWeight="bold" sx={{opacity: 0.8}}>TOTAL ATTEMPTS</Typography>
                            <Typography variant="h5" fontWeight="bold">{instructorQuizAttempts?.length || 0}</Typography>
                        </Paper>
                    </Box>
                </Box>
            </Box>

            <Paper sx={{ height: 600, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden', border: '1px solid #eee' }}>
                <DataGrid rows={instructorQuizAttempts || []}
                    columns={columns} loading={loading}
                    getRowId={(row) => row.id} paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 20, 50]}
                    disableRowSelectionOnClick
                    slots={{ toolbar: CustomToolbar }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': { 
                            bgcolor: '#f9f9f9', 
                            color: '#444',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            borderBottom: '1px solid #eee'
                        },
                        '& .MuiDataGrid-cell': { 
                            borderBottom: '1px solid #f5f5f5',
                            fontSize: '0.875rem'
                        },
                        '& .MuiDataGrid-cell:focus': { outline: 'none' },
                        '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
                    }}
                />
            </Paper>
        </Paper>
    );
};

export default AllQuizAttempts;