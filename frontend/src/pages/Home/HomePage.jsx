import React, { useState, useEffect, useRef } from 'react'
import { Grid, useMediaQuery, useTheme, Drawer, IconButton, Box } from '@mui/material'
import { Route, Routes, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu'; 
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { useSelector } from 'react-redux';

import Sidebar from '../../components/bar/Sidebar';
import MiddleHome from './MiddleHome';
import RightBar from '../../components/bar/RightBar';
import Footer from '../../components/footer/Footer';
import InstructorsList from '../../components/instructor/InstructorsList';
import InstructorDetail from '../../components/instructor/InstructorDetail';
import UserManagement from '../Admin/UserManagement';
import Dashboard from '../Admin/Dashboard';
import CourseManagement from '../Admin/CourseManagement';
import TransactionManagement from '../Admin/TransactionManagement';
import InstructorCourses from '../Instructor/InstructorCourses';
import SearchResultsPage from '../../components/search/SearchResults';
import AllQuizAttempts from '../../components/lesson/AllQuizAttempts';
import MyCourses from '../MyCourses/MyCourses';
import Videos from '../Videos';
import LiveClassList from '../LiveClass/LiveClassList';
import LiveClassRoom from '../LiveClass/LiveClassRoom';
import SupportManagement from '../Admin/SupportManagement';
import MyStudent from '../Instructor/MyStudent';
import InstructorDashboard from '../Instructor/InstructorDashboard';
import CreateTicketPage from '../SupportTicket'; // Đảm bảo đã import trang Support

const HomePage = () => {
  
  const { isAuthenticated } = useSelector((store => store.auth));
  const isLoggedIn = isAuthenticated;
  const { user } = useSelector((store) => store.auth);
  const isStudent = user?.role === 'student';

  const [isRightBarOpen, setIsRightBarOpen] = useState(true);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  const scrollRef = useRef(null);
  const { pathname } = useLocation();
  const theme = useTheme();

  const isLgScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isMdScreen = useMediaQuery(theme.breakpoints.up('md'));

  let leftSidebarSize = 0;
  if (isMdScreen) {
      leftSidebarSize = isLgScreen ? 2.2 : 0.8; 
  }
  const isSidebarCollapsed = !isLgScreen;

  let rightBarSize = 0;
  if (isLoggedIn) {
    const isLearningPage = pathname.includes('/my-course');
    if (isLearningPage) {
        rightBarSize = 0;
    } else {
        rightBarSize = isLgScreen ? (isRightBarOpen ? 2.5 : 0.6) : 0;
    }
  }

  const mainContentGridSize = 12 - leftSidebarSize - rightBarSize;
  const rightBarMinWidth = isRightBarOpen ? '280px' : '70px';

  const handleLeftDrawerToggle = () => setMobileLeftOpen(!mobileLeftOpen);
  const handleRightDrawerToggle = () => setMobileRightOpen(!mobileRightOpen);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    setMobileLeftOpen(false);
    setMobileRightOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoggedIn) {
        setMobileRightOpen(false);
        setMobileLeftOpen(false);
    }
  }, [isLoggedIn]);

  return (
    <>
    <div style={{height: 'calc(100vh - 65px)', width: '100vw', overflow: 'hidden', position: 'relative'}}>

      <Drawer
        variant="temporary"
        open={mobileLeftOpen}
        onClose={handleLeftDrawerToggle}
        ModalProps={{ keepMounted: true }} 
        sx={{
          display: { xs: 'block', md: 'none' }, 
          '& .MuiBackdrop-root': { top: '65px' }, 
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '260px',
            top: '65px',
            height: 'calc(100% - 65px)' 
          }, 
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderBottom: '1px solid #f0f0f0' }}>
                <IconButton onClick={handleLeftDrawerToggle}>
                    <MenuOpenIcon /> 
                </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Sidebar isCollapsed={false} />
            </Box>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={mobileRightOpen}
        onClose={handleRightDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiBackdrop-root': { top: '65px' },
          '& .MuiDrawer-paper': { 
            width: '300px', 
            boxSizing: 'border-box',
            top: '65px',
            height: 'calc(100% - 65px)',
          },
        }}
      >
        {isLoggedIn && <RightBar isOpen={true} setIsOpen={handleRightDrawerToggle} />}
      </Drawer>

      <Grid container spacing={0} wrap='nowrap' sx={{height: '100%'}}>
        
        {isMdScreen && (
            <Grid size={{ xs: leftSidebarSize }} sx={{display: 'block', height: '100%', overflowY: 'hidden', position: 'relative', zIndex: 1, transition: 'all 0.3s ease', minWidth: isSidebarCollapsed ? '65px' : '260px' }}>
            <div className='h-screen' style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Sidebar isCollapsed={isSidebarCollapsed}/>
            </div>
            </Grid>
        )}

        <Grid size={{ xs: mainContentGridSize }} style={{display: 'flex', justifyContent: 'center'}} 
              sx={{bgcolor: '#F4F6F8', height: '100%', overflowY: 'auto', position: 'relative', overflowX: 'hidden', zIndex: 2, transition: 'all 0.3s ease'}} ref={scrollRef}>    
          <div style={{width: '100%', padding: '10px', minHeight: '100%', display: 'flex', flexDirection: 'column'}}>
            
            <Box sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                position: 'fixed', 
                top: '75px',       
                left: '10px',      
                zIndex: 1000       
            }}>
                <IconButton 
                    onClick={handleLeftDrawerToggle} 
                    sx={{ bgcolor: 'white', boxShadow: 2, color: '#333' }}
                >
                    <MenuIcon />
                </IconButton>
            </Box>

            {isLoggedIn && !pathname.includes('/my-course') && (
                <Box sx={{ 
                    display: { xs: 'flex', lg: 'none' }, 
                    position: 'fixed', 
                    top: '75px', 
                    right: '10px', 
                    zIndex: 1000 
                }}>
                    <IconButton onClick={handleRightDrawerToggle} color="primary" sx={{ bgcolor: 'white', boxShadow: 2 }}>
                        <MenuOpenIcon sx={{ transform: 'rotate(180deg)' }} />
                    </IconButton>
                </Box>
            )}

            <Box sx={{ flexGrow: 1 }}>
                <Routes>
                  <Route path="/" element={<MiddleHome />} />
                  <Route path="/dashboard" element={<MiddleHome />} />
                  <Route path="/my-course" element={<MyCourses />} />
                  <Route path="/my-course/course/learn/:courseId" element={<Videos />} />
                  <Route path="/live-class" element={<LiveClassList />} />
                  <Route path="/live-class/room/:roomId" element={<LiveClassRoom />} />
                  <Route path="/instructors" element={<InstructorsList />} />
                  <Route path="/instructors/:id" element={<InstructorDetail />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/instructor/dashboard" element={<div><InstructorDashboard /></div>} />
                  <Route path="/instructor/courses" element={<InstructorCourses />} />
                  <Route path="/instructor/students" element={<div><MyStudent /></div>} />
                  <Route path="/instructor/quiz/:quizId/attempts" element={<AllQuizAttempts />} />
                  <Route path="/admin/dashboard" element={<Dashboard />}/>
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/courses" element={<CourseManagement />} />
                  <Route path="/admin/transactions" element={<TransactionManagement />} />
                  <Route path="/admin/quiz/:quizId/attempts" element={<AllQuizAttempts />} />
                  <Route path="/admin/support-ticket" element={<SupportManagement />} />
                  <Route path="/support" element={<CreateTicketPage />} />
                </Routes>
            </Box>

            {/* Ẩn Footer ở trang support */}
            {isStudent && pathname !== '/support' && (
              <Box sx={{ 
                  marginTop: '40px', 
                  width: '100%',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 10 
              }}>
                <Footer />
              </Box>
            )}

          </div>
        </Grid>

        {isLoggedIn && rightBarSize > 0 && (
          <Grid size={{ xs: rightBarSize }} sx={{display: { xs: 'none', lg: 'block'}, height: '100%', overflowY: 'auto', 
                position: 'relative', zIndex: 1, transition: 'all 0.3s ease', minWidth: isLgScreen ? rightBarMinWidth : 0}}>
          <div style={{ height: '100%', width: '100%' }}> 
            <RightBar isOpen={isRightBarOpen} setIsOpen={setIsRightBarOpen}/>
          </div>
        </Grid>
        )}
      </Grid>
    </div>
    </>
  )
}

export default HomePage