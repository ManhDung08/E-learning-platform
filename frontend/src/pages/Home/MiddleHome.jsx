import React from 'react'
import SearchInput from '../../components/search/searchInput'
import { Card, Button, IconButton } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CourseCard from '../../components/courses/CourseCard';
import { useState } from 'react';
import WatchingCard from '../../components/watching/WatchingCard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Footer from '../../components/footer/Footer';

const courses = [
  {
    id: 1,
    title: "Beginner's Guide To Becoming A Professional Frontend Developer",
    thumbnail: "https://i.pinimg.com/1200x/0d/13/46/0d1346fe637831714d4a0a704c4c48a8.jpg",
    instructor: "Sarah Singh",
    role: "Software Developer",
    category: "FRONTEND",
    progress: 4,
    total: 8
  },
  {
    id: 2,
    title: "How To Create Your Online Course",
    thumbnail: "https://i.pinimg.com/736x/eb/58/c1/eb58c120f8a34114597a645689308a10.jpg",
    instructor: "Prashant Kumar",
    role: "Software Developer",
    category: "BUSINESS",
    progress: 2,
    total: 8
  },
  {
    id: 3,
    title: "Learn Software Development With Us!",
    thumbnail: "https://i.pinimg.com/1200x/e5/c1/fa/e5c1fafb3c7730dabdc99e8278a6cff7.jpg",
    instructor: "Prale Tub",
    role: "Software Developer",
    category: "DEVELOPMENT",
    progress: 3,
    total: 8
  },
  {
    id: 4,
    title: "Complete Web Development Bootcamp",
    thumbnail: "https://i.pinimg.com/1200x/24/76/35/2476351774327bc4b938aa15b0b1ea97.jpg",
    instructor: "Rub Loyel",
    role: "Software Developer",
    category: "FRONTEND",
    progress: 5,
    total: 8
  },
  {
    id: 5,
    title: "UI/UX Design Masterclass",
    thumbnail: "https://i.pinimg.com/1200x/20/0a/07/200a072465dc3c288a1d5780105705f7.jpg",
    instructor: "Shaw Caterine",
    role: "Software Developer",
    category: "DESIGN",
    progress: 3,
    total: 8
  }
];

const MiddleHome = () => {

  const [currentIntex, setCurrentIndex] = useState(0);
  const coursesPerPage = 3;
  const maxIndex = Math.max(0, courses.length - coursesPerPage + 1);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className='flex flex-col'>
      <div>
        <SearchInput />
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

            <Button variant='contained' endIcon={<ArrowForwardIcon />}
                    sx={{backgroundColor: '#2b3b31', color: 'white', padding: '12px 28px', 
                        borderRadius: '50px', textTransform: 'none', fontSize: '12px',
                        fontWeight: '600', transition: 'all 0.3s ease', '&:hover': {transform: 'translateY(-2px)',
                        backgroundColor: '#16241b'}}}>
              Join now
            </Button>
          </div>
        </Card>
      </div>

      { /* watching progress */ }
      <div className='p-4 pt-2'>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            <WatchingCard progress={2} total={8} title="Product Design" />
            <WatchingCard progress={3} total={8} title="Frontend React" />
            <WatchingCard progress={5} total={8} title="Product Design" />
            <WatchingCard progress={6} total={8} title="Product Design" />
          </div>
      </div>

      { /* watching continue */ }
      <div className='p-4 pt-2'>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0, color: '#333'}}>Continue Watching</h2>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <IconButton onClick={handlePrev} disabled={currentIntex === 0}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={handleNext} disabled={currentIntex >= maxIndex}>
              <ChevronRightIcon />
            </IconButton>
          </div>
        </div>
        
        <div style={{ overflow: 'hidden', position: 'relative'}}>
          <div style={{ display: 'flex', gap: '20px' , transition: 'transform 0.2s ease',
                        transform: `translateX(-${currentIntex * (280 + 30)}px)` }}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

      </div>

      { /* free courses */ }
      <div className='p-4 pt-2'>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0, color: '#333'}}>Free Courses</h2>
        </div>
        
        <div style={{ overflow: 'hidden', position: 'relative'}}>
          <div style={{ display: 'flex', gap: '20px' , overflowX: 'auto'}}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

      </div>

      { /* pro courses */ }
      <div className='p-4 pt-2'>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0, color: '#333'}}>Pro Courses</h2>
        </div>
        
        <div style={{ overflow: 'hidden', position: 'relative'}}>
          <div  style={{ display: 'flex', gap: '20px' , overflowX: 'auto' }}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default MiddleHome
