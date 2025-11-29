import React from 'react'
import { useNavigate } from 'react-router-dom'
import StarRateIcon from '@mui/icons-material/StarRate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const InstructorCard = ({ instructor }) => {
    const navigate = useNavigate();
  return (
    <div className='flex flex-col group cursor-pointer' onClick={() => navigate(`/instructors/${instructor.id}`)}>
      <div className='relative overflow-hidden rounded-xl mb-3 aspect-square'>
        <img src={instructor.image} alt={instructor.name} 
            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'/>
        <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300'></div>
      </div>

      <div className='flex justify-between items-start'>
        <div>
            <h3 className='font-bold text-gray-900 text-lg'>{instructor.name}</h3>
            <p className='text-gray-500 text-sm'>{instructor.title}</p>

            <div className='flex items-center mt-1 text-amber-500 text-sm'>
                <StarRateIcon sx={{width: 18, height: 18}} />
                <span className='ml-1 font-medium text-gray-700'>{instructor.rating}</span>
                <span className='text-gray-400 text-xs ml-1'>{instructor.reviews}</span>
            </div>
        </div>

        <div className='mt-1'>
            <ExpandMoreIcon sx={{width: 20, height: 20}}/>
        </div>

      </div>
    </div>
  )
}

export default InstructorCard
