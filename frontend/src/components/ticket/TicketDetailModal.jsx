import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Typography, Box, Divider, MenuItem, Select, FormControl, InputLabel,
    Avatar, Stack, CircularProgress
} from '@mui/material';
import { getTicketByIdAction, updateTicketStatusAction } from '../../Redux/SupportTicket/supportTicket.action';
import { getUserByIdAction } from '../../Redux/Admin/admin.action';

const TicketDetailModal = ({ open, handleClose, ticketId }) => {
    const dispatch = useDispatch();
    
    const { ticketDetail, loading: ticketLoading } = useSelector(store => store.supportTicket);
    const { user, loading: userLoading } = useSelector(store => store.admin);    
    
    const customThemeColor = '#97A87A';

    useEffect(() => {
        if (open && ticketId) {
            dispatch(getTicketByIdAction(ticketId));
        }
    }, [dispatch, open, ticketId]);


    useEffect(() => {
        if (ticketDetail?.userId) {
            dispatch(getUserByIdAction(ticketDetail.userId));
        }
    }, [dispatch, ticketDetail?.userId]);

    const handleChangeStatus = (e) => {
        dispatch(updateTicketStatusAction(ticketId, e.target.value));
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', bgcolor: '#f8f9fa' }}>
                Ticket Detail #{ticketId}
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2 }}>
                {ticketLoading ? (
                    <Box display="flex" justifyContent="center" p={3}><CircularProgress sx={{ color: customThemeColor }} /></Box>
                ) : (
                    <>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold">SENDER</Typography>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                <Avatar 
                                    src={user?.data?.profileImageUrl || user?.profileImageUrl} 
                                    sx={{ width: 40, height: 40, bgcolor: customThemeColor }}
                                >
                                    {(user?.data?.username || user?.username)?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        {userLoading ? "Loading..." : (user?.data?.username || user?.username || `User #${ticketDetail?.userId}`)}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {user?.data?.email || user?.email}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold">SUBJECT</Typography>
                            <Typography variant="h6" sx={{ color: '#2c3e50', fontSize: '1.1rem', mt: 0.5 }}>
                                {ticketDetail?.subject}
                            </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold">DESCRIPTION</Typography>
                            <Typography variant="body2" sx={{ 
                                mt: 1, p: 2, 
                                backgroundColor: '#f9f9f9', 
                                borderRadius: '8px', 
                                border: '1px solid #f0f0f0',
                                whiteSpace: 'pre-wrap',
                                minHeight: '100px',
                                // Thêm style nếu không có nội dung
                                color: ticketDetail?.message ? 'text.primary' : 'text.disabled',
                                fontStyle: ticketDetail?.message ? 'normal' : 'italic'
                            }}>
                                {ticketDetail?.message || "The user did not provide any details."}
                            </Typography>
                        </Box>

                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ '&.Mui-focused': { color: customThemeColor } }}>Update Status</InputLabel>
                            <Select
                                value={ticketDetail?.status || ''}
                                label="Update status"
                                onChange={handleChangeStatus}
                                sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: customThemeColor } }}
                            >
                                <MenuItem value="open">Open</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="resolved">Resolved</MenuItem>
                                <MenuItem value="closed">Closed</MenuItem>
                            </Select>
                        </FormControl>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee', bgcolor: '#f8f9fa' }}>
                <Button 
                    onClick={handleClose} 
                    variant="contained" 
                    sx={{ 
                        backgroundColor: customThemeColor, 
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#7a8a61' } 
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TicketDetailModal;