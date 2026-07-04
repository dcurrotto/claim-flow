import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import { useAuth } from '../hooks/useAuth'
import { listClaims, type Claim } from '../api/claimApi'

type Triage = 'straight-through' | 'manual-review' | 'siu'
type ClaimStatus = 'new' | 'in-progress' | 'flagged' | 'closed'

interface ClaimRow {
  id: string
  claimant: string
  type: string
  reported: string
  triage: Triage
  status: ClaimStatus
}

const FILTERS = [
  { label: 'All',              value: 'all' },
  { label: 'Straight-Through', value: 'straight-through' },
  { label: 'Manual Review',    value: 'manual-review' },
  { label: 'SIU Review',       value: 'siu' },
]

function triageBadge(t: Triage) {
  if (t === 'straight-through') return <Badge variant="success">Straight-Through</Badge>
  if (t === 'manual-review')    return <Badge variant="warning">Manual Review</Badge>
  return <Badge variant="danger">SIU Review</Badge>
}

function statusBadge(s: ClaimStatus) {
  if (s === 'new')         return <Badge variant="info">New</Badge>
  if (s === 'in-progress') return <Badge variant="neutral">In Progress</Badge>
  if (s === 'flagged')     return <Badge variant="danger">Flagged</Badge>
  return <Badge variant="neutral">Closed</Badge>
}

function toRow(c: Claim): ClaimRow {
  const type = c.loss_type
    ? c.loss_type.charAt(0).toUpperCase() + c.loss_type.slice(1)
    : '—'
  return {
    id: c.ClaimId,
    claimant: c.name,
    type,
    reported: c.date_of_loss,
    triage: (c.triage ?? 'manual-review') as Triage,
    status: (c.status ?? 'new') as ClaimStatus,
  }
}

export default function Dashboard() {
  const user = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listClaims()
      .then(items => setClaims(items.map(toRow)))
      .catch(() => setError('Failed to load claims.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = filter === 'all' ? claims : claims.filter(c => c.triage === filter)

  const stats = [
    { label: 'Total Claims',     value: claims.length },
    { label: 'Straight-Through', value: claims.filter(c => c.triage === 'straight-through').length },
    { label: 'Manual Review',    value: claims.filter(c => c.triage === 'manual-review').length },
    { label: 'SIU Review',       value: claims.filter(c => c.triage === 'siu').length },
  ]

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h2 className="page-title">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h2>
          <p className="page-subtitle">
            {loading ? 'Loading claims…' : `Claims queue — ${claims.length} open claims`}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{loading ? '—' : s.value}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                border: filter === f.value ? 'none' : '1px solid var(--color-border)',
                background: filter === f.value ? 'var(--color-accent)' : 'transparent',
                color: filter === f.value ? '#fff' : 'var(--color-text-muted)',
                fontWeight: filter === f.value ? 600 : 400,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Claim #</th>
                <th>Claimant</th>
                <th>Type</th>
                <th>Date of Loss</th>
                <th>Triage</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px 0' }}>
                    No claims found.
                  </td>
                </tr>
              )}
              {visible.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.id}</td>
                  <td style={{ fontWeight: 500 }}>{c.claimant}</td>
                  <td className="td-muted">{c.type}</td>
                  <td className="td-muted">{c.reported}</td>
                  <td>{triageBadge(c.triage)}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/claims/${c.id}`)}
                      style={{ fontSize: 13, border: 'none', background: 'none', color: 'var(--color-accent)', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                    >
                      Open →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
