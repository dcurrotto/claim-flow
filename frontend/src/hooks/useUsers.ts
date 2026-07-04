import { useState, useEffect, useCallback } from 'react'
import { listUsers, type CognitoUser } from '../api/adminApi'

export function useUsers() {
  const [users, setUsers] = useState<CognitoUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => {
    setLoading(true)
    listUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { users, loading, refresh: fetch }
}
