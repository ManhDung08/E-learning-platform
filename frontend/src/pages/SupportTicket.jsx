import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Snackbar, 
  Alert, 
  Stack,
  Grid,
  Chip,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from '../Redux/api';

const CreateTicketPage = () => {
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const FIXED_HEIGHT = '600px'; 

  // --- MÀU SẮC THƯƠNG HIỆU ---
  const BRAND_COLOR = '#608f4d'; // Màu xanh lá cây giống khóa học
  const BRAND_BG = '#f4f9f2';    // Màu nền xanh rất nhạt
  const TEXT_PRIMARY = '#2c3e50';

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#2196F3';       // Xanh dương (Mới)
      case 'in_progress': return '#FF9800'; // Cam (Đang xử lý)
      case 'resolved': return '#608f4d';    // Xanh lá (Xong - Theo màu brand)
      case 'closed': return '#757575';      // Xám (Đóng)
      default: return '#e0e0e0';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/supportTicket/me', {
        params: { limit: 10, page: 1 }
      });
      setTickets(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setTimeout(() => setLoadingHistory(false), 800);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/supportTicket', formData);
      setNotification({ open: true, message: 'Submitted successfully!', severity: 'success' });
      setFormData({ subject: '', message: '' });
      fetchHistory();
    } catch (error) {
      let errorMsg = error?.message || 'Error submitting request.';
      if (error?.status === 401) errorMsg = 'Session expired.';
      setNotification({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: '#F8F9FA', // Nền xám trung tính, sạch sẽ hơn xanh dương
        py: 4,
        px: 2, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start' 
      }}
    >
      <Container maxWidth="md">
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>

        <Grid container spacing={3} direction="column">
          
          {/* --- KHUNG 1: FORM GỬI YÊU CẦU --- */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                bgcolor: '#fff', 
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid #E0E0E0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              {/* Header: Nền trắng, border dưới nhẹ nhàng */}
              <Box sx={{ p: 3, borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                    p: 1.2, 
                    borderRadius: '50%', // Icon tròn
                    bgcolor: BRAND_BG, 
                    color: BRAND_COLOR, 
                    display: 'flex' 
                }}>
                  <SupportAgentIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="800" color={TEXT_PRIMARY}>
                    Support Center
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We are here to help you
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      label="Subject" 
                      name="subject"
                      value={formData.subject} 
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="e.g. Course access issue..." 
                      variant="outlined" 
                      required
                      fullWidth
                      // Tùy chỉnh màu viền khi focus
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': { borderColor: BRAND_COLOR },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: BRAND_COLOR }
                      }}
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                    <TextField
                      label="Description" 
                      name="message"
                      value={formData.message} 
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Please describe your issue in detail..." 
                      multiline rows={4}
                      variant="outlined" 
                      required
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': { borderColor: BRAND_COLOR },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: BRAND_COLOR }
                      }}
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                    <Button
                      type="submit" 
                      variant="contained" 
                      size="large"
                      disabled={loading} 
                      endIcon={<SendIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        py: 1.5, 
                        fontWeight: 'bold', 
                        boxShadow: 'none', 
                        width: { xs: '100%', sm: 'auto' }, 
                        minWidth: '180px',
                        bgcolor: BRAND_COLOR, // Màu Brand
                        '&:hover': { bgcolor: '#4d753c', boxShadow: '0 4px 12px rgba(96, 143, 77, 0.2)' }
                      }}
                    >
                      {loading ? 'Sending...' : 'Submit Request'}
                    </Button>
                  </Stack>
                </form>
              </Box>
            </Paper>
          </Grid>

          {/* --- KHUNG 2: LỊCH SỬ --- */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                bgcolor: '#fff',
                height: FIXED_HEIGHT, 
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid #E0E0E0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <HistoryIcon sx={{ color: TEXT_PRIMARY }} />
                  <Typography variant="h6" fontWeight="bold" color={TEXT_PRIMARY}>Request History</Typography>
                  <Chip 
                    label={tickets.length} 
                    size="small" 
                    sx={{ 
                        height: 24, 
                        fontWeight: 'bold', 
                        bgcolor: BRAND_BG, 
                        color: BRAND_COLOR 
                    }} 
                  />
                </Box>
                
                <IconButton 
                  onClick={fetchHistory} 
                  disabled={loadingHistory}
                  size="small"
                  sx={{ 
                    bgcolor: 'transparent',
                    animation: loadingHistory ? 'spin 1s linear infinite' : 'none',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: '#f5f5f5', color: BRAND_COLOR }
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box 
                sx={{ 
                  p: 3, flexGrow: 1, overflowY: 'auto', 
                  bgcolor: '#fff',
                  opacity: loadingHistory && tickets.length > 0 ? 0.5 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              >
                {loadingHistory && tickets.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>Loading data...</Box>
                ) : tickets.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 10, opacity: 0.6 }}>
                    <Typography color="text.secondary">No tickets found</Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {tickets.map((ticket) => {
                        const statusColor = getStatusColor(ticket.status);
                        
                        return (
                          <Card 
                            key={ticket.id} 
                            variant="outlined"
                            sx={{ 
                              borderRadius: 3, 
                              border: '1px solid #eaecf0',
                              transition: 'all 0.2s',
                              '&:hover': { 
                                  borderColor: BRAND_COLOR, // Hover ra màu xanh lá
                                  transform: 'translateY(-2px)', 
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                              } 
                            }}
                          >
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                              
                              {/* HEADER: Subject & Status */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="700" sx={{ mr: 1, lineHeight: 1.3, color: '#344767' }}>
                                    {ticket.subject}
                                </Typography>
                                <Chip 
                                    label={getStatusLabel(ticket.status)} 
                                    size="small" 
                                    sx={{ 
                                      fontWeight: 'bold', 
                                      borderRadius: '6px', 
                                      height: 24, 
                                      minWidth: '85px', 
                                      flexShrink: 0,
                                      bgcolor: `${statusColor}15`, // Màu nền nhạt (độ trong suốt 15%)
                                      color: statusColor,           // Màu chữ đậm
                                      border: `1px solid ${statusColor}30`
                                    }}
                                />
                              </Box>

                              {/* BODY: Message */}
                              <Box sx={{ 
                                  bgcolor: '#F9FAFB', 
                                  p: 2, 
                                  borderRadius: 2, 
                                  mb: 2,
                                  // border: '1px dashed #E0E0E0' // Viền nét đứt cho nhẹ nhàng
                              }}>
                                <Typography variant="body2" color="text.secondary" sx={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    fontStyle: 'italic',
                                    lineHeight: 1.6
                                }}>
                                    "{ticket.message}"
                                </Typography>
                              </Box>

                              {/* FOOTER: ID & Time */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        fontWeight: '600', 
                                        color: '#90a4ae',
                                        bgcolor: '#eceff1',
                                        px: 1, py: 0.5,
                                        borderRadius: 1
                                    }}
                                  >
                                    #{ticket.id}
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#90a4ae' }}>
                                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="caption" fontWeight="500">
                                      {new Date(ticket.createdAt).toLocaleString('en-US', { 
                                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                      })}
                                    </Typography>
                                  </Box>
                              </Box>

                            </CardContent>
                          </Card>
                        );
                    })}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar 
        open={notification.open} autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateTicketPage;