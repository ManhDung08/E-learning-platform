import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppHeader from './components/AppHeader'
import VerifyEmailModal from './components/auth/VerifyEmailModal'
import AppRoutes from './routes/AppRoutes'

function App() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyToken, setVerifyToken] = useState(null);

  useEffect(() => {
    if (window.location.pathname === '/verify-email') {
      const token = searchParams.get('token');
      if(token) {
        setVerifyToken(token);
        setVerifyModalOpen(true);
      }
    }
  }, [searchParams]);

  const handleVerifySuccess = () => {
    setVerifyModalOpen(false);
    navigate('/');
  };

  const handleVerifyClose = () => {
    setVerifyModalOpen(false);
    navigate('/');
  };

  return (
    <div>
      <AppHeader />
      <AppRoutes />

      <VerifyEmailModal 
        open={verifyModalOpen}
        token={verifyToken}
        onClose={handleVerifyClose}
        onSuccess={handleVerifySuccess}
      />
    </div>
  )
}

export default App
