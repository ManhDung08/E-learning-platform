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
        <Toolbar sx={{backgroundColor: 'white', px: 3}}>

            <Typography variant='h6' component={"div"}
                        sx={{ flexGrow: 1, fontWeight: 'bold', color: '#97A87A' }} >

                <span 
                  style={{
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={() => navigate('/')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {/* Logo Icon */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '42px',
                    height: '42px',
                    background: 'linear-gradient(135deg, #97A87A 0%, #7a8d5f 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(151, 168, 122, 0.3)',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3L1 9L12 15L23 9L12 3Z" fill="white" fillOpacity="0.9"/>
                      <path d="M1 17L12 23L23 17M1 13L12 19L23 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0'}}>
                    <span style={{fontSize: '20px', letterSpacing: '0.5px', lineHeight: '1.2'}}>E Learning</span>
                    <span style={{fontSize: '9px', color: '#7a8d5f', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase'}}>Education Platform</span>
                  </div>
                </span>
            </Typography>

            {!isLoggedIn && (<AuthControl />)}
            
        </Toolbar>
    </AppBar>
  )
}

export default AppHeader;