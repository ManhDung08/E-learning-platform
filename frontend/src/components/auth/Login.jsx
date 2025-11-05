import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField } from '@mui/material';

const initialValues = { username: "", password: "" };
const validationSchema = Yup.object({
  username: Yup.string().required("* Username is required"),
  password: Yup.string().min(8, "* Password must be at least 8 characters").required("* Password is required")
});

// const API_URL = 'http://localhost:8080/api/auth/login'

const Login = ({ onSuccess, onToggleView }) => {

    const handleSubmit = (values) => {
        console.log("handle submit login", values);

        if (onSuccess) {
            onSuccess();
        }
    };
  
    return (
    <div >
        <h2 className='text-2x1 font-semibold text-center mb-5'>Welcome Back</h2>
        <Formik onSubmit={handleSubmit} validationSchema={validationSchema} initialValues={initialValues}>
            {({ isSubmitting }) => (
                <Form className='space-y-5'>
                    <div>
                        <Field as={TextField} name='username'
                                label="Username" fullWidth sx={{'& label.Mui-focused': { color: '#97A87A' },
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
                        <ErrorMessage onSubmit={handleSubmit} name='password' 
                                    component="div" className='text-sm text-red-500 mt-1' />
                    </div>

                    <Button type='submit' variant='contained' sx={{backgroundColor: '#97AB7A', color: 'white'}}
                            fullWidth disabled={isSubmitting}>
                        Log In
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
