import React from 'react'
import Card from '@mui/material/Card';
import HelpIcon from '@mui/icons-material/HelpOutline';
import { Avatar, Button, Box, Typography } from '@mui/material';

const HelpCenterCard = () => {
    const handleGoToHelpCenter = () => {
        console.log('help center zone');
    }
  return (
    <Card elevation={0} className='relative m-2 mx-4 rounded-2xl text-center' sx={{ backgroundColor: '#2D3748', color: 'white', overflow: 'visible'}}>
            <Avatar sx={{bgcolor: '#2D3748', color: 'white', width: 60, height: 60, border: '2px solid white', position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)'}}>
                <HelpIcon sx={{ height: 60, width: 60 }} />
            </Avatar>
            
            <Box className='pt-12 pb-6 px-4 flex flex-col items-center'>
                <Typography variant='h6' component="div" sx={{ fontWeight: 'bold' }}>
                    Help Center
                </Typography>
                <Typography variant='body2' sx={{mt: 1, mb: 2, color: 'gray.300', maxWidth: '90%'}}>
                    Having Trouble in Learning. Please contact us for more questions.
                </Typography>

                <Button variant='contained' sx={{ backgroundColor: 'white', color: 'black', borderRadius: '20px', textTransform: 'none', fontWeight: 'bold'}}>
                    Go To Help Center
                </Button>
            </Box>

    </Card>
  )
}

export default HelpCenterCard
