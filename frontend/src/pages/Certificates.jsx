import React, { useEffect, useState } from 'react';
import api from '../Redux/api';
import { Card, CardContent, Typography, CircularProgress, Box, Button, Container, Paper } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/certificate/me');
      if (response.data && response.data.success) {
        const certs = response.data.data || [];
        console.log('Fetched certificates:', certs);
        // Map 'url' to 'certificateUrl' for consistency
        const mappedCerts = certs.map(cert => ({
          ...cert,
          certificateUrl: cert.url || cert.certificateUrl
        }));
        // Log certificate URLs for debugging
        mappedCerts.forEach(cert => {
          console.log('Certificate URL:', cert.certificateUrl);
        });
        setCertificates(mappedCerts);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (certificateUrl) => {
    try {
      console.log('Viewing certificate at:', certificateUrl);
      
      if (!certificateUrl) {
        alert('Certificate URL is not available');
        return;
      }

      // Open in new tab
      const newWindow = window.open(certificateUrl, '_blank');
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Popup blocked! Please allow popups for this site to view certificates.');
      }
    } catch (error) {
      console.error('Error viewing certificate:', error);
      alert('Failed to open certificate. Please check your browser settings.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={50} sx={{ color: '#f59e0b' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 5 }}>
        <Container maxWidth="xl">
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 5 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 4, 
            background: 'linear-gradient(120deg, #ffffff 0%, #fef3c7 100%)',
            border: '1px solid #eef2f6',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: '#f59e0b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 36, color: 'white' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                My Certificates
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                View and download your course completion certificates
              </Typography>
            </Box>
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                bgcolor: '#fef3c7',
                borderRadius: 2,
                border: '1px solid #fde68a'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {certificates.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#92400e' }}>
                Certificate{certificates.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: 4,
              border: '2px dashed #e5e7eb'
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              No Certificates Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete courses to earn certificates and showcase your achievements
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {certificates.map((cert) => (
              <Card 
                key={cert.id} 
                elevation={0}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    borderColor: '#f59e0b'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                    <Box 
                      sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '12px', 
                        bgcolor: '#fef3c7', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <EmojiEventsIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#1f2937',
                          fontSize: '1.1rem',
                          lineHeight: 1.3,
                          mb: 0.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {cert.course?.title || 'Course Certificate'}
                      </Typography>
                    </Box>
                  </Box>

                  {cert.course?.instructor && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#6b7280', 
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      <strong>Instructor:</strong> {cert.course.instructor.fullname || 'N/A'}
                    </Typography>
                  )}

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6b7280', 
                      mb: 3,
                      fontSize: '0.875rem'
                    }}
                  >
                    <strong>Issued:</strong> {new Date(cert.issuedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>

                  <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5 }}>
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleView(cert.certificateUrl)}
                      fullWidth
                      sx={{
                        bgcolor: '#f59e0b',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#d97706',
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                        }
                      }}
                    >
                      View Certificate
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Certificates;
