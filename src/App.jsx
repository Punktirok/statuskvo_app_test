import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import HomeScreen from './screens/HomeScreen.jsx'
import CategoryScreen from './screens/CategoryScreen.jsx'
import FirstClubScreen from './screens/FirstClubScreen.jsx'

function App() {
  useEffect(() => {
    WebApp.ready()
    WebApp.setBackgroundColor('#F3F3F8')
    WebApp.setHeaderColor('bg_color')
  }, [])

  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/category/:categoryName" element={<CategoryScreen />} />
        <Route path="/first-club" element={<FirstClubScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
