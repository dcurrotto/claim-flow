import { buildLogoutUrl, clearTokens, decodeJwt, getIdToken } from '../auth/cognito'

export default function Home() {
  const idToken = getIdToken()!
  const claims = decodeJwt(idToken)

  function logout() {
    clearTokens()
    window.location.href = buildLogoutUrl()
  }

  return (
    <main>
      <h1>{import.meta.env.VITE_SYSTEM_NAME}</h1>
      <p className="subtitle">Hello, authenticated user</p>
      <div className="user-card">
        {claims.email != null && <p><span>Email</span>{String(claims.email)}</p>}
        {claims.name != null && <p><span>Name</span>{String(claims.name)}</p>}
        {claims.sub != null && <p><span>Sub</span>{String(claims.sub)}</p>}
      </div>
      <button onClick={logout} className="btn-secondary">Log out</button>
    </main>
  )
}
