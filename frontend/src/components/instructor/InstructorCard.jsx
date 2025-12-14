import React from 'react';
import { Avatar, Typography } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

const InstructorCard = ({ instructor }) => {
  // const navigate = useNavigate();

  return (
    <div 
        // onClick={() => navigate(`/instructors/${instructor.id}`)}
        className='bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md 
                    transition-shadow border border-gray-100 flex flex-col items-center
                    p-6 text-center cursor-pointer h-full'
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