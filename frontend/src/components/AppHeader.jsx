import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import AuthControl from './controlAuth/AuthControl';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const AppHeader = () => {
  const { isAuthenticated } = useSelector((store => store.auth));
  const isLoggedIn = isAuthenticated;
  
  // 2. Khởi tạo hook navigate
  const navigate = useNavigate();

  return (
    <AppBar elevation={0} position='static'>
        <Toolbar sx={{backgroundColor: 'white'}}>
            <Typography 
                variant='h6' 
                component={"div"}
                
                onClick={() => navigate('/')}
                sx={{ 
                    flexGrow: 1, 
                    fontWeight: 'bold', 
                    color: '#97A87A',
                    cursor: 'pointer' 
                }}
            >
                E Learning
            </Typography>

            {!isLoggedIn && (<AuthControl />)}
            
        </Toolbar>
    </AppBar>
  )
}

export default AppHeader;