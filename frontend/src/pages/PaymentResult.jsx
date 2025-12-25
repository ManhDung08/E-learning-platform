import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); 
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePaymentResult = () => {
        const searchParams = new URLSearchParams(location.search);

      const isSuccessNew = searchParams.get('success') === 'true';
      const isSuccessVnp = searchParams.get('vnp_ResponseCode') === '00';

      const msgParam = searchParams.get('message');
      const decodedMessage = msgParam ? decodeURIComponent(msgParam) : '';

        if (isSuccessNew || isSuccessVnp) {
            setStatus('success');
            // Translate success message
            setMessage(decodedMessage || 'Payment successful! The course has been activated.');
            
            localStorage.removeItem('pendingCourseId'); 
        } else {
            setStatus('failed');
            // Translate failure message
            setMessage(decodedMessage || 'Transaction failed or cancelled.');
        }
    };

    handlePaymentResult();
  }, [location.search]);

  if (status === 'loading') {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60vh">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
              Verifying payment result...
          </Typography>
        </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>

        {status === 'success' && (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom fontWeight="bold">
              Payment Successful!
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              {message}
            </Typography>
            <Box mt={4}>
                <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => navigate('/my-course')} 
                    sx={{ borderRadius: 20, px: 4 }}
                >
                  Start Learning
                </Button>
            </Box>
          </>
        )}

       
        {status === 'failed' && (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="error.main" gutterBottom fontWeight="bold">
              Transaction Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {message}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/')}>
                    Back to Home
                </Button>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Try Again
                </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentResultPage;