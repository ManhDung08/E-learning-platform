import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HomePage from './pages/HomePage'
import { Route, Routes, useNavigate } from 'react-router-dom';
import AppHeader from './components/AppHeader'
import AppRoutes from './routes/AppRoutes';


function App() {

  

  return (
    <div>
      <AppHeader />
      <AppRoutes />
    </div>
  )
}

export default App
