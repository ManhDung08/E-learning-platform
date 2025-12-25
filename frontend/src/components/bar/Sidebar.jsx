import React, { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '@mui/material/Card';
import { useSelector } from 'react-redux';
import { Tooltip } from '@mui/material';

//role student icons
import HomeIcon from '@mui/icons-material/GridView';
import CoursesIcon from '@mui/icons-material/WorkOutline';
import LiveIcon from '@mui/icons-material/LiveTv';
import AssignmentsIcon from '@mui/icons-material/Checklist';
import SavedIcon from '@mui/icons-material/BookmarkBorder';
import SchoolIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // 1. Import icon mới cho Help Center

//role intructor + admin icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// XÓA dòng import HelpCenterCard vì không dùng nữa
// import HelpCenterCard from './HelpCenterCard'; 

const studentMenu = [
  {
    title: "Dashboard",
    icon: <HomeIcon/>,
    path: "/dashboard"
  },
  {
    title: "My Courses",
    icon: <CoursesIcon/>,
    path: "/my-course"
  },
  {
    title: "Certificates",
    icon: <EmojiEventsIcon/>,
    path: "/certificates"
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
  },
  {
    title: "Our Mentors",
    icon: <SchoolIcon />,
    path: "/instructors"
  },
  // 2. Thêm Help Center vào menu của Student
  {
    title: "Help Center",
    icon: <HelpOutlineIcon />,
    path: "/support"
  }
];

const instructorMenu = [
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    path: "/instructor/dashboard"
  },
  {
    title: "My Courses",
    icon: <VideoLibraryIcon />,
    path: "/instructor/courses"
  },
  {
    title: "Students",
    icon: <SchoolIcon />,
    path: "/instructor/students"
  },
  // Thêm Help Center vào menu của Instructor (nếu cần)
  {
    title: "Help Center",
    icon: <HelpOutlineIcon />,
    path: "/support"
  }
];

const adminMenu = [
  {
    title: "Dashboard",
    icon: <AnalyticsIcon />,
    path: "/admin/dashboard"
  },
  {
    title: "User Management",
    icon: <PeopleIcon />,
    path: "/admin/users"
  },
  {
    title: "Course Management",
    icon: <VideoLibraryIcon />,
    path: "/admin/courses"
  },
  {
    title: "Transactions",
    icon: <AttachMoneyIcon />,
    path: "/admin/transactions"
  },
  {
    title: "Support User",
    icon: <SupportAgentIcon />,
    path: "/admin/support-ticket"
  },
]


const Sidebar = ({ isCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useSelector(store => store.auth);
    const role = user?.role || 'student';


    const menuItems = useMemo(() => {
      if (role === 'admin') return adminMenu;
      if (role === 'instructor') return instructorMenu;
      return studentMenu;
    }, [role]);

    const handleNavigate = (item) => {
        navigate(item.path);
    }
    
    return (
        <Card 
              elevation={0} 
              sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  // justifyContent: 'space-between', // Có thể bỏ dòng này nếu muốn các item dồn lên trên
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflowX: 'hidden', 
                  height: 'calc(100vh - 65px)',
                  transition: 'all 0.3s ease-in-out',
                  width: isCollapsed ? '70px' : '85%',
                  alignItems: isCollapsed ? 'center' : 'stretch',
                  py: isCollapsed ? 2 : 0,
                  minWidth: '70px',
                  flexShrink: 0,
              }}
          >
            <div className={`w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                {!isCollapsed ? (
                    <div className='px-10 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider transition-opacity duration-300'>
                        {role} MENU
                    </div>
                ) : (
                    <div className='h-4'></div>
                )}
                <div className={`space-y-2 flex flex-col ${isCollapsed ? 'px-2 items-center' : 'px-3'}`}>
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        
                        const content = (
                          <div onClick={() => handleNavigate(item)}
                              className={`flex items-center rounded-full cursor-pointer font-medium transition-all duration-200
                                            ${isCollapsed 
                                            ? 'justify-center p-3 w-10 h-10'
                                            : 'space-x-3 px-4 py-3'
                                    }
                                    ${active 
                                        ? 'bg-[#dadecd] text-[#97A87A]' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                    }
                                  `}>
                            <span className={isCollapsed ? "" : ""}>{item.icon}</span>
                            
                            {!isCollapsed && (
                              <p className='whitespace-nowrap'>{item.title}</p>
                            )}
                          </div>
                        );

                        return (
                            <div key={item.title}>
                              {isCollapsed ? (
                                    <Tooltip title={item.title} placement="right" arrow>
                                        {content}
                                    </Tooltip>
                                ) : content}            
                            </div>
                        )
                    } )}
                </div>
            </div>

            {/* 3. XÓA PHẦN RENDER HelpCenterCard Ở ĐÂY */}
            {/* {!isCollapsed && (
                <div className='mb-4 transition-opacity duration-300'>
                    <HelpCenterCard />
                </div>
            )} */}
        </Card>
    )
}

export default Sidebar