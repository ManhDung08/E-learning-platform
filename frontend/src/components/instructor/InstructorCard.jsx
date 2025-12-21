import React from 'react';
import { Avatar, Typography } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

const InstructorCard = ({ instructor }) => {
  // const navigate = useNavigate();

  return (
    <div 
        // onClick={() => navigate(`/instructors/${instructor.id}`)}
        style={{
            backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
            cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',flexDirection: 'column', alignItems: 'center', padding: '24px',
            height: '100%', border: '1px solid #f3f4f6'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
    >
        <Avatar 
            src={instructor.profileImageUrl} 
            alt={instructor.firstName}
            sx={{ width: 100, height: 100, mb: 2, border: '3px solid #f3f4f6' }}
        />
        
        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1.1rem' }}>
            {instructor.firstName} {instructor.lastName}
        </Typography>

        <span className={`px-3 py-1 text-xs font-semibold rounded-full mb-4 ${
            instructor.role === 'instructor' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-blue-50 text-blue-700'
        }`}>
            {instructor.role === 'instructor' ? 'Instructor' : 'Admin'}
        </span>
        
        <div className='flex gap-4 mt-auto pt-4 border-t border-gray-50 w-full justify-center'>
            <div className='text-center'>
                <span className='block font-bold text-gray-700'>--</span>
                <span className='text-[10px] text-gray-400 uppercase'>Courses</span>
            </div>
            <div className='text-center'>
                <span className='block font-bold text-gray-700'>--</span>
                <span className='text-[10px] text-gray-400 uppercase'>Students</span>
            </div>
        </div>
    </div>
  )
}

export default InstructorCard;