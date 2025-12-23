import {React, useState, useEffect, useRef } from 'react'
import Register from '../../components/auth/Register'
import { Grid, useMediaQuery, useTheme } from '@mui/material'
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
import LessonQuiz from '../../components/lesson/LessonQuiz';
import AllQuizAttempts from '../../components/lesson/AllQuizAttempts';
import MyCourses from '../MyCourses/MyCourses';
import Videos from '../Videos';
import CourseDetailPage from '../CourseDetail/CourseDetail';
import LiveClassList from '../LiveClass/LiveClassList';
import LiveClassRoom from '../LiveClass/LiveClassRoom';

const HomePage = () => {
  
  const { isAuthenticated, loading } = useSelector((store => store.auth));
  const isLoggedIn = isAuthenticated;
  const { user } = useSelector((store) => store.auth);
  const isStudent = user?.role === 'student';

  const [isRightBarOpen, setIsRightBarOpen] = useState(true);

  const scrollRef = useRef(null);
  const { pathname } = useLocation();
  const theme = useTheme();

  const isLgScreen = useMediaQuery(theme.breakpoints.up('lg'));

  //nếu lg thì để full còn không thì 0.8 hiện mỗi icon
  const leftSidebarSize = isLgScreen ? 2.2 : 0.8;

  const isSidebarCollapsed = !isLgScreen;

  let rightBarSize = 0;
  if (isLoggedIn) {
    const isLearningPage = pathname.includes('/my-course');
    if (isLearningPage) {
        rightBarSize = 0;
    } else {
        rightBarSize = isRightBarOpen ? (isLgScreen ? 2.5 : 0) : (isLgScreen ? 0.6 : 0);
    }
  }

  const mainContentGridSize = 12 - leftSidebarSize - rightBarSize;

  const rightBarMinWidth = isRightBarOpen ? '280px' : '70px';

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
        <Grid size={{ xs: leftSidebarSize }} sx={{display: 'block', height: '100%', overflowY: 'hidden', position: 'relative', zIndex: 1, transition: 'all 0.3s ease', minWidth: isSidebarCollapsed ? '65px' : '260px' }}>
          <div className='h-screen' style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Sidebar isCollapsed={isSidebarCollapsed}/>
          </div>
        </Grid>

        {/* main content, màn bé thfi chiếm trọn 12 phần grid, to thì chiếm 7 */}
        <Grid size={{ xs: mainContentGridSize }} style={{display: 'flex', justifyContent: 'center'}} 
              sx={{bgcolor: '#F4F6F8', height: '100%', overflowY: 'auto', position: 'relative', overflowX: 'hidden', zIndex: 2, transition: 'all 0.3s ease'}} ref={scrollRef}>    
          <div style={{width: '100%', padding: '10px',  minHeight: '100%', display: 'flex', flexDirection: 'column'}}>
            <Routes>
              {/* student */}
              <Route path="/" element={<MiddleHome />} />
              <Route path="/dashboard" element={<MiddleHome />} />
              {/* <Route path="/my-course" element={<LessonQuiz lessonId={13} />} /> */}
              <Route path="/my-course" element={<MyCourses />} />
              <Route path="/my-course/course/learn/:courseId" element={<Videos />} />
              <Route path="/live-class" element={<LiveClassList />} />
              <Route path="/live-class/room/:roomId" element={<LiveClassRoom />} />
              <Route path="/instructors" element={<InstructorsList />} />
              <Route path="/instructors/:id" element={<InstructorDetail />} />
              <Route path="/search" element={<SearchResultsPage />} />
              {/* instructor */}
              <Route path="/instructor/dashboard" element={<div>Instructor Dashboard</div>} />
              <Route path="/instructor/courses" element={<InstructorCourses />} />
              <Route path="/instructor/students" element={<div>My Students</div>} />
              <Route path="/instructor/revenue" element={<div>Revenue Page</div>} />
              <Route path="/instructor/quiz/:quizId/attempts" element={<AllQuizAttempts />} />
              {/* admin */}
              <Route path="/admin/dashboard" element={<Dashboard />}/>
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/transactions" element={<TransactionManagement />} />
              <Route path="/admin/quiz/:quizId/attempts" element={<AllQuizAttempts />} />


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

        {isLoggedIn && rightBarSize > 0 && (
          <Grid size={{ xs: rightBarSize }} sx={{display: { xs: 'none', lg: 'block'}, height: '100%', overflowY: 'auto', 
                position: 'relative', zIndex: 1, transition: 'all 0.3s ease', minWidth: isLgScreen ? rightBarMinWidth : 0}}>
          <div style={{ height: '100%', width: '100%' }}> 
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
