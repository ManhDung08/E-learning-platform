import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserAction, clearErrorAction } from '../../Redux/Auth/auth.action';
import { useNavigate } from 'react-router-dom';

const initialValues = { usernameOrEmail: "", password: "" };
const validationSchema = Yup.object({
  usernameOrEmail: Yup.string().required("* Username or Email is required"),
  password: Yup.string().min(6, "* Password must be at least 6 characters").required("* Password is required")
});

// const API_URL = 'http://localhost:8080/api/auth/login'

const Login = ({ onSuccess, onToggleView }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    //clear error khi component mount
    useEffect(() => {
        dispatch(clearErrorAction());
    }, [dispatch]);

    //chạy khi log in thành công
    useEffect(() => {
        if (isAuthenticated) {
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/')
            }
        }
    }, [isAuthenticated, navigate, onSuccess]);

    const handleSubmit = async (values) => {
        console.log("handle submit login", values);

        await dispatch(loginUserAction({
            usernameOrEmail: values.usernameOrEmail,
            password: values.password
        }));
    };

    const getErrorMessage = () => {
        if (!error) return null;

        //xử lý code bên backend
        if (error.code === 'invalid_credentials' || error.code === 'invalid_password') {
            return 'Username/Email or password is incorrect!';
        }
        if (error.code === 'email_not_verified') {
            return 'Please verify your email before logging in';
        }
        if (error.code === 'account_deactivated') {
            return 'Your account has been deactivated';
        }
        if (error.code === 'oauth_user') {
            return 'This account was created with Google. Please use Google login';
        }
        
        return error.message || 'Please try again'
    }
  
    return (
    <div >
        <h2 className='text-2xl font-semibold text-center mb-5'>Welcome Back</h2>
        {error && (
            <Alert severity='error' sx={{mb: 2}} onClose={() => dispatch(clearErrorAction())}>
                {getErrorMessage()}
            </Alert>
        )}
        
        <Formik onSubmit={handleSubmit} validationSchema={validationSchema} initialValues={initialValues}>
            {({ isSubmitting }) => (
                <Form>
                    <div className='space-y-5'>
                        <div>
                            <Field as={TextField} name='usernameOrEmail'
                                    label="Username or Email" fullWidth sx={{'& label.Mui-focused': { color: '#97A87A' },
                                                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }
                                                                    }}/>                    
                            <ErrorMessage name='username' component="div" 
                                        className=' text-sm text-red-500 mt-1' />
                        </div>
                        <div>
                            <Field as={TextField} name='password'
                                    label="Password" type="password"
                                    fullWidth sx={{ '& label.Mui-focused': { color: '#97A87A' },
                                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }
                                                    }}/>                    
                            <ErrorMessage name='password' 
                                        component="div" className='text-sm text-red-500 mt-1' />
                        </div>
                    </div>
                    
                    <div className='text-right mx-4 m-2'>
                        <a href='/forgot-password' className='text-sm text-blue-500 underline'>
                            Forgot password?
                        </a>
                    </div>
                    
                    <Button type='submit' variant='contained' sx={{backgroundColor: '#97AB7A', color: 'white'}}
                            fullWidth disabled={isSubmitting || loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </Button>
            </Form>
            )} 
        </Formik>
 
        <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <Button onClick={onToggleView} sx={{color: '#97AB7A'}}>Sign Up</Button>
            </p>
        </div>

        <div className="my-3 flex items-center">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <Button
            variant="outlined"
            color="black"
            fullWidth
            startIcon={<img src="https://e7.pngegg.com/pngimages/56/318/png-clipart-google-logo-logo-logo-company-text.png" alt="Google" width="18" />}
        >
            Continue with Google
        </Button>
    </div>
  )
}

export default Login
