import { apiFetch } from './client'

export interface CognitoUser {
  username: string
  email: string
  name: string
  status: 'active' | 'inactive'
  user_status: string
  created: string
  groups: string[]
}

export function listUsers(): Promise<CognitoUser[]> {
  return apiFetch<CognitoUser[]>('/admin/users')
}
