import React from 'react'
import { Stack, Box, Typography, IconButton, Avatar, Button, CircularProgress, Tooltip, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUserAction } from '../../Redux/Auth/auth.action';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import MoreIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/NotificationsNone';
import MailIcon from '@mui/icons-material/MailOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

const mentors = [
    { name: 'Sarah Singh', role: 'Business Analyst' },
    { name: 'Sarah Singh', role: 'Software Developer' },
    { name: 'Sarah Singh', role: 'UI/UX Designer' },
    { name: 'Sarah Singh', role: 'Software Developer' },
    { name: 'Sarah Singh', role: 'Software Developer' }
]

const RightBar = ({ isOpen, setIsOpen }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const { user, loading } = useSelector(store => store.auth);

    const getUserName = () => {
        if (!user) return 'Guest';

        return user.firstName || user.username || user.email?.splot('@')[0] || 'User';
    };

    const getAvatarUrl = () => {
        return user?.profileImageUrl || 'https://i.pinimg.com/736x/64/1d/78/641d788c014292f33dddadf001e4f0af.jpg';
    }

    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }

    
    const handleLogout = async () => {
        setIsLoggingOut(true);

        await dispatch(logoutUserAction());
    }

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleCloseMenu = () => {
        setAnchorEl(null);
    }
    
    const handleNavigateProfile = () => {
        handleCloseMenu();
        navigate('/profile');
    };

    if (!isOpen) {
        return (
            <Box sx={{height: '100vh', width: '60px', bgcolor: 'white', borderLeft: '1px solid #eee', display: 'flex',
                flexDirection: 'column', alignItems: 'center', pt: 2, transition: 'width 0.3s'
            }}>
                <IconButton onClick={() => setIsOpen(true)} sx={{color: '#97A87A'}}>
                    <KeyboardDoubleArrowLeftIcon />
                </IconButton>

                <Avatar sx={{width: 40, height: 40, mt: 3, border: '2px solid #97A87A'}}
                        src={getAvatarUrl()} alt={getUserName()} />
                
                <Tooltip title="Logout" placement="left">
                    <IconButton onClick={handleLogout} sx={{ mt: 3, mb: 4, color: '#e05e60'}}>
                        <LogoutIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    }

  return (
    <Stack spacing={4} sx={{ height: '100vh'}}>
        <Box sx={{bgcolor: 'white', p: 2}}>
            <Stack direction="row" justifyContent="space-between"
                    alignItems="center" mb={2}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Tooltip title="">
                        <IconButton size='small' onClick={() => setIsOpen(false)}>
                            <KeyboardDoubleArrowRightIcon fontSize='small'/>
                        </IconButton>
                    </Tooltip>
                    <Typography variant='h8' fontWeight='600' color='#525252'>
                        Your Profile
                    </Typography>
                </Stack>
                
                <IconButton size='small' onClick={handleOpenMenu}>
                    <MoreIcon />
                </IconButton>

                <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu} 
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{ elevation: 3, sx: { borderRadius: 3, minWidth: 150 } }}>
                        <MenuItem onClick={handleNavigateProfile}>
                            <ListItemIcon>
                                <PersonIcon fontSize='small'/>
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleCloseMenu}>
                            <ListItemIcon>
                                <SettingsIcon fontSize='small'/>
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                </Menu>
            </Stack>

            <Stack  direction='column' spacing={2} alignItems='center'>
                <Avatar sx={{width: 90, height: 90, marginBottom: '20px', border: '5px solid #97A87A'}} 
                        src={getAvatarUrl()} alt={getUserName()}/>
                
                <Typography variant='h6' fontWeight='600' color='#525252'>
                    {loading ? 'Loading...' : `${getGreeting()} ${getUserName()}`}
                </Typography>

                <Typography variant='body2' color='#525252' textAlign='center' maxWidth={250}>
                    Continue Your Journey And Achieve Your Target
                </Typography>

                {user?.email && (
                    <Typography variant='caption' color='#999' textAlign='center'>
                        {user.email}
                    </Typography>
                )}

                <Stack direction='row' spacing={2} mt={2}>
                    <IconButton sx={{ border: '2px solid #eee', bgcolor: 'white' }}>
                        <NotificationsIcon fontSize='small'/>
                    </IconButton>

                    <IconButton sx={{ border: '2px solid #eee', bgcolor: 'white' }}>
                        <MailIcon fontSize='small'/>
                    </IconButton>

                    <IconButton sx={{ border: '2px solid #eee', bgcolor: 'white' }}>
                        <CalendarTodayIcon fontSize='small'/>
                    </IconButton>
                </Stack>
            </Stack>
        </Box>

        <Box sx={{bgcolor: 'white', borderRadius: 2, p: 2}}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant='h8' fontWeight='600' color='#525252'>
                    Your Instructor
                </Typography>
                <IconButton size='small' sx={{'&:hover': {backgroundColor: 'white'}}}>
                    <Typography sx={{ fontSize: 20, fontWeight: 'bold' }}>+</Typography>
                </IconButton>
            </Stack>

            <Stack spacing={1}>
                {mentors.map((mentor, index) => (
                    <Stack key={index} direction='row' alignItems='center' justifyContent='space-between'
                            sx={{ '&:hover': {bgcolor: '#f9f9f9'}, p: 1, borderRadius: 1 }}>
                        <Stack direction="row" alignItems='center' spacing={1.5}>
                            <Avatar sx={{ width: 40, height: 40 }} 
                                    src='https://i.pinimg.com/736x/2f/49/df/2f49dfa3f97e24eec56d24e9d704c43b.jpg'/>

                            <Box>
                                <Typography variant='body2' fontWeight='600' color='#525252'>
                                    {mentor.name}
                                </Typography>

                                <Typography variant='caption' color='#999'>
                                    {mentor.role}
                                </Typography>
                            </Box>
                        </Stack>
                        <Button size='small' variant='contained'
                                sx={{ bgcolor: '#97A87A', textTransform: 'none', borderRadius: 4, minWidth: 30,
                                    fontSize: 10}}>
                            Follow
                        </Button>
                    </Stack>
                ))}
            </Stack>

            <Button fullWidth sx={{ mt: 2, bgcolor: '#dadecd', borderRadius: 5, color: '#97A87A', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#c5c9b5' } }}>
                See All
            </Button>
        </Box>

        <Button fullWidth startIcon={isLoggingOut ? <CircularProgress size={30} color='inherit' /> : <LogoutIcon />} onClick={handleLogout} disabled={isLoggingOut}
                sx={{ color: '#e05e60', textTransform: 'none', justifyContent: 'center', fontWeight: 600,
                    '&:hover': {bgcolor: '#fff5f5'}, ...(isLoggingOut && {bgcolor: '#fff5f5', color: '#c04a4c'})
                 }}>
            {isLoggingOut ? 'Logging Out...' : 'Logout'}
        </Button>
    </Stack>
    
  )
}

export default RightBar
