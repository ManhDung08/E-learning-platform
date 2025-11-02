import React, { useState } from 'react';
import { Button } from '@mui/material';
import AuthModal from '../auth/AuthModal';

const AuthControl = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleOpenLoginModal = () => {
    setAuthModalOpen(true);
  }
  const handleCloseLoginModal = () => {
    setAuthModalOpen(false);
  }

    return (
    <div>
      <Button variant='contained'
            onClick={handleOpenLoginModal}
            sx={{ bgcolor: '#97A87A', '&:hover': { bgcolor: '#829366' }}}>
        Đăng nhập
      </Button>

      <AuthModal open={authModalOpen} onClose={handleCloseLoginModal}/>
    </div>
  )
}

export default AuthControl
