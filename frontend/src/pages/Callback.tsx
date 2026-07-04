import { useEffect, useRef, useState } from 'react'
import { exchangeCode } from '../auth/cognito'

export default function Callback() {
  const [error, setError] = useState<string | null>(null)
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) {
      setError('No authorization code received.')
      return
    }
    exchangeCode(code)
      .then(() => window.location.replace('/'))
      .catch(() => setError('Sign-in failed. Please try again.'))
  }, [])

  return (
    <main>
      {error ? <p className="error">{error}</p> : <p className="subtitle">Signing you in…</p>}
    </main>
  )
}
