import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import AuthControl from './controlAuth/AuthControl';

const AppHeader = () => {
  return (
    <AppBar elevation={0}>
        <Toolbar sx={{backgroundColor: 'white'}}>
            <Typography variant='h6' component={"div"}
                        sx={{ flexGrow: 1, fontWeight: 'bold', color: '#97A87A' }}>
                E Learning
            </Typography>

            <AuthControl />

        </Toolbar>
    </AppBar>
  )
}

export default AppHeader
