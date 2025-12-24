import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Typography, Box, Divider, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import { getTicketByIdAction, updateTicketStatusAction } from '../../Redux/SupportTicket/supportTicket.action';

const TicketDetailModal = ({ open, handleClose, ticketId }) => {
    const dispatch = useDispatch();
    const { ticketDetail, loading } = useSelector(store => store.supportTicket);

    useEffect(() => {
        if (ticketId) {
            dispatch(getTicketByIdAction(ticketId));
        }
    }, [dispatch, ticketId]);

    const handleChangeStatus = (e) => {
        dispatch(updateTicketStatusAction(ticketId, e.target.value));
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                Chi tiết Ticket #{ticketDetail?.id}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">Chủ đề</Typography>
                    <Typography variant="h6" sx={{ color: '#2c3e50' }}>{ticketDetail?.subject}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="textSecondary">Nội dung yêu cầu</Typography>
                    <Typography variant="body1" sx={{ mt: 1, p: 2, backgroundColor: '#fdfdfd', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                        {ticketDetail?.message}
                    </Typography>
                </Box>

                <FormControl fullWidth size="small">
                    <InputLabel>Cập nhật trạng thái</InputLabel>
                    <Select
                        value={ticketDetail?.status || ''}
                        label="Cập nhật trạng thái"
                        onChange={handleChangeStatus}
                    >
                        <MenuItem value="open">Open (Chờ xử lý)</MenuItem>
                        <MenuItem value="in_progress">In Progress (Đang giải quyết)</MenuItem>
                        <MenuItem value="resolved">Resolved (Đã xong)</MenuItem>
                        <MenuItem value="closed">Closed (Đóng)</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                <Button onClick={handleClose} variant="contained" sx={{ backgroundColor: '#97A87A', '&:hover': { backgroundColor: '#7a8a61' } }}>
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TicketDetailModal;