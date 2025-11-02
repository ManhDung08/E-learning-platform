import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HomePage from './pages/HomePage'
import { Route, Routes, useNavigate } from 'react-router-dom';
import AppHeader from './components/AppHeader'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <AppHeader />
      <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/home' element={<HomePage />}></Route>
      </Routes>
    </div>
  )
}

export default App
