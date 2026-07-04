import { useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  children: ReactNode
}

export default function AppShell({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = useAuth()

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  )
}
