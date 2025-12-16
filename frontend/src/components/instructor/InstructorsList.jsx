import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPublicInstructorsAction } from '../../Redux/Instructor/instructor.action';
import { Pagination, Avatar, Typography } from '@mui/material'
import SearchInput from '../search/searchInput';
import InstructorCard from './InstructorCard';

const InstructorsList = () => {
  const dispatch = useDispatch();

  const topRef = useRef(null);

  const [currentSearch, setCurrentSearch] = useState("");
  const { instructors, pagination, loading } = useSelector(store => store.instructor);

  useEffect(() => {
    dispatch(getPublicInstructorsAction(1, 12, ""));

  }, [dispatch]);

  const handleSearchSubmit = (keyword) => {
    setCurrentSearch(keyword);
    dispatch(getPublicInstructorsAction(1, 12, keyword));
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePageChange = (event, value) => {
    dispatch(getPublicInstructorsAction(value, 12, currentSearch));

    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={topRef} className='px-5 pb-20 bg-gray-50'>
      {/* search */}
      <div className='flex flex-col md:flex-row justify-between items-center mb-8 gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Our Instructors</h1>
          <p className='text-gray-500 text-sm mt-1'>Meet our professional mentors</p>
        </div>
                
        <div className="w-full md:w-6/12">
          <SearchInput placeholder="Search instructors..." 
                      onSearch={handleSearchSubmit} />
        </div>
      </div>

      {loading ? (
                <div className="flex justify-center items-center h-64 text-gray-400">
                    Loading instructors...
                </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {instructors && instructors.length > 0 ? ( instructors.map((instructor) => (
                          <InstructorCard key={instructor.id} instructor={instructor} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-500 italic">
                            No instructors found.
                        </div>
                    )}

                    {pagination && pagination.totalPages > 1 && (
                        <div className='flex justify-center mt-10'>
                            <Pagination 
                                count={pagination.totalPages} 
                                page={pagination.currentPage} 
                                onChange={handlePageChange}
                                shape="rounded"
                                size="large"
                                sx={{
                                      '& .MuiPaginationItem-root': {
                                          '&.Mui-selected': {
                                              backgroundColor: '#97A87A',
                                              color: 'white',
                                              '&:hover': {
                                                  backgroundColor: '#829169',
                                              }
                                          }
                                      }
                                  }}
                            />
                        </div>
                    )}
                </div>
            )}

        

        

        
      
    </div>
  )
}

export default InstructorsList
