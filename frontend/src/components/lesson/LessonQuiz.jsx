import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl,
        CircularProgress, Card, CardContent, LinearProgress, Fade, Container } from '@mui/material';
import { getAllQuizzesForLessonAction, startQuizAttemptAction, submitQuizAttemptAction,
    clearQuizResult, getUserQuizAttemptsAction } from '../../Redux/Quiz/quiz.action';
import { getMyCertificatesAction } from '../../Redux/Certificate/certificate.action';
import { store } from '../../Redux/store';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const LessonQuiz = ({ lessonId, courseId, onNextLesson }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { quizzes, currentAttempt, loading, quizResult, userAttempts } = useSelector(store => store.quiz);
    const { myCertificates } = useSelector(store => store.certificate);

    // state quản lý vị trí bài thi hiện tại 0 -> n-1
    const [activeQuizIndex, setActiveQuizIndex] = useState(-1);
    // lưu đáp án học viên chọn
    const [answers, setAnswers] = useState({});
    // lưu điểm tạm thời để tính điểm cuối
    const [sessionStats, setSessionStats] = useState([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isDataReady, setIsDataReady] = useState(false);
    // kiểm tra xem học viên đã làm hết quiz chuwam nếu true thì không cho làm nữa
    const [isFlowFinished, setIsFlowFinished] = useState(false);
    
    const [hasStarted, setHasStarted] = useState(false); 

    useEffect(() => {
        if (lessonId) {
            //lấy danh sách quiz và lịch sử làm quiz của user
            dispatch(getAllQuizzesForLessonAction(lessonId));
            dispatch(getUserQuizAttemptsAction());
        }
        return () => {
            dispatch({ type: 'RESET_QUIZ_STATE' });
            dispatch(clearQuizResult());
        };
    }, [lessonId, dispatch]);

    // kiểm tra lịch sử làm
    useEffect(() => {

        if (loading) return;

        if (quizzes && quizzes.length === 0) {
            setIsDataReady(true);
            return;
        }

        if (userAttempts) {
            const firstIncompleteIndex = quizzes.findIndex(q => {
                const hasCompleted = userAttempts.some(a => 
                    a.quizId == q.id && (a.completedAt || a.score != null)
                );
                return !hasCompleted;
            });

            if (firstIncompleteIndex === -1) {
                setIsFlowFinished(true);
            } else {
                setActiveQuizIndex(firstIncompleteIndex);
                setIsFlowFinished(false);
            }
            
            setIsDataReady(true);
        }
    }, [quizzes, userAttempts, loading, hasStarted]);

    // Function check certificate sau khi hoàn thành quiz cuối cùng
    const checkForNewCertificate = async () => {
        if (!courseId) return; // Nếu không có courseId thì skip

        try {
            // Đợi một chút để backend xử lý (nếu backend tự động tạo certificate)
            setTimeout(async () => {
                // Lấy danh sách certificate mới nhất
                await dispatch(getMyCertificatesAction());
                
                // Lấy certificates từ store
                const currentCertificates = store.getState().certificate.myCertificates;
                
                // Tìm certificate của course này
                const courseCertificate = currentCertificates.find(
                    cert => cert.courseId === parseInt(courseId)
                );
                
                if (courseCertificate) {
                    // Có certificate → redirect sau 2 giây để user xem kết quả quiz
                    setTimeout(() => {
                        navigate(`/certificate?id=${courseCertificate.id}`);
                    }, 2000);
                }
            }, 2000); // Đợi 2 giây để backend xử lý
        } catch (error) {
            console.error("Failed to check certificate:", error);
        }
    };

    // chạy khi đang nộp bài và chuyển câu
    useEffect(() => {
        if (isSubmitting && quizResult) {
            const newStat = {
                score: quizResult.score,
                correctAnswers: quizResult.correctAnswers,
                totalQuestions: quizResult.totalQuestions
            };
            setSessionStats(prev => [...prev, newStat]);
            //reset trạng thái nộp
            dispatch(clearQuizResult());
            setIsSubmitting(false);

            // Check: Nếu là quiz cuối cùng và đã pass (score >= 60)
            const isLastQuiz = activeQuizIndex >= quizzes.length - 1;
            const isPassed = quizResult.score >= 60;
            
            if (isLastQuiz && isPassed && courseId) {
                // Hoàn thành quiz cuối cùng và đã pass → check certificate
                checkForNewCertificate();
            }

            if (activeQuizIndex < quizzes.length - 1) {
                //kiểm tra còn câu hỏi thì tăng index lên 1
                const nextIndex = activeQuizIndex + 1;
                setActiveQuizIndex(nextIndex);
                
                // gọi api tạo attempt mới cho câu tiếp theo
                dispatch(startQuizAttemptAction(quizzes[nextIndex].id));
                setAnswers({});
                window.scrollTo(0, 0);
            } else {
                setIsFlowFinished(true);
            }
        }
    }, [quizResult, isSubmitting, activeQuizIndex, quizzes, dispatch, courseId, navigate]);

    // ấn nút start thì sẽ gọi đến api start quiz và set hasStarted thành true để khóa lần vào làm kế tiếp
    const handleStartClick = () => {
        if (activeQuizIndex >= 0 && quizzes[activeQuizIndex]) {
            dispatch(startQuizAttemptAction(quizzes[activeQuizIndex].id));
            setHasStarted(true);
            setAnswers({});
        }
    };

    const handleOptionChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    // chấm điểm
    const handleNextOrFinish = () => {
        if (!currentAttempt?.attemptId) return;
        setIsSubmitting(true);
        dispatch(submitQuizAttemptAction(currentAttempt.attemptId, answers));
    };

    // dùng useMemo để tính điểm sau cùng
    const finalResult = useMemo(() => {
        if (!isFlowFinished || !quizzes) return null;

        if (sessionStats.length > 0) {
            const totalCorrect = sessionStats.reduce((acc, curr) => acc + curr.correctAnswers, 0);
            const totalQuestions = sessionStats.reduce((acc, curr) => acc + curr.totalQuestions, 0);
            const averageScore = sessionStats.reduce((acc, curr) => acc + curr.score, 0) / sessionStats.length;
            return { totalCorrect, totalQuestions, score: averageScore };
        }

        if (userAttempts?.length > 0) {
            const relevantAttempts = userAttempts.filter(att => quizzes.find(q => q.id === att.quizId));
            const totalScore = relevantAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
            return { 
                totalCorrect: null, 
                totalQuestions: null, 
                score: relevantAttempts.length ? (totalScore / relevantAttempts.length) : 0 
            };
        }
        return { totalCorrect: 0, totalQuestions: 0, score: 0 };
    }, [isFlowFinished, sessionStats, userAttempts, quizzes]);

    if (loading || (!isDataReady && !hasStarted)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 10, flexDirection:'column', alignItems:'center' }}>
                <CircularProgress sx={{ color: '#97A87A', mb: 2 }} />
                <Typography variant="caption" color="text.secondary">Loading status...</Typography>
            </Box>
        );
    }

    if (isDataReady && quizzes && quizzes.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Card elevation={0} sx={{ borderRadius: 4, textAlign: 'center', border: '1px solid #eee', p: 6 }}>
                    <Box sx={{ color: '#97A87A', mb: 2 }}>
                        <CheckCircleIcon sx={{ fontSize: 60 }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        No Quiz Required
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        This lesson doesn't have any quizzes. You can proceed to the next lesson directly.
                    </Typography>
                    
                    <Button variant="contained" fullWidth size="large" onClick={onNextLesson} 
                        sx={{ bgcolor: '#97A87A', borderRadius: 2, '&:hover': { bgcolor: '#7e8f63' } }} >
                        Next Lesson
                    </Button>
                </Card>
            </Container>
        );
    }

    // State để check certificate
    const [certificateChecked, setCertificateChecked] = useState(false);
    const [certificateId, setCertificateId] = useState(null);

    // Check certificate khi hoàn thành và pass
    useEffect(() => {
        if (isFlowFinished && finalResult?.score >= 60 && courseId && !certificateChecked) {
            const checkCert = async () => {
                try {
                    // Đợi một chút để backend xử lý
                    setTimeout(async () => {
                        await dispatch(getMyCertificatesAction());
                        const { myCertificates } = store.getState().certificate;
                        const cert = myCertificates.find(c => c.courseId === parseInt(courseId));
                        if (cert) {
                            setCertificateId(cert.id);
                        }
                        setCertificateChecked(true);
                    }, 2000);
                } catch (error) {
                    console.error("Failed to check certificate:", error);
                    setCertificateChecked(true);
                }
            };
            checkCert();
        }
    }, [isFlowFinished, finalResult, courseId, certificateChecked, dispatch]);

    if (isFlowFinished) {
        const passed = finalResult?.score >= 60;
        return (
            <Container maxWidth="sm" sx={{ py: 8, minWidth: '300px' }}>
                <Card elevation={0} sx={{ borderRadius: 4, textAlign: 'center', border: '1px solid #eee', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ bgcolor: passed ? '#e8f5e9' : '#fafafa', p: 6, pb: 8 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress variant="determinate" value={100} size={120} sx={{ color: 'rgba(0,0,0,0.05)' }} />
                            <CircularProgress variant="determinate" value={finalResult?.score || 0} size={120} thickness={4}
                                sx={{ color: passed ? '#4caf50' : '#97A87A', position: 'absolute', left: 0 }} />
                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="h4" fontWeight="bold" color="text.primary">
                                    {Math.round(finalResult?.score || 0)}%
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Typography variant="h5" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                            {passed ? "Lesson Completed!" : "Completed"}
                        </Typography>
                        
                        {finalResult.totalQuestions !== null && (
                            <Typography variant="body1" color="text.secondary">
                                Correct: <b>{finalResult.totalCorrect}</b> / <b>{finalResult.totalQuestions}</b>
                            </Typography>
                        )}
                    </Box>

                    <CardContent sx={{ position: 'relative', top: -30, px: 4 }}>
                        <Card sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#d32f2f' }}>
                                <LockIcon fontSize="small" />
                                <Typography variant="body2" fontWeight="600">
                                    Quiz is locked.
                                </Typography>
                             </Box>
                        </Card>
                        
                        {/* Nút Xem Certificate nếu có */}
                        {certificateId && (
                            <Button 
                                variant="contained" 
                                fullWidth 
                                size="large" 
                                onClick={() => navigate(`/certificate?id=${certificateId}`)}
                                sx={{ 
                                    bgcolor: '#d4af37', 
                                    borderRadius: 2, 
                                    mb: 2,
                                    fontWeight: 'bold',
                                    '&:hover': { bgcolor: '#b88a1e' }
                                }}
                            >
                                🎓 Xem Chứng Chỉ
                            </Button>
                        )}
                        
                        {/* Nút Next Lesson */}
                        <Button variant="contained" fullWidth size="large" onClick={onNextLesson} sx={{ bgcolor: '#97A87A', borderRadius: 2 }}>
                            Next Lesson
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    if (!hasStarted) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Card elevation={0} sx={{ 
                    borderRadius: 4, textAlign: 'center', border: '1px solid #eee', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)', p: 4 }}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                         <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#f1f5e9', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#97A87A' }}>
                             <PlayArrowIcon sx={{ fontSize: 40 }} />
                         </Box>
                    </Box>
                    
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Ready to start?
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, px: 2 }}>
                        You are about to start part <strong>{activeQuizIndex + 1}</strong> of <strong>{quizzes?.length}</strong>.
                        <br/>
                        Click the button below to begin.
                    </Typography>

                    <Button 
                        variant="contained" size="large" fullWidth
                        onClick={handleStartClick}
                        sx={{ bgcolor: '#97A87A', py: 1.5, borderRadius: 2, fontSize: '1.1rem', '&:hover': { bgcolor: '#7e8f63' } }}
                    >
                        Start Quiz
                    </Button>
                </Card>
            </Container>
        );
    }

    const currentQuizData = currentAttempt?.quiz;
    
    if (!currentQuizData || currentQuizData.id !== quizzes[activeQuizIndex]?.id) {
         return (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                <CircularProgress size={30} sx={{ color: '#97A87A' }} />
            </Box>
        );
    }

    const questions = currentQuizData.questions || [];
    const allQuestionsAnswered = questions.length > 0 && questions.every(q => answers[q.id]);
    const isLastQuiz = activeQuizIndex === quizzes.length - 1;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
             <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#888', fontWeight: 600 }}>PROGRESS</Typography>
                    <Typography variant="h6" fontWeight="bold" color={'#97A87A'}>
                        {activeQuizIndex + 1} <span style={{fontSize: '0.7em', color:'#aaa'}}>/ {quizzes.length}</span>
                    </Typography>
                </Box>
                <LinearProgress variant="determinate" value={((activeQuizIndex) / quizzes.length) * 100} 
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: '#97A87A' } }} />
            </Box>

            <Fade in={true} key={currentQuizData.id}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>{currentQuizData.title}</Typography>
                    {questions.map((q, index) => (
                        <Card key={q.id} elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>{q.questionText}</Typography>
                                <FormControl fullWidth>
                                    <RadioGroup value={answers[q.id] || ''} onChange={(e) => handleOptionChange(q.id, e.target.value)}>
                                        {q.options.map((option, i) => {
                                            const val = (i + 1).toString();
                                            const isSelected = answers[q.id] === val;
                                            return (
                                                <FormControlLabel key={i} value={val} control={<Radio sx={{ display: 'none' }} />}
                                                    label={
                                                        <Box sx={{
                                                            width: '100%', p: 2, borderRadius: 2, mb: 1,
                                                            border: isSelected ? `2px solid ${'#97A87A'}` : '1px solid #eee',
                                                            bgcolor: isSelected ? '#f7f9f5' : 'white'
                                                        }}>
                                                            <Typography fontWeight={isSelected ? 600 : 400}>{option}</Typography>
                                                        </Box>
                                                    } sx={{ m: 0, width: '100%' }} />
                                            );
                                        })}
                                    </RadioGroup>
                                </FormControl>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Fade>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" size="large"
                    disabled={!allQuestionsAnswered || isSubmitting}
                    onClick={handleNextOrFinish}
                    endIcon={isSubmitting ? <CircularProgress size={20} color="inherit"/> : (isLastQuiz ? <CheckCircleIcon /> : <NavigateNextIcon />)}
                    sx={{ bgcolor: '#97A87A', '&:hover': { bgcolor: '#7e8f63' } }}
                >
                    {isLastQuiz ? "Finish Quiz" : "Next Part"}
                </Button>
            </Box>
        </Container>
    );
};

export default LessonQuiz;