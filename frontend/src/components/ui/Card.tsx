import type { ReactNode } from 'react'

type Padding = 'none' | 'sm' | 'md' | 'lg'

interface Props {
  children: ReactNode
  padding?: Padding
  className?: string
}

export default function Card({ children, padding = 'md', className = '' }: Props) {
  return (
    <div className={`card card-${padding} ${className}`}>
      {children}
    </div>
  )
}
