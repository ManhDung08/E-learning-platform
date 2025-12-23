import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Avatar,
  Paper,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
  Chat,
  People,
  MoreVert,
  Send,
  ScreenShare,
  Settings
} from '@mui/icons-material';

// Fake video URLs - các video mẫu để hiển thị
const videoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4'
];

// Get random video URL based on participant ID (consistent for same participant)
const getRandomVideoUrl = (participantId) => {
  // Use participant ID to get consistent video for same participant
  const hash = participantId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return videoUrls[hash % videoUrls.length];
};

// Fake data - danh sách người tham gia
const generateFakeParticipants = (roomId, isHost) => {
  const baseParticipants = [
    {
      id: 'user-1',
      name: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?img=1',
      isMuted: false,
      isVideoOff: false,
      role: isHost ? 'host' : 'participant'
    },
    {
      id: 'user-2',
      name: 'Trần Thị B',
      avatar: 'https://i.pravatar.cc/150?img=2',
      isMuted: true,
      isVideoOff: false,
      role: 'participant'
    },
    {
      id: 'user-3',
      name: 'Lê Văn C',
      avatar: 'https://i.pravatar.cc/150?img=3',
      isMuted: false,
      isVideoOff: true,
      role: 'participant'
    },
    {
      id: 'user-4',
      name: 'Phạm Thị D',
      avatar: 'https://i.pravatar.cc/150?img=4',
      isMuted: false,
      isVideoOff: false,
      role: 'participant'
    },
    {
      id: 'user-5',
      name: 'Hoàng Văn E',
      avatar: 'https://i.pravatar.cc/150?img=5',
      isMuted: true,
      isVideoOff: true,
      role: 'participant'
    }
  ];

  // Add current user
  if (!isHost) {
    baseParticipants.unshift({
      id: 'current-user',
      name: 'Bạn',
      avatar: 'https://i.pravatar.cc/150?img=6',
      isMuted: false,
      isVideoOff: false,
      role: 'participant'
    });
  }

  return baseParticipants;
};

const LiveClassRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const room = location.state?.room || {
    id: roomId,
    title: `Phòng ${roomId}`,
    instructor: 'Giảng viên',
    participants: 5,
    isHost: false
  };

  const [participants, setParticipants] = useState(generateFakeParticipants(roomId, room.isHost));
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: 'Nguyễn Văn A',
      message: 'Xin chào mọi người!',
      time: '14:05'
    },
    {
      id: 2,
      user: 'Trần Thị B',
      message: 'Chào bạn!',
      time: '14:06'
    }
  ]);

  useEffect(() => {
    // Simulate new participant joining
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newParticipant = {
          id: `user-${Date.now()}`,
          name: `Người dùng ${Math.floor(Math.random() * 100)}`,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          isMuted: Math.random() > 0.5,
          isVideoOff: Math.random() > 0.5,
          role: 'participant'
        };
        setParticipants(prev => [...prev, newParticipant]);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLeaveRoom = () => {
    if (window.confirm('Bạn có chắc chắn muốn rời khỏi phòng học?')) {
      navigate('/live-class');
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        user: 'Bạn',
        message: chatMessage,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Update current user in participants list
    setParticipants(prev =>
      prev.map(p =>
        p.id === 'current-user' ? { ...p, isMuted: !isMuted } : p
      )
    );
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // Update current user in participants list
    setParticipants(prev =>
      prev.map(p =>
        p.id === 'current-user' ? { ...p, isVideoOff: !isVideoOff } : p
      )
    );
  };

  return (
    <Box sx={{ bgcolor: '#1a1a1a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        sx={{
          bgcolor: '#2d2d2d',
          color: 'white',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => navigate('/live-class')}
            sx={{ color: 'white', minWidth: 'auto', px: 1 }}
          >
            ← Quay lại
          </Button>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#444', mx: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            {room.title}
          </Typography>
          <Chip
            label="Đang phát trực tiếp"
            color="error"
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People sx={{ mr: 1 }} />
          <Typography variant="body2">
            {participants.length} người tham gia
          </Typography>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video Area - Left Side */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#000', position: 'relative' }}>
          {/* Main Video - Single Video Display */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              position: 'relative'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                position: 'relative',
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                component="video"
                autoPlay
                muted
                loop
                playsInline
                controls
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  bgcolor: '#000'
                }}
                src={getRandomVideoUrl('live-stream')}
              />
              {/* Video Info Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center'
                }}
              >
                <Chip
                  label="Đang phát trực tiếp"
                  color="error"
                  size="small"
                  sx={{ bgcolor: '#d32f2f' }}
                />
                <Chip
                  label="Host"
                  color="primary"
                  size="small"
                  sx={{ bgcolor: '#a435f0' }}
                />
              </Box>
            </Box>
          </Box>

          {/* Controls */}
          <Box
            sx={{
              bgcolor: '#2d2d2d',
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2
            }}
          >
            <IconButton
              onClick={toggleMute}
              sx={{
                bgcolor: isMuted ? '#d32f2f' : '#444',
                color: 'white',
                '&:hover': { bgcolor: isMuted ? '#b71c1c' : '#555' }
              }}
            >
              {isMuted ? <MicOff /> : <Mic />}
            </IconButton>
            <IconButton
              onClick={toggleVideo}
              sx={{
                bgcolor: isVideoOff ? '#d32f2f' : '#444',
                color: 'white',
                '&:hover': { bgcolor: isVideoOff ? '#b71c1c' : '#555' }
              }}
            >
              {isVideoOff ? <VideocamOff /> : <Videocam />}
            </IconButton>
            <IconButton
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              sx={{
                bgcolor: isScreenSharing ? '#a435f0' : '#444',
                color: 'white',
                '&:hover': { bgcolor: isScreenSharing ? '#8b2dd9' : '#555' }
              }}
            >
              <ScreenShare />
            </IconButton>
            <IconButton
              sx={{
                bgcolor: '#444',
                color: 'white',
                '&:hover': { bgcolor: '#555' }
              }}
            >
              <Settings />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<CallEnd />}
              onClick={handleLeaveRoom}
              sx={{
                bgcolor: '#d32f2f',
                color: 'white',
                ml: 2,
                '&:hover': { bgcolor: '#b71c1c' }
              }}
            >
              Rời phòng
            </Button>
          </Box>
        </Box>

        {/* Sidebar - Right Side */}
        <Box sx={{ width: 350, display: 'flex', flexDirection: 'column', bgcolor: '#2d2d2d', borderLeft: '1px solid #444' }}>
          {/* Participants List */}
          <Box sx={{ p: 2, borderBottom: '1px solid #444' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <People />
              Người tham gia ({participants.length})
            </Typography>
            <List sx={{ maxHeight: 200, overflow: 'auto' }}>
              {participants.map((participant, index) => (
                <React.Fragment key={participant.id}>
                  <ListItem
                    sx={{
                      py: 1,
                      '&:hover': { bgcolor: '#3d3d3d' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={participant.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {participant.name}
                          </Typography>
                          {participant.role === 'host' && (
                            <Chip label="Host" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          {participant.isMuted && (
                            <Chip icon={<MicOff />} label="Tắt tiếng" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                          {participant.isVideoOff && (
                            <Chip icon={<VideocamOff />} label="Tắt video" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      }
                    />
                    <IconButton size="small" sx={{ color: 'white' }}>
                      <MoreVert />
                    </IconButton>
                  </ListItem>
                  {index < participants.length - 1 && <Divider sx={{ bgcolor: '#444' }} />}
                </React.Fragment>
              ))}
            </List>
          </Box>

          {/* Chat */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chat />
              Chat
            </Typography>
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                mb: 2,
                bgcolor: '#1a1a1a',
                borderRadius: 1,
                p: 1
              }}
            >
              {chatMessages.map((msg) => (
                <Box key={msg.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#a435f0', fontWeight: 'bold' }}>
                      {msg.user}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      {msg.time}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {msg.message}
                  </Typography>
                </Box>
              ))}
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập tin nhắn..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              sx={{
                bgcolor: '#1a1a1a',
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#444'
                  },
                  '&:hover fieldset': {
                    borderColor: '#666'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#a435f0'
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      sx={{ color: '#a435f0' }}
                      disabled={!chatMessage.trim()}
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LiveClassRoom;

