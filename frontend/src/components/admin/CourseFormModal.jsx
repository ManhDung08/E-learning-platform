import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
         Grid, MenuItem, IconButton, Typography, Box, FormControlLabel, Switch, Avatar } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { getAllUsersAction } from '../../Redux/Admin/admin.action';

const CourseFormModal = ({ open, handleClose, handleSubmit, initialData, loading }) => {
    
    const dispatch = useDispatch();
    const themeColor = '#97A87A';

    const { users } = useSelector(store => store.admin);

    const instructorsList = users?.filter(u => u.role === 'instructor' || u.role === 'admin') || [];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceVND: 0,
        instructorId: '',
        isPublished: false,
        imageFile: null,
        imagePreview: ''
    });

    //fetch lại danh sách instructor khi mở modal
    useEffect(() => {
        if (open) {
            //page = 1, limit = 100, search = "", role instructor
            dispatch(getAllUsersAction(1, 100, "", "instructor"));
        }
    }, [open, dispatch]);

    useEffect(() => {
        if (initialData) {
            //edit
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                priceVND: initialData.priceVND || 0,
                instructorId: initialData.instructorId || '',
                isPublished: initialData.isPublished || false,
                imageFile: null,
                imagePreview: initialData.imagePreview || ''
            });
        } else {
            //create
            setFormData({
                title: '',
                description: '',
                priceVND: 0,
                instructorId: '',
                isPublished: false,
                imageFile: null,
                imagePreview: ''
            });
        }
    }, [initialData, open]);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData({
            ...formData, [name]: name === 'isPublished' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                imageFile: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };
  

    const onSubmit = () => {
        if (!formData.title || !formData.description) {
            alert("Tittle and Description are required!");
            return;
        }
        if (!initialData && !formData.instructorId) {
            alert("Please select an instructor!");
            return;
        }

        handleSubmit(formData);
    }

    return (
    
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <Typography variant='h6' component="div" fontWeight="bold">
                {initialData ? "Update Course" : "Create New Course"}
            </Typography>
            <IconButton onClick={handleClose}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
            <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ 
                                border: '2px dashed #ccc', 
                                borderRadius: 2, 
                                p: 2, 
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: '#fafafa'
                            }}>
                                {formData.imagePreview ? (
                                    <Box 
                                        component="img" 
                                        src={formData.imagePreview} 
                                        alt="Preview" 
                                        sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 1, mb: 2 }}
                                    />
                                ) : (
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        No image selected
                                    </Typography>
                                )}
                                
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ color: themeColor, borderColor: themeColor }}
                                >
                                    Upload Image
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </Button>
                            </Box>
                        </Grid>

                        <Grid size={{xs: 12, md: 8}}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth label="Course Title" name="title" value={formData.title} onChange={handleChange} required/>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField fullWidth label="Price (VND)" name='priceVND' type='number'
                                                value={formData.priceVND} onChange={handleChange} InputProps={{ inputProps: { min: 0 } }}/>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Instructor"
                                        name="instructorId"
                                        value={formData.instructorId}
                                        onChange={handleChange}
                                        disabled={loading || instructorsList.length === 0}
                                        helperText={instructorsList.length === 0 ? "Loading instructors..." : ""}
                                    >
                                        {instructorsList.map((inst) => (
                                            <MenuItem key={inst.id} value={inst.id}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Avatar src={inst.profileImageUrl} sx={{ width: 24, height: 24 }} />
                                                    {inst.username || inst.email}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth label="Description" name='description' multiline rows={4}
                                                value={formData.description} onChange={handleChange} required/>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <FormControlLabel control={
                                        <Switch checked={formData.isPublished} onChange={handleChange} name='isPublished' color='success'/>
                                    } label={formData.isPublished ? "Status: Published (Visible to everyone)" : "Status: Draft (Hidden)"}/>
                                </Grid>
                            </Grid>
                        </Grid>
                </Grid>
            </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleClose} color='inherit'>Cancel</Button>
            <Button onClick={onSubmit} variant='contained' disabled={loading} sx={{ bgcolor: themeColor, '&hover': { bgcolor: themeColor, opacity: 0.9 } }} >
                {loading ? "Processing..." : (initialData ? "Save Course" : "Create Course")}
            </Button>
        </DialogActions>
    </Dialog>
  );
};

export default CourseFormModal
