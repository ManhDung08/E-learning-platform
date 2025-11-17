import React from 'react'
import { Stack, Box, Typography, IconButton } from '@mui/material'
import MoreIcon from '@mui/icons-material/MoreVert';

const RightBar = () => {
  return (
    <Stack spacing={4} sx={{padding: 3, overflowY: 'auto'}}>
        <Box>
            <Stack direction="row" justifyContent="space-between"
                    alignItems="center" mb={3}>
                <Typography variant='h8' fontWeight='600' color='#525252'>
                    Your Profile
                </Typography>
                <IconButton size='small'>
                    <MoreIcon />
                </IconButton>
            </Stack>

            <Stack>
                
            </Stack>
        </Box>
    </Stack>
    
  )
}

export default RightBar
