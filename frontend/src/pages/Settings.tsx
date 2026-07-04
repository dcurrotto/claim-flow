import { useState } from 'react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useTheme, ACCENTS, SIDEBARS, type AccentKey, type SidebarKey } from '../contexts/ThemeContext'

export default function Settings() {
  const user = useAuth()
  const { mode, toggleMode, accent, setAccent, sidebar, setSidebar } = useTheme()
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div style={{ maxWidth: 560 }}>
        {/* Profile */}
        <div className="section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Profile</h3>
              <p className="section-description">Your name and email address</p>
            </div>
          </div>
          <div className="card card-md">
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <Input
                  id="name"
                  label="Display name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                />
                <Input
                  id="email"
                  label="Email address"
                  value={user?.email ?? ''}
                  disabled
                  hint="Managed by your identity provider."
                />
              </div>
              <div className="form-actions">
                <Button type="submit" variant="primary" size="sm">
                  {saved ? 'Saved' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Appearance */}
        <div className="section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Appearance</h3>
              <p className="section-description">Theme and accent color</p>
            </div>
          </div>
          <div className="card card-md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

              {/* Mode toggle */}
              <div>
                <div className="form-label" style={{ marginBottom: 'var(--sp-3)' }}>Color mode</div>
                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <button
                    onClick={() => mode !== 'light' && toggleMode()}
                    className={`btn btn-sm ${mode === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => mode !== 'dark' && toggleMode()}
                    className={`btn btn-sm ${mode === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Sidebar picker */}
              <div>
                <div className="form-label" style={{ marginBottom: 'var(--sp-3)' }}>Sidebar color</div>
                <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                  {(Object.entries(SIDEBARS) as [SidebarKey, typeof SIDEBARS[SidebarKey]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setSidebar(key)}
                      title={config.label}
                      aria-label={config.label}
                      aria-pressed={sidebar === key}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 'var(--radius-sm)',
                        background: config.swatch,
                        border: sidebar === key ? '2px solid var(--color-text)' : '2px solid var(--color-border-strong)',
                        outline: sidebar === key ? '2px solid var(--color-bg)' : 'none',
                        outlineOffset: '-4px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        transform: sidebar === key ? 'scale(1.2)' : 'scale(1)',
                        padding: 0,
                      }}
                    />
                  ))}
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {SIDEBARS[sidebar].label}
                  </span>
                </div>
              </div>

              {/* Accent picker */}
              <div>
                <div className="form-label" style={{ marginBottom: 'var(--sp-3)' }}>Accent color</div>
                <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                  {(Object.entries(ACCENTS) as [AccentKey, typeof ACCENTS[AccentKey]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setAccent(key)}
                      title={config.label}
                      aria-label={config.label}
                      aria-pressed={accent === key}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: config.swatch,
                        border: accent === key ? '2px solid var(--color-text)' : '2px solid transparent',
                        outline: accent === key ? '2px solid var(--color-bg)' : 'none',
                        outlineOffset: '-4px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        transform: accent === key ? 'scale(1.2)' : 'scale(1)',
                        padding: 0,
                      }}
                    />
                  ))}
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {ACCENTS[accent].label}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Account */}
        <div className="section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Account</h3>
              <p className="section-description">Access and session details</p>
            </div>
          </div>
          <div className="card card-md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div className="form-group">
                <label className="form-label">User ID</label>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  {user?.sub ?? '—'}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Groups</label>
                <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                  {(user?.groups ?? []).map(g => (
                    <span key={g} className="badge badge-info">{g}</span>
                  ))}
                  {(user?.groups ?? []).length === 0 && <span className="badge badge-neutral">No groups</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
