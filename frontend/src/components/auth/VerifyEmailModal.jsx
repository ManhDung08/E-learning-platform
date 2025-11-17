import React, { useEffect, useState } from 'react';
import { CircularProgress, Alert, Button, Dialog, DialogContent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmailAction, clearErrorAction } from '../../Redux/Auth/auth.action';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const VerifyEmailModal = ({ open, token, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
    const [verificationAttempted, setVerificationAttempted] = useState(false);

    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (open && token && !verificationAttempted) {
            console.log("verifying email with token:", token);
            dispatch(clearErrorAction());
            dispatch(verifyEmailAction(token));
            setVerificationAttempted(true);
        }
    }, [open, token, dispatch, verificationAttempted]);

    //redirect sau khi verify thành công
    useEffect(() => {
        if (isAuthenticated && verificationAttempted && !isRedirecting) {
            console.log("Email verified successfully");
            
            setIsRedirecting(true);

            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 3000); // chờ 3 giây để người dùng đọc
        }
    }, [isAuthenticated, verificationAttempted, onSuccess, isRedirecting]);

    const handleResendVerification = () => {

        console.log("Resend verification clicked");
    };

    const getErrorMessage = () => {
        if (!error) return null;
        if (error.code === 'invalid_token' || error.code === 'token_expired') {
            return 'The verification link has expired or is invalid';
        }

        return error.message || 'Email verification failed, please try again';
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogContent sx={{padding: '3rem', textAlign: 'center'}}>
                {loading && (
                    <>
                        <CircularProgress size={60} sx={{color: '#97AB7A', mb: 3}}/>
                        <h2 className='text-2xl font-semibold mb-2'>Verifying Your Email</h2>
                        <p className='text-gray-600'>Please wait...</p>
                    </>
                )}

                {isAuthenticated && verificationAttempted && !loading && (
                    <>
                        <CheckCircleIcon sx={{fontSize: 80, color: '#4caf50', mb: 2}} />
                        <h2 className='text-2xl font-bold mb-4'>Email Verified!</h2>
                        <p className='text-gray-600 mb-4'>Your email has been successfully verified.</p>
                        <CircularProgress size={30} sx={{color: '#97AB7A'}}/>
                    </>
                )}

                {error && verificationAttempted && !loading && (
                    <>
                        <ErrorIcon sx={{fontSize: 80, color: '#f44336', mb: 2}}/>
                        <h2 className='text-2xl font-bold mb-4'>Verification Failed</h2>

                        <Alert severity='error' sx={{mb: 4, textAlign: 'left'}}>
                            {getErrorMessage()}
                        </Alert>

                        <div className='space-y-3'>
                            <Button variant='contained' fullWidth onClick={handleResendVerification} 
                                    sx={{backgroundColor: '#97AB7A'}}>
                                Resend Verification Email
                            </Button>
                            <Button variant='outlined' fullWidth onClick={onClose}
                                    sx={{color: '#97AB7A'}}>
                                Close
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
};

export default VerifyEmailModal;