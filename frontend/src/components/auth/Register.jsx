import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, MenuItem } from '@mui/material';
//import { useDispatch } from 'react-redux';

const initialValues = { username: "", email: "", password: "", role: "student", };
const validationSchema = Yup.object({
    username: Yup.string().required("* Username is required"),
    email: Yup.string().email("* Invalid email").required("* Email is required"),
    password: Yup.string()
        .min(8, "* Password must be at least 8 characters")
        .required("* Password is required"),
    role: Yup.string().oneOf(["student", "teacher", "admin"]),
});

const Register = ({ onSuccess, onToggleView }) => {
  //const dispatch = useDispatch();

  const handleSubmit = (values) => {
    console.log("handle submit register", values);
    // dispatch(registerUserAction({data: values}));

    if (onSuccess) onSuccess();
  };

    return (
    <>  
        <h2 className='text-2x1 font-semibold text-center mb-5'>Create Account</h2>
        <Formik onSubmit={handleSubmit} validationSchema={validationSchema} initialValues={initialValues}>
            {({isSubmitting}) => (
                <Form className="space-y-5">
                <div>
                    <Field
                        as={TextField}
                        name="username"
                        label="Username"
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
                    <Field as={TextField} name="email" label="Email" fullWidth 
                    sx={{ '& label.Mui-focused': { color: '#97A87A' },
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }
                        }} />
                    <ErrorMessage
                        name="email"
                        component="div"
                        className="text-sm text-red-500 mt-1"
                    />
                </div>

                <div>
                    <Field
                        as={TextField}
                        name="password"
                        label="Password"
                        type="password"
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
                    <Field as={TextField} name="role" label="Role" select fullWidth sx={{ '& label.Mui-focused': { color: '#97A87A' },
                                                                                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#97A87A' }
                                                                                        }}>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="teacher">Teacher</MenuItem>
                    </Field>
                </div>

                <Button
                    type="submit"
                    variant="contained"
                    sx={{backgroundColor: '#97AB7A', color: 'white'}}
                    fullWidth
                    disabled={isSubmitting}
                >
                Sign Up
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
