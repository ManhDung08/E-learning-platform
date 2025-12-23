import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Alert, CircularProgress, Container, Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPasswordAction, clearErrorAction } from '../../Redux/Auth/auth.action'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';

const initialValues = { email: "" };

const validationSchema = Yup.object({
  email: Yup.string().email("* Invalid email format").required("* Email is required"),
});

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { loading, error, passwordResetMessage } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearErrorAction());
    }, [dispatch]);

    const handleSubmit = (values) => {
        dispatch(forgotPasswordAction(values.email));
    };

    return (
        <Container maxWidth="xs" className="mt-20">
            <Box sx={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                p: 4, 
                borderRadius: 2, 
                bgcolor: 'white' 
            }}>
                <Typography variant="h5" className='font-semibold text-center mb-2'>
                    Forgot Password
                </Typography>
                
                <p className='text-gray-500 text-center mb-6 text-sm'>
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && (
                    <Alert severity='error' sx={{mb: 2}} onClose={() => dispatch(clearErrorAction())}>
                        {error.message || "Failed to send reset link"}
                    </Alert>
                )}

                {passwordResetMessage && (
                    <Alert severity='success' sx={{mb: 2}}>
                        {passwordResetMessage}
                    </Alert>
                )}

                <Formik onSubmit={handleSubmit} validationSchema={validationSchema} initialValues={initialValues}>
                    {({ isSubmitting }) => (
                        <Form>
                            <div className='space-y-4'>
                                <div>
                                    <Field as={TextField} name='email'
                                           label="Email Address" fullWidth 
                                           sx={{
                                                '& label.Mui-focused': { color: '#97A87A' },
                                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }
                                           }}
                                    />                    
                                    <ErrorMessage name='email' component="div" className='text-sm text-red-500 mt-1' />
                                </div>
                            </div>
                            
                            <Button type='submit' variant='contained' 
                                    sx={{
                                        backgroundColor: '#97AB7A', 
                                        color: 'white', 
                                        mt: 3, 
                                        py: 1.2,
                                        '&:hover': {backgroundColor: '#7e8f63'}
                                    }}
                                    fullWidth disabled={isSubmitting || loading}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                            </Button>
                        </Form>
                    )} 
                </Formik>

                <div className="text-center mt-6">
                    <Button 
                        onClick={() => navigate('/login')} 
                        sx={{color: '#97AB7A', textTransform: 'none', fontWeight: 600}}
                    >
                        Back to Login
                    </Button>
                </div>
            </Box>
        </Container>
    );
};

export default ForgotPassword;