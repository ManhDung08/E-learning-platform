import React, { useEffect, useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Grid, MenuItem, IconButton, 
    Typography, Box 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const UserFormModal = ({ open, handleClose, handleSubmit, initialData, loading }) => {
    const themeColor = '#97A87A';
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'student',
        phoneNumber: '',
        gender: 'other',
        dateOfBirth: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                username: initialData.username || '',
                email: initialData.email || '',
                password: '',
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                role: initialData.role || 'student',
                phoneNumber: initialData.phoneNumber || '',
                gender: initialData.gender || 'other',
                dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
            });
        } else {
            setFormData({
                username: '', email: '', password: '', 
                firstName: '', lastName: '', role: 'student', 
                phoneNumber: '', gender: 'other',
                dateOfBirth: ''
            });
        }
    }, [initialData, open]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = () => {
        if(!formData.username || !formData.email) {
            alert("Username and Email are required!");
            return;
        }

        if(!initialData && !formData.password) {
            alert("Password is required for new user!");
            return;
        }

        handleSubmit(formData);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <Typography variant="h6" fontWeight="bold">
                    {initialData ? "Update User Profile" : "Create New User"}
                </Typography>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
                <Box component="form" sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                fullWidth 
                                label={initialData ? "New Password (Optional)" : "Password"} 
                                name="password" 
                                type="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required={!initialData}
                                helperText={initialData ? "Leave blank to keep current password" : ""}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                fullWidth 
                                label="Date of Birth" 
                                name="dateOfBirth" 
                                type="date" 
                                value={formData.dateOfBirth} 
                                onChange={handleChange} 
                                InputLabelProps={{ shrink: true }} 
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select fullWidth label="Role" name="role" value={formData.role} onChange={handleChange}>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="instructor">Instructor</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select fullWidth label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </TextField>
                        </Grid>
                        
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button 
                    onClick={onSubmit} 
                    variant="contained" 
                    disabled={loading}
                    sx={{ 
                        bgcolor: themeColor, 
                        '&:hover': { bgcolor: themeColor, opacity: 0.9 } 
                    }}
                >
                    {loading ? "Processing..." : (initialData ? "Save Changes" : "Create User")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserFormModal;