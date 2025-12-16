import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const LessonFormModal = ({ open, handleClose, handleSubmit, initialData, loading }) => {
    const themeColor = '#97A87A';
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        videoFile: null,
        durationSeconds: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                content: initialData.content || '',
                videoFile: null,
                durationSeconds: initialData.durationSeconds || 0
            });
        } else {
            setFormData({ title: '', content: '', videoFile: null, durationSeconds: 0 });
        }
    }, [initialData, open]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setFormData({ ...formData, videoFile: file });
    };

    const onSubmit = () => {
        if (!formData.title) {
            alert("Lesson title is required!");
            return;
        }
        handleSubmit(formData);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='h6' component="div" fontWeight="bold">
                    {initialData ? "Edit Lesson" : "Add New Lesson"}
                </Typography>
                <IconButton onClick={handleClose}><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField label="Lesson Title" name="title" fullWidth value={formData.title} onChange={handleChange} required />
                    
                    <TextField label="Content / Description" name="content" fullWidth multiline rows={3} value={formData.content} onChange={handleChange} />

                    <Box border="1px dashed #ccc" p={2} borderRadius={1} textAlign="center">
                        <Button component="label" startIcon={<CloudUploadIcon />} sx={{ color: themeColor }}>
                            {initialData ? "Change Video (Optional)" : "Upload Video"}
                            <input type="file" hidden accept="video/*" onChange={handleFileChange} />
                        </Button>
                        {formData.videoFile && (
                            <Typography variant="caption" display="block" mt={1}>
                                Selected: {formData.videoFile.name}
                            </Typography>
                        )}
                        {!formData.videoFile && initialData?.videoKey && (
                            <Typography variant="caption" display="block" mt={1} color="success.main">
                                Current video available
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button onClick={onSubmit} variant="contained" disabled={loading} sx={{ bgcolor: themeColor, '&:hover': { bgcolor: themeColor, opacity: 0.9 } }}>
                    {loading ? "Saving..." : "Save Lesson"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LessonFormModal;