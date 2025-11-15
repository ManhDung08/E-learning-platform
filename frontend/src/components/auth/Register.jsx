import React, { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, MenuItem, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { registerUserAction, clearErrorAction } from '../../Redux/Auth/auth.action';

const initialValues = { 
    username: "", 
    email: "", 
    password: "",
    confirmPassword: "",
    role: "student",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: ""
};

const validationSchema = Yup.object({
    username: Yup.string()
        .min(3, "* Username must be at least 3 characters")
        .required("* Username is required"),
    email: Yup.string()
        .email("* Invalid email")
        .required("* Email is required"),
    password: Yup.string()
        .min(8, "* Password must be at least 8 characters")
        .required("* Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], "* Passwords must match")
        .required("* Please confirm your password"),
    role: Yup.string()
        .oneOf(["student", "instructor"], "* Invalid role"),
    firstName: Yup.string(),
    lastName: Yup.string(),
    gender: Yup.string()
        .oneOf(["male", "female", "other", ""], "* Invalid gender"),
    dateOfBirth: Yup.date()
        .max(new Date(), "* Date of birth cannot be in the future")
        .nullable(),
    phoneNumber: Yup.string()
        .matches(/^[0-9+\-\s()]*$/, "* Invalid phone number")
});

const Register = ({ onSuccess, onToggleView }) => {
  
    const dispatch = useDispatch();

    const [registeredEmail, setRegisteredEmail] = useState('');


    const { loading, error, registrationSuccess, verificationMessage } = useSelector(
        (state) => state.auth
    );

    //clear error khi component mount
    useEffect(() => {
        dispatch(clearErrorAction())
    }, [dispatch])

    //hiện thông báo khi đăng ký thành công
    useEffect(() => {
        if (registrationSuccess) {
            console.log("Register successfully, please verify email");
            //chưa thực hiện logic verify email
        }
    }, [registrationSuccess]);


    const handleSubmit = (values) => {
        console.log("handle submit register", values);

        const { confirmPassword, ...registerData } = values;

        const cleanData = Object.fromEntries(
            Object.entries(registerData).filter(([_, value]) => value != "")
        );
        
        setRegisteredEmail(values.email);

        dispatch(registerUserAction(cleanData));

    };

    const getErrorMessage = () => {
        if (!error) return null;

        if (error.code === 'username_already_exists') {
            return 'This username is already taken';
        }

        if (error.code === 'email_already_exists') {
            return 'This email is already registered';
        }

        return error.message || 'Register failed, please try again.';
    }

    return (
    <>  
        <h2 className='text-2xl font-semibold text-center mb-5'>Create Account</h2>

        {registrationSuccess && verificationMessage && (
            <>
                <Alert severity='success' sx={{mb: 2}}>
                    {verificationMessage}
                </Alert>
                <div className='bg-blue-50 border border-blue-200 rounded-lg mb-4'>
                    <p className='text-sm text-gray-700 mb-2'>
                        We've sent a verification link to:
                    </p>
                    <p className='font-semibold text-center mb-2'>{registeredEmail}</p>
                    <p className='text-xs text-gray-600'>
                        Please check your email and click the verification link.
                    </p>
                </div>
            </>
        )}

        {error && (
            <Alert severity='error' sx={{mb: 2}} onClose={() => dispatch(clearErrorAction())}>
                {getErrorMessage()}
            </Alert>
        )}

        <Formik onSubmit={handleSubmit} validationSchema={validationSchema} initialValues={initialValues}>
            {({isSubmitting}) => (
                <Form className="space-y-4">
                <div>
                    <Field
                        as={TextField} name="username" label="Username *"
                        fullWidth sx={{ '& label.Mui-focused': { color: '#97A87A' },
                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }
                                    }}
                    />
                    <ErrorMessage
                        name="username"
                        component="div"
                        className="text-sm text-red-500 mt-1"
                    />
                </div>

                <div>
                    <Field as={TextField} name="email" label="Email *" fullWidth 
                    sx={{ '& label.Mui-focused': { color: '#97A87A' },
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }
                        }} />
                    <ErrorMessage
                        name="email"
                        component="div"
                        className="text-sm text-red-500 mt-1"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Field
                                as={TextField} name="firstName"
                                label="First Name" fullWidth
                                sx={{ 
                                    '& label.Mui-focused': { color: '#97A87A' },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                                        borderColor: '#97A87A' 
                                    }
                                }}
                            />
                            <ErrorMessage
                                name="firstName"
                                component="div"
                                className="text-sm text-red-500 mt-1"
                            />
                        </div>
                        <div>
                            <Field
                                as={TextField} name="lastName"
                                label="Last Name" fullWidth
                                sx={{ 
                                    '& label.Mui-focused': { color: '#97A87A' },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                                        borderColor: '#97A87A' 
                                    }
                                }}
                            />
                            <ErrorMessage
                                name="lastName"
                                component="div"
                                className="text-sm text-red-500 mt-1"
                            />
                        </div>
                    </div>

                <div>
                    <Field
                        as={TextField} name="password"
                        label="Password *" type="password"
                        fullWidth sx={{ '& label.Mui-focused': { color: '#97A87A' },
                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }
                                    }}
                    />
                    <ErrorMessage
                        name="password"
                        component="div"
                        className="text-sm text-red-500 mt-1"
                    />
                </div>

                <div>
                    <Field
                        as={TextField} name="confirmPassword"
                        label="Confirm Password *" type="password" fullWidth 
                        sx={{ 
                            '& label.Mui-focused': { color: '#97A87A' },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                                borderColor: '#97A87A' 
                           }
                        }}
                    />
                    <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-sm text-red-500 mt-1"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Field 
                                as={TextField} name="gender" 
                                label="Gender" select fullWidth 
                                sx={{ 
                                    '& label.Mui-focused': { color: '#97A87A' },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                                        borderColor: '#97A87A' 
                                    }
                                }}
                            >
                                <MenuItem value="">Select Gender</MenuItem>
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Field>
                            <ErrorMessage
                                name="gender"
                                component="div"
                                className="text-sm text-red-500 mt-1"
                            />
                        </div>
                        <div>
                            <Field
                                as={TextField} name="dateOfBirth"                                     
                                InputLabelProps={{ shrink: true }}
                                label="Date of Birth" type="date" fullWidth
                                sx={{ 
                                    '& label.Mui-focused': { color: '#97A87A' },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                                        borderColor: '#97A87A' 
                                    }
                                }}
                            />
                            <ErrorMessage
                                name="dateOfBirth"
                                component="div"
                                className="text-sm text-red-500 mt-1"
                            />
                        </div>
                    </div>
                <div>
                    <Field
                        as={TextField} name="phoneNumber"
                        label="Phone Number" fullWidth
                        sx={{ 
                            '& label.Mui-focused': { color: '#97A87A' },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                                borderColor: '#97A87A' 
                            }
                        }}
                    />
                    <ErrorMessage
                        name="phoneNumber"
                        component="div"
                        className="text-sm text-red-500 mt-1"
                    />
                </div>

                <div>
                    <Field as={TextField} name="role" label="I am a *" select fullWidth sx={{ '& label.Mui-focused': { color: '#97A87A' },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }
                                }}>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="instructor">Instructor</MenuItem> 
                    </Field>
                        
                    <ErrorMessage
                        name="role"
                        component="div"
                        className="text-sm text-red-500 mt-1"
                    />
                </div>

                <Button
                    type="submit"
                    variant="contained"
                    sx={{backgroundColor: '#97AB7A', color: 'white'}}
                    fullWidth
                    disabled={isSubmitting || loading}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </Form>
            )}
        </Formik>

        <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Button onClick={onToggleView} sx={{color: '#97AB7A'}}>Login</Button>
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
    </>
  );
};

export default Register
