import React from 'react'
import Register from '../../components/auth/Register'
import { Grid } from '@mui/material'
import { Route, Routes, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/bar/Sidebar';
import MiddleHome from './MiddleHome';

const HomePage = () => {
  
  return (
    <div style={{ paddingTop: '65px' }}>
      <Grid container spacing={0} wrap='nowrap'>
        {/* phần sidebar, màn bé thì chiếm 0 grid, màn to thì chiếm 2.5*/}
        <Grid size={{ xs: 0, lg: 2.5 }} sx={{display: { xs: 'none', lg: 'block' }}}>
          <div className='h-screen' style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Sidebar />
          </div>
        </Grid>

        {/* main content, màn bé thfi chiếm trọn 12 phần grid, to thì chiếm 7 */}
        <Grid size={{ xs: 12, lg: 7 }} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} bgcolor={'gray'}>    

          <Routes>
            <Route path="/" element={<MiddleHome />} />
            <Route path="/courses" element={<MiddleHome />} />
          </Routes>
        </Grid>

        <Grid size={{ xs: 0, lg: 2.5 }} sx={{display: { xs: 'none', lg: 'block' }}}>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            Right Sidebar
          </div>
        </Grid>
      </Grid>
    </div>
  )
}

export default HomePage
