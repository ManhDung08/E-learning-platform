import React from 'react'
import Register from '../../components/auth/Register'
import { Grid } from '@mui/material'
import { Route, Routes, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/bar/Sidebar';
import MiddleHome from './MiddleHome';
import RightBar from '../../components/bar/RightBar';

const HomePage = () => {
  
  return (
    <div style={{height: 'calc(100vh - 65px)', overflow: 'hidden'}}>
      <Grid container spacing={0} wrap='nowrap' sx={{height: '100%'}}>
        {/* phần sidebar, màn bé thì chiếm 0 grid, màn to thì chiếm 2.5*/}
        <Grid size={{ xs: 0, lg: 2.5 }} sx={{display: { xs: 'none', lg: 'block', height: '100%', overflowY: 'hidden' }}}>
          <div className='h-screen' style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Sidebar />
          </div>
        </Grid>

        {/* main content, màn bé thfi chiếm trọn 12 phần grid, to thì chiếm 7 */}
        <Grid size={{ xs: 12, lg: 7 }} style={{display: 'flex', justifyContent: 'center'}} sx={{bgcolor: '#F4F6F8', height: '100%', overflowY: 'auto'}}>    
          <div style={{width: '100%', padding: '10px'}}>
            <Routes>
              <Route path="/" element={<MiddleHome />} />
              <Route path="/courses" element={<MiddleHome />} />
            </Routes>
          </div>
        </Grid>

        <Grid size={{ xs: 0, lg: 2.5 }} sx={{display: { xs: 'none', lg: 'block', height: '100%', overflowY: 'auto' }}}>
          <div>
            <RightBar />
          </div>
        </Grid>
      </Grid>
    </div>
  )
}

export default HomePage
