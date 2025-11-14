import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '@mui/material/Card';

import HomeIcon from '@mui/icons-material/GridView';
import CoursesIcon from '@mui/icons-material/WorkOutline';
import LiveIcon from '@mui/icons-material/LiveTv';
import AssignmentsIcon from '@mui/icons-material/Assignment';
import SavedIcon from '@mui/icons-material/Bookmarks';
import { Divider } from '@mui/material';
import HelpCenterCard from './HelpCenterCard';

const navigateMenu = [
  {
    title: "Dashboard",
    icon: <HomeIcon/>,
    path: "/"
  },
  {
    title: "My Courses",
    icon: <CoursesIcon/>,
    path: "/courses"
  },
  {
    title: "Live Class",
    icon: <LiveIcon/>,
    path: "/live-class"
  },
  {
    title: "Assignments",
    icon: <AssignmentsIcon/>,
    path: "/assignments"
  },
  {
    title: "Saved",
    icon: <SavedIcon/>,
    path: "/saved"
  }  
];


const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (item) => {
        navigate(item.path);
    }
    
    return (
        <Card elevation={0} className='card h-screen w-[80%] flex flex-col justify-between bg-white shadow-lg rounded-2xl' sx={{overflowX: 'hidden'}}>
            <div>
                <div className='space-y-2 pt-3 px-3 flex flex-col'>
                    {navigateMenu.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <div key={item.title} onClick={() => handleNavigate(item)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-full cursor-pointer font-medium
                                           transition-all duration-200 ${active ? 'bg-[#dadecd] text-[#97A87A] ' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}>
                                {item.icon}
                                <p className=''>{item.title}</p>
                            </div>
                        )
                    } )}
                </div>
            </div>

            
            <div className='mb-4'>
                <HelpCenterCard/>
            </div>
        </Card>
    )
}

export default Sidebar
