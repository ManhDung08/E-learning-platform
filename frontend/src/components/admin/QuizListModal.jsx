import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, 
    ListItemSecondaryAction, IconButton, Typography, Box, Divider, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';

const QuizListModal = ({ open, handleClose, lessonName, lessonId, quizzes = [], onEdit, onDelete, onCreate }) => {
    const themeColor = '#97A87A';
    const navigate = useNavigate();

    const { user } = useSelector(store => store.auth);
    const userRole = user?.role || 'instructor';

    const handleViewAttempts = (quizId) => {
        handleClose();

        if (userRole === 'admin') {
            navigate(`/admin/quiz/${quizId}/attempts`, {state: { lessonId: lessonId }});
        } else {
            navigate(`/instructor/quiz/${quizId}/attempts`, {state: { lessonId: lessonId }});
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <Typography variant='h6' component="div" fontWeight="bold">
                    Quizzes for: {lessonName}
                </Typography>
                <IconButton onClick={handleClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ bgcolor: '#F4F6F8', p: 0 }}>
                {quizzes.length > 0 ? (
                    <List sx={{ p: 0 }}>
                        {quizzes.map((quiz, index) => (
                            <React.Fragment key={quiz.id}>
                                <ListItem sx={{ bgcolor: 'white', py: 2 }}>
                                    <Box mr={2} color={themeColor}>
                                        <QuizIcon />
                                    </Box>
                                    <ListItemText 
                                        primary={<Typography fontWeight="500">{quiz.title}</Typography>}
                                        secondary={`ID: ${quiz.id}`} 
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="View Student Results">
                                            <IconButton edge="end" onClick={() => handleViewAttempts(quiz.id)} 
                                                sx={{ mr: 1, color: '#2e7d32', bgcolor: '#e8f5e9' }}>
                                                <AssessmentIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton edge="end" onClick={() => onEdit(quiz.id)} sx={{ mr: 1, color: themeColor }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" color="error" onClick={() => onDelete(quiz.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Box p={4} textAlign="center" color="text.secondary">
                        <Typography>No quizzes found for this lesson.</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button onClick={handleClose} color="inherit">Close</Button>
                <Button 
                    variant="contained" 
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={onCreate}
                    sx={{ bgcolor: themeColor, '&:hover': { bgcolor: themeColor, opacity: 0.9 } }}
                >
                    Create New Quiz
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuizListModal;