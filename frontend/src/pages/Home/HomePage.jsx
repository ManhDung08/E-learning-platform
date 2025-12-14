import {React, useState, useEffect, useRef } from 'react'
import Register from '../../components/auth/Register'
import { Grid } from '@mui/material'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/bar/Sidebar';
import MiddleHome from './MiddleHome';
import RightBar from '../../components/bar/RightBar';
import Footer from '../../components/footer/Footer';
import { useSelector } from 'react-redux';
import InstructorsList from '../../components/instructor/InstructorsList';
import InstructorDetail from '../../components/instructor/InstructorDetail';
import UserManagement from '../Admin/UserManagement';
import Dashboard from '../Admin/Dashboard';
import CourseManagement from '../Admin/CourseManagement';
import TransactionManagement from '../Admin/TransactionManagement';
import Settings from '../Admin/Settings';
import InstructorCourses from '../Instructor/InstructorCourses';
import SearchResultsPage from '../../components/search/SearchResults';

const HomePage = () => {
  
  const { isAuthenticated, loading } = useSelector((store => store.auth));
  const isLoggedIn = isAuthenticated;
  const { user } = useSelector((store) => store.auth);
  const isStudent = user?.role === 'student';

  const [isRightBarOpen, setIsRightBarOpen] = useState(true);
  const leftSidebarSize = 2;

  const scrollRef = useRef(null);
  const { pathname } = useLocation();

  let rightBarSize = 0;

  if (isLoggedIn) {
    rightBarSize = isRightBarOpen ? 2.5 : 0.5;
  }

  const mainContentGridSize = 12 - leftSidebarSize - rightBarSize;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <>
    <div style={{height: 'calc(100vh - 65px)', overflow: 'hidden'}}>
      <Grid container spacing={0} wrap='nowrap' sx={{height: '100%'}}>
        {/* phần sidebar, màn bé thì chiếm 0 grid, màn to thì chiếm 2.5*/}
        <Grid size={{ xs: 0, lg: leftSidebarSize }} sx={{display: { xs: 'none', lg: 'block', height: '100%', overflowY: 'hidden', position: 'relative', zIndex: 1 }}}>
          <div className='h-screen' style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Sidebar />
          </div>
        </Grid>

        {/* main content, màn bé thfi chiếm trọn 12 phần grid, to thì chiếm 7 */}
        <Grid size={{ xs: 12, lg: mainContentGridSize }} style={{display: 'flex', justifyContent: 'center'}} 
              sx={{bgcolor: '#F4F6F8', height: '100%', overflowY: 'auto', position: 'relative', overflowX: 'hidden', zIndex: 2}} ref={scrollRef}>    
          <div style={{width: '100%', padding: '10px',  minHeight: '100%', display: 'flex', flexDirection: 'column'}}>
            <Routes>
              {/* student */}
              <Route path="/" element={<MiddleHome />} />
              <Route path="/dashboard" element={<MiddleHome />} />
              <Route path="/courses" element={<MiddleHome />} />
              <Route path="/instructors" element={<InstructorsList />} />
              <Route path="/instructors/:id" element={<InstructorDetail />} />
              <Route path="/search" element={<SearchResultsPage />} />
              {/* instructor */}
              <Route path="/instructor/dashboard" element={<div>Instructor Dashboard</div>} />
              <Route path="/instructor/courses" element={<InstructorCourses />} />
              <Route path="/instructor/students" element={<div>My Students</div>} />
              <Route path="/instructor/revenue" element={<div>Revenue Page</div>} />
              {/* admin */}
              <Route path="/admin/dashboard" element={<Dashboard />}/>
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/transactions" element={<TransactionManagement />} />
              <Route path="/admin/settings" element={<Settings />} />

            </Routes>

            {isStudent && (
              <div style={{ 
                marginTop: '40px',
                width: '100%'
              }}>
                <Footer />
              </div>
            )}

          </div>
        </Grid>

        {isLoggedIn && (
          <Grid size={{ xs: 0, lg: rightBarSize }} sx={{display: { xs: 'none', lg: 'block', height: '100%', overflowY: 'auto', position: 'relative', zIndex: 1 }}}>
          <div>
            <RightBar isOpen={isRightBarOpen} setIsOpen={setIsRightBarOpen}/>
          </div>
        </Grid>
        )}
      </Grid>

      {/* <div style={{position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, pointerEvents: 'none'}}>
        <div style={{ pointerEvents: 'auto' }}>
              <Footer />
            </div>
      </div> */}
    </div>

    
    </>
  )
}

export default HomePage
