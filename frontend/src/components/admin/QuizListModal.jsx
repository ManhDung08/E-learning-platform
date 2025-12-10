import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, 
    ListItemSecondaryAction, IconButton, Typography, Box, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';

const QuizListModal = ({ open, handleClose, lessonName, quizzes = [], onEdit, onDelete, onCreate }) => {
    const themeColor = '#97A87A';

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