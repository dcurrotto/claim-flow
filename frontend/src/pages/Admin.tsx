import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../hooks/useAuth'
import { useUsers } from '../hooks/useUsers'
import { Shield } from 'lucide-react'

function userStatusLabel(userStatus: string) {
  const map: Record<string, string> = {
    CONFIRMED:             'Confirmed',
    UNCONFIRMED:           'Unconfirmed',
    FORCE_CHANGE_PASSWORD: 'Pending Password',
    RESET_REQUIRED:        'Reset Required',
  }
  return map[userStatus] ?? userStatus
}

export default function Admin() {
  const user = useAuth()
  const isAdmin = user?.groups.includes('Admins') ?? false
  const { users, loading } = useUsers()

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<Shield size={32} />}
        title="Access restricted"
        description="You need to be in the Admins group to view this page."
      />
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${users.length} registered user${users.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {loading ? (
        <Skeleton lines={4} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Shield size={32} />}
          title="No users found"
          description="No users are registered in this user pool yet."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Groups</th>
                <th>Account Status</th>
                <th>Enabled</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.username}>
                  <td style={{ fontWeight: 500 }}>{u.name || '—'}</td>
                  <td className="td-muted">{u.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {u.groups.length > 0
                        ? u.groups.map(g => (
                            <Badge key={g} variant={g === 'Admins' ? 'info' : 'neutral'}>{g}</Badge>
                          ))
                        : <span style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--text-sm)' }}>—</span>
                      }
                    </div>
                  </td>
                  <td>
                    <Badge variant={u.user_status === 'CONFIRMED' ? 'success' : 'warning'}>
                      {userStatusLabel(u.user_status)}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={u.status === 'active' ? 'success' : 'neutral'}>
                      {u.status === 'active' ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="td-muted">{u.created || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
