import { decodeJwt, getIdToken } from '../auth/cognito'

export interface AuthUser {
  email: string
  name?: string
  sub: string
  groups: string[]
}

export function useAuth(): AuthUser | null {
  const idToken = getIdToken()
  if (!idToken) return null

  try {
    const claims = decodeJwt(idToken)
    return {
      email: String(claims.email ?? ''),
      name: claims.name ? String(claims.name) : undefined,
      sub: String(claims.sub ?? ''),
      groups: Array.isArray(claims['cognito:groups'])
        ? (claims['cognito:groups'] as string[])
        : [],
    }
  } catch {
    return null
  }
}
