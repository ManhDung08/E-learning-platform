import React from 'react'
import { Stack, Box, Typography, IconButton, Avatar, Button } from '@mui/material'
import MoreIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/NotificationsNone';
import MailIcon from '@mui/icons-material/MailOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';

const mentors = [
    { name: 'Sarah Singh', role: 'Business Analyst' },
    { name: 'Sarah Singh', role: 'Software Developer' },
    { name: 'Sarah Singh', role: 'UI/UX Designer' },
    { name: 'Sarah Singh', role: 'Software Developer' },
    { name: 'Sarah Singh', role: 'Software Developer' }
]

const RightBar = () => {
  return (
    <Stack spacing={4} sx={{ overflowY: 'none', height: '100vh'}}>
        <Box sx={{bgcolor: 'white', p: 2}}>
            <Stack direction="row" justifyContent="space-between"
                    alignItems="center" mb={2}>
                <Typography variant='h8' fontWeight='600' color='#525252'>
                    Your Profile
                </Typography>
                <IconButton size='small'>
                    <MoreIcon />
                </IconButton>
            </Stack>

            <Stack  direction='column' spacing={2} alignItems='center'>
                <Avatar sx={{width: 90, height: 90, marginBottom: '20px', border: '5px solid #97A87A'}} 
                        src="https://i.pinimg.com/736x/64/1d/78/641d788c014292f33dddadf001e4f0af.jpg"/>
                
                <Typography variant='h6' fontWeight='600' color='#525252'>
                    Good Morning X
                </Typography>

                <Typography variant='body2' color='#525252' textAlign='center' maxWidth={250}>
                    Continue Your Journey And Achieve Your Target
                </Typography>

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
                    Your Mentor
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

        <Button fullWidth startIcon={<LogoutIcon />}
                sx={{ color: '#e05e60', textTransform: 'none', justifyContent: 'center', fontWeight: 600,
                    '&:hover': {bgcolor: '#fff5f5'}
                 }}>
            Logout
        </Button>
    </Stack>
    
  )
}

export default RightBar
