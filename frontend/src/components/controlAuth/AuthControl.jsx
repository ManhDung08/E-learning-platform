import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import AuthModal from '../auth/AuthModal';

const AuthControl = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [initialView, setInitialView] = useState('login');

  const handleOpenLogin = () => {
    setInitialView('login');
    setAuthModalOpen(true);
  }
  const handleOpenRegister = () => {
    setInitialView('register');
    setAuthModalOpen(true);
  }

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
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
      

      <AuthModal open={authModalOpen} onClose={handleCloseAuthModal} initialView={initialView}/>
    </div>
  )
}

export default AuthControl
