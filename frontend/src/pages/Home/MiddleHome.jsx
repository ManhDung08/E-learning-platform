import React from 'react'
import SearchInput from '../../components/search/searchInput'
import { Card, Button } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const MiddleHome = () => {
  return (
    <div className='flex flex-col'>
      <div>
        <SearchInput />
      </div>
      <div className='p-4 pt-2'>
        <Card sx={{borderRadius: '15px', padding: '25px', background: 'linear-gradient(135deg, #4c6b58 0%, #97A87A 50%, #DADECD 100%)',
                  color: 'white', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{position: 'relative'}}>
            <p style={{fontSize: '14px', fontWeight: '600', letterSpacing: '1px', marginBottom: '12px', opacity: 0.9}}>
              ONLINE COURSE
            </p>

            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.2', maxWidth: '500px' }}>
              Sharpen Your Skills With Professional Online Courses
            </h2>

            <Button variant='contained' endIcon={<ArrowForwardIcon />}
                    sx={{backgroundColor: '#2b3b31', color: 'white', padding: '12px 28px', 
                        borderRadius: '50px', textTransform: 'none', fontSize: '12px',
                        fontWeight: '600', transition: 'all 0.3s ease', '&:hover': {transform: 'translateY(-2px)',
                        backgroundColor: '#16241b'}}}>
              Join now
            </Button>
          </div>
        </Card>
      </div>

      <div className='p-4 pt-2 flex'>
        
      </div>
    </div>
  )
}

export default MiddleHome
