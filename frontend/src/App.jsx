import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppHeader from './components/AppHeader';
import AppRoutes from './routes/AppRoutes';
import { getProfileAction } from './Redux/Auth/auth.action';
import { CircularProgress, Box } from '@mui/material';

import VerifyEmailModal from './components/auth/VerifyEmailModal';
import { useDispatch, useSelector } from 'react-redux';

import { useDispatch, useSelector } from 'react-redux';
import { getProfileAction } from './Redux/Auth/auth.action';


function App() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);

  const [searchParams] = useSearchParams();
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyToken, setVerifyToken] = useState(null);
  const dispatch = useDispatch();

  const { isAuthChecked } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(getProfileAction());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getProfileAction());
  }, [dispatch]);

  useEffect(() => {
    if (window.location.pathname === '/verify-email') {
      const token = searchParams.get('token');
      if(token) {
        setVerifyToken(token);
        setVerifyModalOpen(true);
      }
    }
  }, [searchParams]);

  const handleVerifySuccess = () => {
    setVerifyModalOpen(false);
    navigate('/dashboard');
  };

  const handleVerifyClose = () => {
    setVerifyModalOpen(false);
    navigate('/dashboard');
  };
  

  if (!isAuthChecked) {
      return (
          <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress /> 
          </Box>
      );
  }

  return (
    <div>
      {/* <AppHeader /> */}
      <AppRoutes />

      <VerifyEmailModal 
        open={verifyModalOpen}
        token={verifyToken}
        onClose={handleVerifyClose}
        onSuccess={handleVerifySuccess}
      />
    </div>
  )
}

export default App
