import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import HomeScreen from './screens/HomeScreen.jsx'
import CategoryScreen from './screens/CategoryScreen.jsx'
import FirstClubScreen from './screens/FirstClubScreen.jsx'
import FaqScreen from './screens/FaqScreen.jsx'

function App() {
  useEffect(() => {
    WebApp.ready()
    WebApp.setBackgroundColor('#F3F3F8')
    WebApp.setHeaderColor('bg_color')
  }, [])

  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/category/:categoryName" element={<CategoryScreen />} />
        <Route path="/first-club" element={<FirstClubScreen />} />
        <Route path="/faq" element={<FaqScreen />} />
        <Route path="/:tab" element={<HomeScreen />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  )
}

export default App
