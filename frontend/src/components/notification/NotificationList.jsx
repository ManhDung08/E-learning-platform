import React from 'react'
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Button, ListItemButton } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';


const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString('en-GB');
};

const NotificationList = ({ notifications, onMarkRead, onMarkAllRead }) => {
  
    if (!notifications || notifications.length === 0) {
        return (
            <Box p={4} textAlign="center" display="flex" flexDirection="column" alignItems="center">
                <CircleNotificationsIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }}/>
                <Typography variant='body2' component="div" color='text.secondary'>
                    No notifications yet.
                </Typography>
            </Box>
        )
    };
  
  return (
    <Box sx={{ width: 340, maxHeight: 450, overflowY: 'auto' }}>
        <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #f0f0f0" bgcolor="white" position="sticky" top={0} zIndex={1}>
            <Typography variant="subtitle2" fontWeight="bold" px={1}>
                Notifications
            </Typography>

            <Button size='small' onClick={onMarkAllRead} sx={{ fontSize: 11, textTransform: 'none', color: '#97A87A' }}>
                Mark all read
            </Button>
        </Box>

        <List disablePadding>
            {notifications.map((notif) => (
                <React.Fragment key={notif.id}>
                    <ListItem disablePadding>
                            <ListItemButton 
                                alignItems="flex-start"
                                onClick={() => !notif.isRead && onMarkRead(notif.id)}
                                sx={{ 
                                    bgcolor: notif.isRead ? 'white' : '#f4f9f4', 
                                    transition: '0.2s',
                                    '&:hover': { bgcolor: '#fafafa' },
                                    pr: 1
                                }}
                            >
                                <ListItemAvatar sx={{ mt: 0.5 }}>
                                    <Avatar sx={{ 
                                        bgcolor: notif.type === 'system' ? '#e8f5e9' : '#e3f2fd', 
                                        color: notif.type === 'system' ? '#2e7d32' : '#1565c0',
                                        width: 36, height: 36 
                                    }}>
                                        {notif.type === 'system' ? <InfoIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                    </Avatar>
                                </ListItemAvatar>
                                
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', fontWeight: notif.isRead ? 400 : 700, lineHeight: 1.2, mb: 0.5 }}>
                                            {notif.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <React.Fragment>
                                            <Typography variant="body2" component="span" sx={{ display: 'block', fontSize: '0.75rem', color: '#555', mb: 0.5, lineHeight: 1.3 }}>
                                                {notif.content}
                                            </Typography>
                                            <Typography variant="caption" component="span" sx={{ fontSize: '0.7rem', color: '#999' }}>
                                                {formatTimeAgo(notif.createdAt)}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                />
                                {!notif.isRead && (
                                    <Box sx={{ width: 8, height: 8, bgcolor: '#97A87A', borderRadius: '50%', ml: 1, mt: 2, flexShrink: 0 }} />
                                )}
                            </ListItemButton>
                        </ListItem>

                    <Divider component="li" />

                </React.Fragment>
            ))}
        </List>
    </Box>
  )
}

export default NotificationList
