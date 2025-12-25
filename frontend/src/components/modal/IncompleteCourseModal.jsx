import React from 'react';
import { Dialog, DialogContent, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import QuizIcon from '@mui/icons-material/Quiz';

const IncompleteCourseModal = ({ open, onClose, incompleteLessons, incompleteQuizzes }) => {
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
          {/* Warning Icon */}
          <div className="flex justify-center items-center mb-6">
            <WarningAmberIcon sx={{ fontSize: 80, color: '#f59e0b' }} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Course Not Complete Yet
          </h2>
          
          <p className="text-base text-gray-700 mb-6">
            Please complete all lessons and quizzes before finishing the course.
          </p>

          {/* Incomplete Items */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            {incompleteLessons > 0 && (
              <div className="flex items-start gap-3 mb-3">
                <CheckBoxOutlineBlankIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                <div>
                  <p className="font-medium text-gray-800">
                    Incomplete Lessons: {incompleteLessons}
                  </p>
                  <p className="text-sm text-gray-600">
                    Watch all videos to completion
                  </p>
                </div>
              </div>
            )}
            
            {incompleteQuizzes > 0 && (
              <div className="flex items-start gap-3">
                <QuizIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                <div>
                  <p className="font-medium text-gray-800">
                    Incomplete Quizzes: {incompleteQuizzes}
                  </p>
                  <p className="text-sm text-gray-600">
                    Complete all lesson quizzes
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            variant="contained"
            onClick={onClose}
            fullWidth
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              py: 1.5,
              bgcolor: '#f59e0b',
              fontSize: '16px',
              '&:hover': {
                bgcolor: '#d97706'
              }
            }}
          >
            Continue Learning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncompleteCourseModal;
