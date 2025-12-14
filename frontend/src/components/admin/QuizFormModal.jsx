import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, IconButton, Radio, RadioGroup, 
        FormControlLabel, FormControl, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const QuizFormModal = ({ open, handleClose, handleSubmit, loading, initialData }) => {
    const themeColor = '#97A87A';

    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setTitle(initialData.title || "");
                setQuestions(initialData.questions ? JSON.parse(JSON.stringify(initialData.questions)) : []);
            } else {
                setTitle("New Quiz");
                setQuestions([
                    { questionText: "", options: ["", "", "", ""], correctOption: 0 }
                ]);
            }
        }
    }, [open, initialData]);

    const addQuestion = () => {
        setQuestions([
            ...questions, 
            { questionText: "", options: ["", "", "", ""], correctOption: 0 }
        ]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionTextChange = (index, value) => {
        const newQuestions = questions.map((q, i) => 
            i === index ? { ...q, questionText: value } : q
        );
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = questions.map((q, i) => {
            if (i === qIndex) {
                const newOptions = [...q.options];
                newOptions[oIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        });
        setQuestions(newQuestions);
    };

    const handleCorrectOptionChange = (qIndex, value) => {
        const newQuestions = questions.map((q, i) => 
            i === qIndex ? { ...q, correctOption: parseInt(value) } : q
        );
        setQuestions(newQuestions);
    };

    const onSubmit = () => {
        if (!title.trim()) {
            alert("Please enter a quiz title!");
            return;
        }
        
        if (questions.length === 0) {
            alert("Quiz must have at least 1 question!");
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim()) {
                alert(`Question #${i + 1} is empty!`);
                return;
            }
            if (q.options.some(opt => !opt.trim())) {
                alert(`Question #${i + 1} has empty options!`);
                return;
            }
        }

        const payloadQuestions = questions.map(q => ({
            ...q,
            correctOption: q.options[q.correctOption] 
        }));

        handleSubmit({ title, questions: payloadQuestions });
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <Typography variant='h6' component="div" fontWeight="bold">
                    {initialData ? "Edit Quiz" : "Create New Quiz"}
                </Typography>
                <IconButton onClick={handleClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ bgcolor: '#F4F6F8', p: 3 }}>
                <Box bgcolor="white" p={2} borderRadius={2} mb={3} boxShadow={1}>
                    <TextField 
                        fullWidth label="Quiz Title" 
                        value={title} onChange={(e) => setTitle(e.target.value)} 
                        variant="outlined"
                    />
                </Box>

                {questions.map((q, qIndex) => (
                    <Accordion key={qIndex} defaultExpanded sx={{ mb: 2, borderRadius: '8px !important', '&:before': {display:'none'} }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa' }}>
                            <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" pr={2}>
                                <Typography fontWeight="bold">Question {qIndex + 1}</Typography>
                                {questions.length > 1 && (
                                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); removeQuestion(qIndex); }}>
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Box>
                        </AccordionSummary>
                        
                        <AccordionDetails>
                            <TextField 
                                fullWidth label="Question Text" multiline rows={2} sx={{ mb: 2 }}
                                value={q.questionText} 
                                onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                            />
                            
                            <Typography variant="body2" fontWeight="bold" mb={1} color="textSecondary">
                                Correct Answer:
                            </Typography>

                            <FormControl component="fieldset" fullWidth>
                                <RadioGroup 
                                    value={q.correctOption} 
                                    onChange={(e) => handleCorrectOptionChange(qIndex, e.target.value)}
                                >
                                    {q.options.map((opt, oIndex) => (
                                        <Box key={oIndex} display="flex" alignItems="center" gap={1} mb={1}>
                                            <FormControlLabel 
                                                value={oIndex} 
                                                control={<Radio sx={{color: themeColor, '&.Mui-checked': {color: themeColor}}} />} 
                                                label="" sx={{ mr: 0 }} 
                                            />
                                            <TextField 
                                                fullWidth size="small" placeholder={`Option ${oIndex + 1}`}
                                                value={opt}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <Typography color="textSecondary" mr={1} fontWeight="bold">
                                                            {String.fromCharCode(65 + oIndex)}.
                                                        </Typography>
                                                    )
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>
                ))}

                <Button 
                    variant="outlined" fullWidth 
                    sx={{ border: '2px dashed #ccc', py: 1.5, color: '#666', '&:hover': { borderColor: themeColor, color: themeColor, bgcolor: '#f0f7ed' } }} 
                    onClick={addQuestion}
                >
                    <AddCircleOutlineIcon sx={{ mr: 1 }} /> Add New Question
                </Button>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button 
                    onClick={onSubmit} 
                    variant="contained" 
                    disabled={loading} 
                    sx={{ bgcolor: themeColor, '&:hover': { bgcolor: themeColor, opacity: 0.9 } }}
                >
                    {loading ? "Saving..." : "Save Quiz"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuizFormModal;