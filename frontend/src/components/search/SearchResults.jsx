import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllCoursesAction } from '../../Redux/Course/course.action';
import { getPublicInstructorsAction } from '../../Redux/Instructor/instructor.action';
import CourseCard from '../courses/CourseCard';
import InstructorCard from '../instructor/InstructorCard';
import { CircularProgress } from '@mui/material';

const SearchResultsPage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('q') || "";

    const { courses, loading: loadingCourses } = useSelector(store => store.course);
    const { instructors, loading: loadingInstructors } = useSelector(store => store.instructor);

    useEffect(() => {
        if (keyword) {
            dispatch(getAllCoursesAction(1, 8, keyword));
            dispatch(getPublicInstructorsAction(1, 8, keyword));
        }
    }, [dispatch, keyword]);

    return (
        <div className="p-8 bg-gray-50 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Search results for: "<span className="text-[#97A87A]">{keyword}</span>"
            </h1>

            <div className="mb-12">
                <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                    Instructors ({instructors.length})
                </h2>
                
                {loadingInstructors ? (
                    <p className="text-gray-500">Searching for instructors...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {instructors.length > 0 ? instructors.map(inst => (
                            <InstructorCard key={inst.id} instructor={inst} />
                        )) : (
                            <p className="text-gray-400 text-sm italic col-span-full">
                                No instructors found matching "{keyword}".
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className='pt-2'>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                        Courses ({courses.length})
                    </h2>
                </div>

                {loadingCourses ? (
                    <div className="flex justify-center p-4"><CircularProgress size={30} sx={{color: '#97A87A'}} /></div>
                ) : (
                    <div style={{ overflow: 'hidden', position: 'relative'}}>
                        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                            {courses.length > 0 ? courses.map(course => (
                                <div key={course.id} style={{minWidth: '280px'}}> 
                                    <CourseCard course={course} />
                                </div>
                            )) : (
                                <p className="text-gray-400 text-sm italic col-span-full">
                                    No courses found matching "{keyword}".
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;