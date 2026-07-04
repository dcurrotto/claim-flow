import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getIdToken } from './auth/cognito'
import { ThemeProvider } from './contexts/ThemeContext'
import Callback from './pages/Callback'
import Landing from './pages/Landing'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import ClaimDetail from './pages/ClaimDetail'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import IntakePage from './pages/public/IntakePage'

export default function App() {
  const path = window.location.pathname
  const isIntake = path.startsWith('/intake')
  const isCallback = new URLSearchParams(window.location.search).has('code')
  const isAuthenticated = !!getIdToken()

  // Public FNOL intake — no auth, no app shell
  if (isIntake) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/intake" element={<IntakePage />} />
        </Routes>
      </BrowserRouter>
    )
  }

  if (isCallback) return <Callback />
  if (!isAuthenticated) return <Landing />

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/claims/:id" element={<ClaimDetail />} />
            <Route path="/settings"   element={<Settings />} />
            <Route path="/admin"      element={<Admin />} />
            <Route path="*"           element={<Dashboard />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  )
}
