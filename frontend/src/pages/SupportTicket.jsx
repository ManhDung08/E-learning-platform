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
  useTheme,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const API_BASE = 'http://localhost:3000/api'; 
  const FIXED_HEIGHT = '600px';

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
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
      const response = await fetch(`${API_BASE}/supportTicket/me?limit=10&page=1`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data.data?.items || []);
      }
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
      const response = await fetch(`${API_BASE}/supportTicket`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setNotification({ open: true, message: 'Submitted successfully!', severity: 'success' });
        setFormData({ subject: '', message: '' });
        fetchHistory();
      } else {
        let errorMsg = data.message || 'Error submitting request.';
        if (response.status === 401) errorMsg = 'Session expired.';
        setNotification({ open: true, message: errorMsg, severity: 'error' });
      }
    } catch (error) {
      setNotification({ open: true, message: 'Connection error.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f5f7fa', 
        py: 5,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start' 
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/')} 
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
          >
            Back to Home
          </Button>
        </Box>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, borderRadius: 3, bgcolor: '#fff', 
                height: FIXED_HEIGHT,
                display: 'flex', flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: '12px', color: '#fff' }}>
                  <SupportAgentIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Support Request</Typography>
                  <Typography variant="caption" color="text.secondary">We will respond as soon as possible</Typography>
                </Box>
              </Box>

              <form onSubmit={handleSubmit} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                  <TextField
                    label="Subject" name="subject"
                    value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Ex: Payment issue..." variant="outlined" required
                    size="small" InputProps={{ sx: { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Description" name="message"
                    value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Detailed description..." multiline rows={10}
                    variant="outlined" required
                    InputProps={{ sx: { borderRadius: 2 } }}
                    sx={{ flexGrow: 1, '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' } }} 
                  />
                  <Button
                    type="submit" variant="contained" size="large"
                    disabled={loading} endIcon={<SendIcon />}
                    sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold', mt: 'auto' }}
                  >
                    {loading ? 'Sending...' : 'Submit Request'}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 3, bgcolor: '#fff',
                height: FIXED_HEIGHT,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fafafa' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <HistoryIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="bold">Request History</Typography>
                  <Chip label={tickets.length} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }} />
                </Box>
                
                <IconButton 
                  onClick={fetchHistory} 
                  disabled={loadingHistory}
                  size="small"
                  sx={{ 
                    border: '1px solid #eee',
                    animation: loadingHistory ? 'spin 1s linear infinite' : 'none',
                    color: loadingHistory ? 'primary.main' : 'action.active'
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box 
                sx={{ 
                  p: 2, px: 3, flexGrow: 1, overflowY: 'auto', 
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
                    {tickets.map((ticket) => (
                      <Card 
                        key={ticket.id} variant="outlined"
                        sx={{ 
                          borderRadius: 3, border: '1px solid #eaecf0',
                          '&:hover': { borderColor: 'primary.light', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } 
                        }}
                      >
                        <CardContent sx={{ p: '16px !important' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">{ticket.subject}</Typography>
                            <Chip 
                              label={getStatusLabel(ticket.status)} 
                              color={getStatusColor(ticket.status)}
                              size="small" 
                              variant={ticket.status === 'open' ? 'filled' : 'outlined'}
                              sx={{ fontWeight: 600, borderRadius: '6px', height: 24 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, bgcolor: '#f9fafb', p: 1.5, borderRadius: 2, fontStyle: 'italic' }}>
                            "{ticket.message.length > 80 ? ticket.message.substring(0, 80) + '...' : ticket.message}"
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'text.secondary' }}>
                            <Typography variant="caption" sx={{ bgcolor: '#eee', px: 1, borderRadius: 1 }}>ID: #{ticket.id}</Typography>
                            {/* Changed to en-US for English date format */}
                            <Typography variant="caption">{new Date(ticket.createdAt).toLocaleString('en-US')}</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
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