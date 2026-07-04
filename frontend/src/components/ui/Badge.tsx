import type { ReactNode } from 'react'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface Props {
  variant?: Variant
  children: ReactNode
}

export default function Badge({ variant = 'neutral', children }: Props) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}
