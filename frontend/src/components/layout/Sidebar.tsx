import { NavLink } from 'react-router-dom'
import { Inbox, Settings, Shield, LogOut } from 'lucide-react'
import { buildLogoutUrl, clearTokens } from '../../auth/cognito'
import type { AuthUser } from '../../hooks/useAuth'

interface Props {
  open: boolean
  onClose: () => void
  user: AuthUser | null
}

const TOP_NAV = [
  { to: '/',         icon: Inbox,    label: 'Claims Queue' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function initials(user: AuthUser) {
  if (user.name) return user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return user.email[0].toUpperCase()
}

export default function Sidebar({ open, onClose, user }: Props) {
  const isAdmin = user?.groups.includes('Admins') ?? false

  function logout() {
    clearTokens()
    window.location.href = buildLogoutUrl()
  }

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Main navigation">
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">{import.meta.env.VITE_SYSTEM_NAME}</span>
      </div>

      <nav className="sidebar-nav">
        {TOP_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="nav-group-label">Admin</div>
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <Shield size={15} />
              Users
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">{initials(user)}</div>
            <div className="user-info">
              <div className="user-name">{user.name ?? user.email}</div>
              <div className="user-role">{isAdmin ? 'Admin' : 'Adjuster'}</div>
            </div>
          </div>
        )}
        <button className="nav-item" onClick={logout}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
