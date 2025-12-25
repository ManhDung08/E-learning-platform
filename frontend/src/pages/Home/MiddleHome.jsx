import React, {useEffect} from 'react'
import { Card, Button, IconButton, CircularProgress } from '@mui/material'
import { useState } from 'react';

import CourseCard from '../../components/courses/CourseCard';
import SearchInput from '../../components/search/searchInput'
import WatchingCard from '../../components/watching/WatchingCard';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import AuthModal from '../../components/auth/AuthModal';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { getAllCoursesAction } from '../../Redux/Course/course.action';

const MiddleHome = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { courses, loading } = useSelector(store => store.course);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [initialView, setInitialView] = useState('login');
  const [currentIntex, setCurrentIndex] = useState(0);
  const { user } = useSelector(store => store.auth);

  const handleJoinClick = () => {
    setInitialView('login');
    setAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };
  
  useEffect(() => {
    dispatch(getAllCoursesAction(1, 50, ""));
  }, [dispatch]);

  const freeCourses = courses?.filter(course => course.priceVND === 0) || [];
  const proCourses = courses?.filter(course => course.priceVND > 0) || [];

  const handleSearch = (keyword) => {
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  }

  return (
    <div className='flex flex-col'>
      <div>
        <SearchInput placeholder="Search for courses, mentors..." 
                    onSearch={handleSearch}/>
      </div>
      {/* banner ? */}
      <div className='p-4 pt-2'>
        <Card sx={{borderRadius: '15px', padding: '25px', background: 'linear-gradient(135deg, #4c6b58 0%, #97A87A 50%, #DADECD 100%)',
                  color: 'white', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{position: 'relative'}}>
            <p style={{fontSize: '14px', fontWeight: '600', letterSpacing: '1px', marginBottom: '12px', opacity: 0.9}}>
              ONLINE COURSE
            </p>

            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.2', maxWidth: '500px' }}>
              Sharpen Your Skills With Professional Online Courses
            </h2>

            { !user && (<Button variant='contained' endIcon={<ArrowForwardIcon />} onClick={handleJoinClick}
                    sx={{backgroundColor: '#2b3b31', color: 'white', padding: '12px 28px', 
                        borderRadius: '50px', textTransform: 'none', fontSize: '12px',
                        fontWeight: '600', transition: 'all 0.3s ease', '&:hover': {transform: 'translateY(-2px)',
                        backgroundColor: '#16241b'}}}>
              Join now
            </Button>)}
          </div>
        </Card>
      </div>

      { /* watching progress */ }
      {/* <div className='p-4 pt-2'>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            <WatchingCard progress={2} total={8} title="Product Design" />
            <WatchingCard progress={3} total={8} title="Frontend React" />
            <WatchingCard progress={5} total={8} title="Product Design" />
            <WatchingCard progress={6} total={8} title="Product Design" />
          </div>
      </div> */}

      { /* free course */ }
      <div className='p-4 pt-2'>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0, color: '#333'}}>Free Courses</h2>
        </div>
        
        {loading ? (
           <div className="flex justify-center p-4"><CircularProgress size={30} sx={{color: '#97A87A'}} /></div>
        ) : (
          <div style={{ overflow: 'hidden', position: 'relative'}}>
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {freeCourses.length > 0 ? (
                freeCourses.map((course) => (
                  <div key={course.id} style={{minWidth: '280px'}}> 
                    <CourseCard course={course} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No free courses available at the moment.</p>
              )}
            </div>
          </div>
        )}
      </div>
        
        <div className='p-4 pt-2'>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0, color: '#333'}}>Pro Courses</h2>
        </div>
        
        {loading ? (
           <div className="flex justify-center p-4"><CircularProgress size={30} sx={{color: '#97A87A'}} /></div>
        ) : (
          <div style={{ overflow: 'hidden', position: 'relative'}}>
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {proCourses.length > 0 ? (
                proCourses.map((course) => (
                  <div key={course.id} style={{minWidth: '280px'}}>
                    <CourseCard course={course} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No pro courses available at the moment.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal 
        open={authModalOpen} 
        onClose={handleCloseAuthModal} 
        initialView={initialView}
      />

    </div>
  )
}

export default MiddleHome
