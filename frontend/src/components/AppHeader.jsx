import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import AuthControl from './controlAuth/AuthControl';
import { useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';


const AppHeader = () => {

  const { isAuthenticated, loading } = useSelector((store => store.auth));
  const navigate = useNavigate();

  const isLoggedIn = isAuthenticated;
  


  return (
    <AppBar elevation={0} position='static'>
        <Toolbar sx={{backgroundColor: 'white'}}>

            <Typography variant='h6' component={"div"}
                        sx={{ flexGrow: 1, fontWeight: 'bold', color: '#97A87A', cursor: 'pointer' }} onClick={() => navigate('/')} >

                E Learning
            </Typography>

            {!isLoggedIn && (<AuthControl />)}
            
        </Toolbar>
    </AppBar>
  )
}

export default AppHeader;