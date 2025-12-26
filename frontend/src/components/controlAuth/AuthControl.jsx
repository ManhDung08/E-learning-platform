import React from 'react';
import { Button, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import AuthModal from '../auth/AuthModal';
import { openAuthModal, closeAuthModal } from '../../Redux/Auth/auth.action';

const AuthControl = () => {
  const dispatch = useDispatch();
  const { authModalOpen, authModalView } = useSelector(state => state.auth);

  const handleOpenLogin = () => {
    dispatch(openAuthModal('login'));
  }
  const handleOpenRegister = () => {
    dispatch(openAuthModal('register'));
  }

  const handleCloseAuthModal = () => {
    dispatch(closeAuthModal());
  }
  

    return (
    <div>

      <Box sx={{display: 'flex', gap: 1}}>
        <Button variant='outlined'
              onClick={handleOpenRegister}
              sx={{ color: '#97A87A', borderColor: '#97A87A', '&:hover': { bgcolor: '#829366', color: '#FFFFFF' },  borderRadius: '20px', paddingX: '20px'}}>
          Register
        </Button>
        <Button variant='contained'
              onClick={handleOpenLogin}
              sx={{ bgcolor: '#97A87A', '&:hover': { bgcolor: '#829366' },  borderRadius: '20px', paddingX: '20px'}}>
          Log in
        </Button>
      </Box>
      

      <AuthModal open={authModalOpen} onClose={handleCloseAuthModal} initialView={authModalView}/>
    </div>
  )
}

export default AuthControl
