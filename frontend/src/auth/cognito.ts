import config from './config'

const TOKEN_KEYS = ['id_token', 'access_token', 'refresh_token'] as const

export function buildLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: config.redirectUri,
  })
  return `https://${config.domain}/login?${params}`
}

export function buildLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    logout_uri: config.logoutUri,
  })
  return `https://${config.domain}/logout?${params}`
}

export async function exchangeCode(code: string): Promise<void> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
  })

  const res = await fetch(`https://${config.domain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) throw new Error('Token exchange failed')

  const tokens = await res.json()
  localStorage.setItem('id_token', tokens.id_token)
  localStorage.setItem('access_token', tokens.access_token)
  if (tokens.refresh_token) localStorage.setItem('refresh_token', tokens.refresh_token)
}

export function getIdToken(): string | null {
  return localStorage.getItem('id_token')
}

export function clearTokens(): void {
  TOKEN_KEYS.forEach(k => localStorage.removeItem(k))
}

export function decodeJwt(token: string): Record<string, unknown> {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(payload))
}
