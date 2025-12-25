import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl,
        CircularProgress, Card, CardContent, LinearProgress, Fade, Container } from '@mui/material';
import { getAllQuizzesForLessonAction, startQuizAttemptAction, submitQuizAttemptAction,
    clearQuizResult, getUserQuizAttemptsAction } from '../../Redux/Quiz/quiz.action';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';

const LessonQuiz = ({ lessonId, onNextLesson, onQuizComplete, isLastLesson = false, isVideoCompleted = false }) => {
    const dispatch = useDispatch();
    const { quizzes, currentAttempt, loading, quizResult, userAttempts } = useSelector(store => store.quiz);
    // Debug log to verify isLastLesson prop
    console.log('LessonQuiz rendered - lessonId:', lessonId, 'isLastLesson:', isLastLesson);
    // state quản lý vị trí bài thi hiện tại 0 -> n-1
    const [activeQuizIndex, setActiveQuizIndex] = useState(-1);
    // lưu đáp án học viên chọn
    const [answers, setAnswers] = useState({});
    // lưu điểm tạm thời để tính điểm cuối
    const [sessionStats, setSessionStats] = useState([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isDataReady, setIsDataReady] = useState(false);
    // kiểm tra xem học viên đã làm hết quiz chuwam nếu true thì không cho làm nữa
    const [isFlowFinished, setIsFlowFinished] = useState(false);
    
    const [hasStarted, setHasStarted] = useState(false); 

    useEffect(() => {
        if (lessonId) {
            //lấy danh sách quiz và lịch sử làm quiz của user
            dispatch(getAllQuizzesForLessonAction(lessonId));
            dispatch(getUserQuizAttemptsAction());
        }
        return () => {
            dispatch({ type: 'RESET_QUIZ_STATE' });
            dispatch(clearQuizResult());
        };
    }, [lessonId, dispatch]);

    // kiểm tra lịch sử làm
    useEffect(() => {
        if (loading) return;
        
        // Don't reset activeQuizIndex if user has already started taking quizzes
        // This prevents race condition where stale userAttempts resets the index
        if (hasStarted) return;

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

    // chạy khi đang nộp bài và chuyển câu
    useEffect(() => {
        if (isSubmitting && quizResult) {
            const newStat = {
                score: quizResult.score,
                correctAnswers: quizResult.correctAnswers,
                totalQuestions: quizResult.totalQuestions
            };
            setSessionStats(prev => [...prev, newStat]);
            //reset trạng thái nộp
            dispatch(clearQuizResult());
            setIsSubmitting(false);

            if (activeQuizIndex < quizzes.length - 1) {
                //kiểm tra còn câu hỏi thì tăng index lên 1
                const nextIndex = activeQuizIndex + 1;
                setActiveQuizIndex(nextIndex);
                
                // gọi api tạo attempt mới cho câu tiếp theo
                dispatch(startQuizAttemptAction(quizzes[nextIndex].id));
                setAnswers({});
                window.scrollTo(0, 0);
            } else {
                setIsFlowFinished(true);
                // Call onQuizComplete when all quizzes are finished
                if (onQuizComplete) {
                    onQuizComplete();
                }
            }
        }
    }, [quizResult, isSubmitting, activeQuizIndex, quizzes, dispatch, onQuizComplete]);

    // ấn nút start thì sẽ gọi đến api start quiz và set hasStarted thành true để khóa lần vào làm kế tiếp
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

    // chấm điểm
    const handleNextOrFinish = () => {
        if (!currentAttempt?.attemptId) return;
        setIsSubmitting(true);
        dispatch(submitQuizAttemptAction(currentAttempt.attemptId, answers));
    };

    // Retry quiz - reset all state and start from the first quiz
    const handleRetryQuiz = () => {
        // Reset all state
        setActiveQuizIndex(0);
        setAnswers({});
        setSessionStats([]);
        setIsFlowFinished(false);
        setHasStarted(true);
        
        // Start a new attempt for the first quiz (POST /api/quiz/:quizId/attempts)
        if (quizzes && quizzes.length > 0) {
            dispatch(startQuizAttemptAction(quizzes[0].id));
        }
        
        window.scrollTo(0, 0);
    };

    // dùng useMemo để tính điểm sau cùng
    const finalResult = useMemo(() => {
        if (!isFlowFinished || !quizzes) return null;

        if (sessionStats.length > 0) {
            const totalCorrect = sessionStats.reduce((acc, curr) => acc + curr.correctAnswers, 0);
            const totalQuestions = sessionStats.reduce((acc, curr) => acc + curr.totalQuestions, 0);
            // Calculate score as percentage of total correct answers, not average of percentages
            const score = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
            return { totalCorrect, totalQuestions, score };
        }

        if (userAttempts?.length > 0) {
            // Filter attempts for this lesson's quizzes only
            const relevantAttempts = userAttempts.filter(att => quizzes.find(q => q.id === att.quizId));
            
            // Get only the LATEST attempt for each quiz (users may have multiple attempts from retries)
            // Group by quizId and keep only the most recent one (highest ID or most recent completedAt)
            const latestAttemptsByQuiz = {};
            relevantAttempts.forEach(att => {
                const existing = latestAttemptsByQuiz[att.quizId];
                if (!existing || 
                    (att.completedAt && existing.completedAt && new Date(att.completedAt) > new Date(existing.completedAt)) ||
                    (att.id > existing.id)) {
                    latestAttemptsByQuiz[att.quizId] = att;
                }
            });
            
            const latestAttempts = Object.values(latestAttemptsByQuiz);
            const totalScore = latestAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
            
            return { 
                totalCorrect: null, 
                totalQuestions: null, 
                score: latestAttempts.length ? (totalScore / latestAttempts.length) : 0 
            };
        }
        return { totalCorrect: 0, totalQuestions: 0, score: 0 };
    }, [isFlowFinished, sessionStats, userAttempts, quizzes]);

    // Show locked state if video is not completed
    if (!isVideoCompleted) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Card elevation={0} sx={{ borderRadius: 4, textAlign: 'center', border: '1px solid #eee', p: 6 }}>
                    <Box sx={{ 
                        width: 80, height: 80, borderRadius: '50%', bgcolor: '#fef2f2', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: '#ef4444', mx: 'auto', mb: 3 
                    }}>
                        <LockIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                        Quiz Locked
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Please complete the lesson video first before taking the quiz.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Watch at least 95% of the video to unlock the quiz.
                    </Typography>
                </Card>
            </Container>
        );
    }

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
                        {isLastLesson 
                            ? "This lesson doesn't have any quizzes. Complete all lessons and quizzes to finish the course."
                            : "This lesson doesn't have any quizzes. You can proceed to the next lesson directly."
                        }
                    </Typography>
                    
                    {!isLastLesson && (
                        <Button variant="contained" fullWidth size="large" onClick={onNextLesson} 
                            sx={{ bgcolor: '#97A87A', borderRadius: 2, '&:hover': { bgcolor: '#7e8f63' } }} >
                            Next Lesson
                        </Button>
                    )}
                </Card>
            </Container>
        );
    }

    if (isFlowFinished) {
        const passed = finalResult?.score >= 60;
        const canProceed = finalResult?.score >= 80; // Need 80% to proceed to next lesson
        
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
                            {canProceed ? "Excellent Work!" : passed ? "Good Job!" : "Quiz Completed"}
                        </Typography>
                        
                        {finalResult.totalQuestions !== null && (
                            <Typography variant="body1" color="text.secondary">
                                Correct: <b>{finalResult.totalCorrect}</b> / <b>{finalResult.totalQuestions}</b>
                            </Typography>
                        )}
                        
                        {!canProceed && !isLastLesson && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Score at least 80% to unlock the next lesson
                            </Typography>
                        )}
                    </Box>

                    <CardContent sx={{ position: 'relative', top: -30, px: 4 }}>
                        {/* Retry Button - Always visible */}
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            size="large" 
                            onClick={handleRetryQuiz}
                            startIcon={<ReplayIcon />}
                            sx={{ 
                                mb: 2, 
                                borderRadius: 2, 
                                borderColor: '#97A87A', 
                                color: '#97A87A',
                                '&:hover': { 
                                    borderColor: '#7e8f63', 
                                    bgcolor: 'rgba(151, 168, 122, 0.08)' 
                                } 
                            }}
                        >
                            Retry Quiz
                        </Button>
                        
                        {/* Next Lesson Button - Only show if score >= 80% AND not last lesson */}
                        {canProceed && !isLastLesson && (
                            <Button 
                                variant="contained" 
                                fullWidth 
                                size="large" 
                                onClick={onNextLesson}
                                endIcon={<NavigateNextIcon />}
                                sx={{ bgcolor: '#97A87A', borderRadius: 2, '&:hover': { bgcolor: '#7e8f63' } }}
                            >
                                Next Lesson
                            </Button>
                        )}
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
                    {questions.map((q) => (
                        <Card key={q.id} elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>{q.questionText}</Typography>
                                <FormControl fullWidth>
                                    <RadioGroup value={answers[q.id] || ''} onChange={(e) => handleOptionChange(q.id, e.target.value)}>
                                        {q.options.map((option, i) => {
                                            const val = option; // Use actual option text, not index
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
