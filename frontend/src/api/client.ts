import { getIdToken } from '../auth/cognito'

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getIdToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    let detail = `API error ${res.status}`
    try { detail = JSON.parse(text)?.detail ?? detail } catch {}
    throw new Error(detail)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : (undefined as T)
}
