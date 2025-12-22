import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Dialog, DialogTitle, DialogContent, IconButton, Typography, Button, Container, 
    Box, Accordion, AccordionSummary, AccordionDetails, TextField, Stack, Divider 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'; 
import QuizIcon from '@mui/icons-material/Quiz';

import { 
    createModuleAction, updateModuleAction, deleteModuleAction,
    createLessonAction, updateLessonAction, deleteLessonAction
} from '../../Redux/Course/course.action';

import { 
    createQuizAction, 
    updateQuizAction, 
    getQuizByIdAction, 
    deleteQuizAction, getAllQuizzesForLessonAction
} from '../../Redux/Quiz/quiz.action';

import LessonFormModal from './LessonFormModal';
import QuizFormModal from './QuizFormModal';
import QuizListModal from './QuizListModal';

const CourseBuilder = ({ open, handleClose, courseId }) => {
    const dispatch = useDispatch();
    const themeColor = '#97A87A';

    const { course, loading: courseLoading } = useSelector(store => store.course);
    const { quiz: currentQuiz,quizzes: lessonQuizzes, loading: quizLoading } = useSelector(store => store.quiz);

    //module
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [editModuleTitle, setEditModuleTitle] = useState("");

    //lesson
    const [lessonModalOpen, setLessonModalOpen] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);

    //quiz
    const [quizListModalOpen, setQuizListModalOpen] = useState(false);
    const [quizFormModalOpen, setQuizFormModalOpen] = useState(false);
    const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState(null);
    const [editingQuizId, setEditingQuizId] = useState(null);

    //module handle
    const handleAddModule = () => {
        if (!newModuleTitle.trim()) return;
        dispatch(createModuleAction(courseId, { title: newModuleTitle }));
        setNewModuleTitle("");
        setIsAddingModule(false);
    };

    const handleUpdateModule = (moduleId) => {
        if (!editModuleTitle.trim()) return;
        dispatch(updateModuleAction(moduleId, { title: editModuleTitle }, courseId));
        setEditingModuleId(null);
    };

    const handleDeleteModule = (moduleId) => {
        if (window.confirm("Delete this module and all its lessons?")) {
            dispatch(deleteModuleAction(moduleId, courseId));
        }
    };

    //lesson handle
    const openAddLesson = (moduleId) => {
        setSelectedModuleId(moduleId);
        setSelectedLesson(null);
        setLessonModalOpen(true);
    };

    const openEditLesson = (moduleId, lesson) => {
        setSelectedModuleId(moduleId);
        setSelectedLesson(lesson);
        setLessonModalOpen(true);
    };

    const handleLessonSubmit = (formData) => {
        if (!formData.content || formData.content.length < 10) {
            alert("Content description must be at least 10 characters long!");
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        if (formData.videoFile) data.append('video', formData.videoFile);

        if (selectedLesson) {
            dispatch(updateLessonAction(selectedLesson.id, data, courseId));
        } else {
            dispatch(createLessonAction(selectedModuleId, data, courseId));
        }
        setLessonModalOpen(false);
    };

    const handleDeleteLesson = (lessonId) => {
        if (window.confirm("Delete this lesson?")) {
            dispatch(deleteLessonAction(lessonId, courseId));
        }
    };

    //quiz handle
    
    const handleOpenQuizList = (lesson) => {
        console.log("Check ID Lesson:", lesson.id); 
        
        setSelectedLessonForQuiz(lesson);

        dispatch(getAllQuizzesForLessonAction(lesson.id)); 

        setQuizListModalOpen(true);
    };

    const handleOpenCreateQuiz = () => {
        setEditingQuizId(null);
        setQuizListModalOpen(false);
        setQuizFormModalOpen(true);
    };

    const handleOpenEditQuiz = async (quizId) => {
        setEditingQuizId(quizId);
        await dispatch(getQuizByIdAction(quizId));
        setQuizListModalOpen(false);
        setQuizFormModalOpen(true);
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm("Are you sure you want to delete this quiz?")) {
            await dispatch(deleteQuizAction(quizId, courseId));
        }
    };

    const handleQuizSubmit = async (quizData) => {
        if (editingQuizId) {
            await dispatch(updateQuizAction(editingQuizId, quizData, courseId));
        } else {
            await dispatch(createQuizAction(selectedLessonForQuiz.id, quizData, courseId));
        }
        setQuizFormModalOpen(false);
        setQuizListModalOpen(true);
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', px: 4, py: 2 }}>
                <Box>
                    <Typography variant="h6" component="div" fontWeight="bold" color="text.primary">Course Builder</Typography>
                    <Typography variant="body2" component="div" color="textSecondary">{course?.title || "Loading course..."}</Typography>
                </Box>
                <Box>
                    <Button onClick={handleClose} color="inherit" sx={{ mr: 1 }}>Close</Button>
                    <Button variant="contained" onClick={handleClose} sx={{ bgcolor: themeColor, '&:hover': { bgcolor: themeColor, opacity: 0.9 } }}>Save & Exit</Button>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ bgcolor: '#F4F6F8', p: 0 }}>
                <Container maxWidth="md" sx={{ mt: 5, pb: 10 }}>
                    
                    <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="div" fontWeight="bold">Syllabus</Typography>
                        {!isAddingModule ? (
                            <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} sx={{ color: themeColor, borderColor: themeColor }} onClick={() => setIsAddingModule(true)}>Add New Module</Button>
                        ) : (
                            <Box display="flex" gap={1} alignItems="center" bgcolor="white" p={1} borderRadius={1} boxShadow={1}>
                                <TextField size="small" placeholder="Module Title" autoFocus value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} />
                                <Button variant="contained" size="small" onClick={handleAddModule} sx={{bgcolor: themeColor}}>Add</Button>
                                <IconButton size="small" onClick={() => setIsAddingModule(false)}><CloseIcon /></IconButton>
                            </Box>
                        )}
                    </Box>

                    {course?.modules?.map((module, index) => (
                        <Accordion key={module.id} defaultExpanded sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none', borderRadius: '8px !important', '&:before': { display: 'none' }, overflow: 'hidden' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa', borderBottom: '1px solid #f0f0f0', minHeight: 56 }}>
                                <Box display="flex" alignItems="center" width="100%" justifyContent="space-between" pr={1}>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <DragIndicatorIcon sx={{ color: '#ccc', fontSize: 20 }} />
                                        {editingModuleId === module.id ? (
                                            <Box display="flex" gap={1} onClick={(e) => e.stopPropagation()}>
                                                <TextField size="small" value={editModuleTitle} onChange={(e) => setEditModuleTitle(e.target.value)} />
                                                <Button size="small" variant="contained" sx={{bgcolor: themeColor}} onClick={() => handleUpdateModule(module.id)}>Save</Button>
                                            </Box>
                                        ) : (
                                            <Typography fontWeight="bold" component="div" variant="subtitle1">Module {index + 1}: {module.title}</Typography>
                                        )}
                                    </Box>
                                    
                                    <Box onClick={(e) => e.stopPropagation()}>
                                        <IconButton 
                                            size="small" 
                                            component="div" 
                                            role="button"
                                            onClick={() => {
                                                setEditingModuleId(module.id);
                                                setEditModuleTitle(module.title);
                                            }}
                                        >
                                            <EditIcon fontSize="small" color="action" />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            component="div" 
                                            role="button"
                                            onClick={() => handleDeleteModule(module.id)}
                                        >
                                            <DeleteIcon fontSize="small" color="error" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </AccordionSummary>

                            <AccordionDetails sx={{ p: 0, bgcolor: '#fff' }}>
                                <Stack divider={<Divider />}>
                                    {module.lessons?.length > 0 ? (
                                        module.lessons.map((lesson, lIndex) => (
                                            <Box key={lesson.id} p={2} pl={5} display="flex" alignItems="center" justifyContent="space-between" sx={{ '&:hover': { bgcolor: '#f9f9f9' }, transition: '0.2s' }}>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Typography variant="body2" component="div" color="textSecondary" width={20}>{lIndex + 1}.</Typography>
                                                    <VideoFileIcon sx={{ color: themeColor }} />
                                                    <Box>
                                                        <Typography variant="body2" component="div" fontWeight="500">{lesson.title}</Typography>
                                                        <Typography variant="caption" component="div" color="textSecondary">Video • {lesson.durationSeconds || 0}s</Typography>
                                                    </Box>
                                                </Box>
                                                
                                                <Box>
                                                    <IconButton 
                                                        size="small" 
                                                        component="div" 
                                                        role="button"
                                                        title="Manage Quizzes"
                                                        onClick={() => handleOpenQuizList(lesson)}
                                                        sx={{ 
                                                            color: (lesson.quizzes && lesson.quizzes.length > 0) ? '#2e7d32' : 'action.active',
                                                            bgcolor: (lesson.quizzes && lesson.quizzes.length > 0) ? '#e8f5e9' : 'transparent',
                                                            mr: 1
                                                        }}
                                                    >
                                                        <QuizIcon fontSize="small" />
                                                    </IconButton>

                                                    <IconButton size="small" onClick={() => openEditLesson(module.id, lesson)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDeleteLesson(lesson.id)}>
                                                        <DeleteIcon fontSize="small" color="error" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        ))
                                    ) : (
                                        <Box p={3} textAlign="center"><Typography variant="caption" component="div" color="textSecondary" fontStyle="italic">No lessons in this module yet.</Typography></Box>
                                    )}
                                    <Box p={2} display="flex" justifyContent="center" bgcolor="#fafafa">
                                        <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => openAddLesson(module.id)} sx={{ color: themeColor, textTransform: 'none', fontWeight: 'bold' }}>Add Lesson Content</Button>
                                    </Box>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    {(!course?.modules || course.modules.length === 0) && (
                        <Box textAlign="center" mt={10}>
                            <Typography component="div" color="textSecondary">Start by adding a module to create your course structure.</Typography>
                        </Box>
                    )}
                </Container>
            </DialogContent>


            <LessonFormModal 
                open={lessonModalOpen}
                handleClose={() => setLessonModalOpen(false)}
                handleSubmit={handleLessonSubmit}
                initialData={selectedLesson}
                loading={courseLoading} 
            />

            <QuizListModal 
                open={quizListModalOpen}
                handleClose={() => setQuizListModalOpen(false)}
                lessonName={selectedLessonForQuiz?.title}
                quizzes={lessonQuizzes}
                onCreate={handleOpenCreateQuiz}
                onEdit={handleOpenEditQuiz}
                onDelete={handleDeleteQuiz}
                lessonId={selectedLessonForQuiz?.id}
            />

            <QuizFormModal 
                open={quizFormModalOpen}
                handleClose={() => {
                    setQuizFormModalOpen(false);
                    setQuizListModalOpen(true);
                }}
                handleSubmit={handleQuizSubmit}
                loading={quizLoading}
                initialData={editingQuizId ? currentQuiz : null}
            />
        </Dialog>
    );
};

export default CourseBuilder;