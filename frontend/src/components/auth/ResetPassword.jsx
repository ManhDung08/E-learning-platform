import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Alert, CircularProgress, Container, Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordAction, clearErrorAction } from '../../Redux/Auth/auth.action'; 
import { useNavigate, useLocation } from 'react-router-dom';

const initialValues = { newPassword: "", confirmPassword: "" };

const validationSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "* Password must be at least 6 characters")
    .required("* New Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], "* Passwords must match")
    .required("* Confirm Password is required")
});

const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    const { loading, error: reduxError, passwordResetMessage } = useSelector((state) => state.auth);
    
    const [localError, setLocalError] = useState(null);

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    useEffect(() => {
        dispatch(clearErrorAction());
    }, [dispatch]);

    useEffect(() => {
        if (reduxError) {
            if (reduxError.message === 'No access or refresh token provided' || reduxError.message?.includes("No access")) {
                return;
            }
            setLocalError(reduxError.message || "Something went wrong");
        }
    }, [reduxError]);

    useEffect(() => {
        if (passwordResetMessage) {
            const timer = setTimeout(() => {
                navigate('/login');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [passwordResetMessage, navigate]);

    const handleSubmit = async (values) => {
        if (token) {
            setLocalError(null);
            dispatch(resetPasswordAction(token, values.newPassword, values.confirmPassword));
        }
    };

    if (!token) {
        return (
            <Container maxWidth="xs" className="mt-20">
                <Alert severity="error">Invalid or missing reset token.</Alert>
                <Button onClick={() => navigate('/login')} fullWidth sx={{mt: 2, color: '#97AB7A'}}>Go to Login</Button>
            </Container>
        )
    }

    return (
        <Container maxWidth="xs" className="mt-20">
            <Box sx={{ boxShadow: 3, p: 4, borderRadius: 2, bgcolor: 'white' }}>
                <Typography variant="h5" className='font-semibold text-center mb-6'>
                    Reset Password
                </Typography>

                {localError && (
                    <Alert severity='error' sx={{mb: 2}} onClose={() => setLocalError(null)}>
                        {localError}
                    </Alert>
                )}

                {passwordResetMessage && (
                    <Alert severity='success' sx={{mb: 2}}>
                        {passwordResetMessage}. Please login again...
                    </Alert>
                )}

                <Formik onSubmit={handleSubmit} validationSchema={validationSchema} initialValues={initialValues}>
                    {({ isSubmitting }) => (
                        <Form>
                            <div className='space-y-5'>
                                <div>
                                    <Field as={TextField} name='newPassword'
                                           label="New Password" type="password" fullWidth 
                                           sx={{'& label.Mui-focused': { color: '#97A87A' },
                                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }}}
                                    />                    
                                    <ErrorMessage name='newPassword' component="div" className='text-sm text-red-500 mt-1' />
                                </div>
                                <div>
                                    <Field as={TextField} name='confirmPassword'
                                           label="Confirm New Password" type="password" fullWidth 
                                           sx={{'& label.Mui-focused': { color: '#97A87A' },
                                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }}}
                                    />                    
                                    <ErrorMessage name='confirmPassword' component="div" className='text-sm text-red-500 mt-1' />
                                </div>
                            </div>
                            
                            <Button type='submit' variant='contained' 
                                    sx={{backgroundColor: '#97AB7A', color: 'white', mt: 3, '&:hover': {backgroundColor: '#7e8f63'}}}
                                    fullWidth disabled={isSubmitting || loading || !!passwordResetMessage}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Set New Password'}
                            </Button>
                        </Form>
                    )} 
                </Formik>
            </Box>
        </Container>
    );
};

export default ResetPassword;