import React from 'react'
import Bell from '@mui/icons-material/NotificationsNone';
import MoreIcon from '@mui/icons-material/MoreVert';
import { IconButton } from '@mui/material'


const WatchingCard = ({ progress, total, title }) => {

    const progressPercentage = (progress / total) * 100;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', minWidth: '280px', maxHeight: '80px', display: 'flex', alignItems: 'center',
                gap: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
     }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#E8F0FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
         }}>
            <Bell size={24} color='#5B8DEF'/>
        </div>

        <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px 0' }}>
                {progress}/{total} Watched
            </p>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#333' }}>
                {title}
            </p>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#E0E0E0',
                        borderRadius: '10px', marginTop: '8px', overflow: 'hidden'
             }}>
                <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#5B8DEF', borderRadius: '10px' }} />
            </div>
        </div>
        
        <IconButton size='small' sx={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#999' }}>
            <MoreIcon />
        </IconButton>
    </div>
  )
}

export default WatchingCard
