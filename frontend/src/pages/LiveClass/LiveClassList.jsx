import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  VideoCall,
  PersonAdd,
  People,
  AccessTime,
  Person
} from '@mui/icons-material';

// Fake data - Active rooms list
const fakeRooms = [
  {
    id: 'room-1',
    title: 'Advanced Mathematics Class',
    instructor: 'Nguyen Van A',
    instructorAvatar: 'https://i.pravatar.cc/150?img=1',
    participants: 12,
    maxParticipants: 30,
    startTime: '14:00',
    status: 'live', // live, scheduled, ended
    description: 'Lesson on derivatives and integrals'
  },
  {
    id: 'room-2',
    title: 'Web Programming Class',
    instructor: 'Tran Thi B',
    instructorAvatar: 'https://i.pravatar.cc/150?img=2',
    participants: 8,
    maxParticipants: 25,
    startTime: '15:30',
    status: 'live',
    description: 'Basic React and Node.js'
  },
  {
    id: 'room-3',
    title: 'Communication English Class',
    instructor: 'Le Van C',
    instructorAvatar: 'https://i.pravatar.cc/150?img=3',
    participants: 20,
    maxParticipants: 30,
    startTime: '16:00',
    status: 'scheduled',
    description: 'Pronunciation and grammar practice'
  },
  {
    id: 'room-4',
    title: 'General Physics Class',
    instructor: 'Pham Thi D',
    instructorAvatar: 'https://i.pravatar.cc/150?img=4',
    participants: 15,
    maxParticipants: 25,
    startTime: '17:00',
    status: 'scheduled',
    description: 'Mechanics and Thermodynamics'
  }
];

const LiveClassList = () => {
  const navigate = useNavigate();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [newRoom, setNewRoom] = useState({
    title: '',
    description: '',
    maxParticipants: 30,
    startTime: ''
  });

  const handleCreateRoom = () => {
    if (!newRoom.title.trim()) {
      alert('Please enter room name');
      return;
    }

    // Generate fake room ID
    const roomId = `room-${Date.now()}`;
    
    // Navigate to room page with fake data
    navigate(`/live-class/room/${roomId}`, {
      state: {
        room: {
          id: roomId,
          title: newRoom.title,
          description: newRoom.description,
          instructor: 'You',
          instructorAvatar: 'https://i.pravatar.cc/150?img=5',
          participants: 1,
          maxParticipants: newRoom.maxParticipants,
          startTime: newRoom.startTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: 'live',
          isHost: true
        }
      }
    });
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      alert('Please enter room code');
      return;
    }

    // Find room by code or create fake room
    const room = fakeRooms.find(r => r.id === roomCode) || {
      id: roomCode,
      title: `Room ${roomCode}`,
      instructor: 'Instructor',
      instructorAvatar: 'https://i.pravatar.cc/150?img=6',
      participants: 5,
      maxParticipants: 30,
      startTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'live',
      isHost: false
    };

    navigate(`/live-class/room/${roomCode}`, {
      state: { room }
    });
  };

  const handleJoinExistingRoom = (roomId) => {
    const room = fakeRooms.find(r => r.id === roomId);
    if (room) {
      navigate(`/live-class/room/${roomId}`, {
        state: { room: { ...room, isHost: false } }
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'error'; // red
      case 'scheduled':
        return 'info'; // blue
      case 'ended':
        return 'default'; // gray
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live':
        return 'Live Now';
      case 'scheduled':
        return 'Scheduled';
      case 'ended':
        return 'Ended';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ bgcolor: '#F4F6F8', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoCall color="primary" />
            Live Classes
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PersonAdd />}
              onClick={() => setOpenJoinDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              Join Room
            </Button>
            <Button
              variant="contained"
              startIcon={<VideoCall />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{ borderRadius: 2, bgcolor: '#a435f0', '&:hover': { bgcolor: '#8b2dd9' } }}
            >
              Create New Room
            </Button>
          </Box>
        </Box>

        {/* Rooms List */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Active Rooms
        </Typography>
        <Grid container spacing={3}>
          {fakeRooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  cursor: room.status === 'live' ? 'pointer' : 'default'
                }}
                onClick={() => room.status === 'live' && handleJoinExistingRoom(room.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                      {room.title}
                    </Typography>
                    <Chip
                      label={getStatusText(room.status)}
                      color={getStatusColor(room.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar src={room.instructorAvatar} sx={{ width: 32, height: 32 }} />
                    <Typography variant="body2" color="text.secondary">
                      {room.instructor}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {room.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {room.participants}/{room.maxParticipants}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {room.startTime}
                      </Typography>
                    </Box>
                  </Box>

                  {room.status === 'live' && (
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 2, bgcolor: '#a435f0', '&:hover': { bgcolor: '#8b2dd9' } }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinExistingRoom(room.id);
                      }}
                    >
                      Join Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Create Room Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoCall color="primary" />
            Create New Classroom
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Classroom Name"
                fullWidth
                value={newRoom.title}
                onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                placeholder="Ex: Advanced Math Class"
                required
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                placeholder="Description of the session..."
              />
              <FormControl fullWidth>
                <InputLabel>Max Participants</InputLabel>
                <Select
                  value={newRoom.maxParticipants}
                  label="Max Participants"
                  onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: e.target.value })}
                >
                  <MenuItem value={10}>10 people</MenuItem>
                  <MenuItem value={20}>20 people</MenuItem>
                  <MenuItem value={30}>30 people</MenuItem>
                  <MenuItem value={50}>50 people</MenuItem>
                  <MenuItem value={100}>100 people</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={newRoom.startTime}
                onChange={(e) => setNewRoom({ ...newRoom, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateRoom}
              sx={{ bgcolor: '#a435f0', '&:hover': { bgcolor: '#8b2dd9' } }}
            >
              Create Room
            </Button>
          </DialogActions>
        </Dialog>

        {/* Join Room Dialog */}
        <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd color="primary" />
            Join Classroom
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                label="Classroom Code"
                fullWidth
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter classroom code"
                sx={{ mb: 2 }}
                helperText="Enter the room code received from the instructor"
              />
              <Typography variant="body2" color="text.secondary">
                Or select an active room above to join directly.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleJoinRoom}
              sx={{ bgcolor: '#a435f0', '&:hover': { bgcolor: '#8b2dd9' } }}
            >
              Join
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default LiveClassList;