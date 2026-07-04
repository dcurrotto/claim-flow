interface Props {
  width?: string | number
  height?: string | number
  className?: string
  lines?: number
}

export default function Skeleton({ width = '100%', height = 16, className = '', lines }: Props) {
  if (lines && lines > 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`skeleton ${className}`} style={{ width, height }} />
        ))}
      </div>
    )
  }
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
