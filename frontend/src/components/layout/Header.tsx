import { useLocation } from 'react-router-dom'
import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { AuthUser } from '../../hooks/useAuth'

const TITLES: Record<string, string> = {
  '/':           'Dashboard',
  '/settings':   'Settings',
  '/admin':      'Users',
}

interface Props {
  onMenuClick: () => void
  user: AuthUser | null
}

export default function Header({ onMenuClick, user }: Props) {
  const { pathname } = useLocation()
  const { mode, toggleMode } = useTheme()
  const title = TITLES[pathname] ?? 'Dashboard'

  return (
    <header className="header">
      <button className="header-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <h1 className="header-title">{title}</h1>
      <div className="header-actions">
        {user && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {user.email}
          </span>
        )}
        <button
          className="btn btn-ghost btn-sm"
          onClick={toggleMode}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{ padding: '6px' }}
        >
          {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}
