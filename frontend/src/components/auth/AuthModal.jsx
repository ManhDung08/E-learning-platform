import React, { useState } from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Login from './Login';
import Register from './Register';

const AuthModal = ({open, onClose}) => {
    const [view, setView] = useState('login');

    const handleClose = () => {
        onClose();
    };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <IconButton onClick={handleClose}
                    sx={{ position: 'absolute', top: 8, right: 8, color: '#97AB7A' }}>
            <CloseIcon />
        </IconButton>

        <DialogContent sx={{ padding: '2rem' }}>
            {view === 'login' ? (
                <Login onSuccess={handleClose}
                onToggleView={() => setView('register')}/>
            ) : (
                <Register onSuccess={handleClose}
                onToggleView={() => setView('login')}/>
            )}
        </DialogContent>
    </Dialog>
  )
}

export default AuthModal
