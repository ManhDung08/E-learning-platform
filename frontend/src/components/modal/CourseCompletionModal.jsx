import React from 'react';
import { Dialog, DialogContent, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CelebrationIcon from '@mui/icons-material/Celebration';

const CourseCompletionModal = ({ open, onClose, courseName, isGeneratingCertificate }) => {
  const navigate = useNavigate();

  const handleViewCertificate = () => {
    onClose();
    navigate('/certificates');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '16px'
        }
      }}
    >
      <DialogContent>
        <div className="text-center py-6">
          {/* Celebration Icons */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <CelebrationIcon sx={{ fontSize: 60, color: '#f59e0b' }} />
            <EmojiEventsIcon sx={{ fontSize: 80, color: '#f59e0b' }} />
            <CelebrationIcon sx={{ fontSize: 60, color: '#f59e0b' }} />
          </div>

          {/* Congratulations Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Congratulations! 🎉
          </h2>
          
          <p className="text-lg text-gray-700 mb-4">
            You have successfully completed
          </p>
          
          <p className="text-xl font-semibold text-blue-600 mb-6">
            {courseName}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-gray-800 font-medium mb-2">
              📜 Certificate Earned!
            </p>
            <p className="text-sm text-gray-600">
              {isGeneratingCertificate ? (
                <span className="flex items-center gap-2 justify-center">
                  <CircularProgress size={16} sx={{ color: '#f59e0b' }} />
                  Generating your certificate...
                </span>
              ) : (
                "You have received a certificate of completion for this course. View and download it from your certificates page."
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isGeneratingCertificate}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleViewCertificate}
              startIcon={isGeneratingCertificate ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <EmojiEventsIcon />}
              disabled={isGeneratingCertificate}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1,
                bgcolor: '#f59e0b',
                '&:hover': {
                  bgcolor: '#d97706'
                },
                '&:disabled': {
                  bgcolor: '#fcd34d'
                }
              }}
            >
              {isGeneratingCertificate ? 'Generating...' : 'View My Certificate'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseCompletionModal;
