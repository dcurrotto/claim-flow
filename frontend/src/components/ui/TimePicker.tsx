import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  value: string       // HH:MM (24h) or ''
  onChange: (v: string) => void
  placeholder?: string
}

const HOURS   = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = ['00','05','10','15','20','25','30','35','40','45','50','55']

function parse24(v: string): { hour: number | null; minute: string | null; ampm: 'AM' | 'PM' } {
  if (!v) return { hour: null, minute: null, ampm: 'AM' }
  const [h, m] = v.split(':').map(Number)
  return { hour: h % 12 || 12, minute: String(m).padStart(2, '0'), ampm: h >= 12 ? 'PM' : 'AM' }
}

function to24(hour: number, minute: string, ampm: 'AM' | 'PM') {
  let h = hour % 12
  if (ampm === 'PM') h += 12
  return `${String(h).padStart(2,'0')}:${minute}`
}

export default function TimePicker({ value, onChange, placeholder = 'Select time…' }: Props) {
  const init = parse24(value)
  const [open, setOpen]     = useState(false)
  const [pos, setPos]       = useState({ top: 0, left: 0 })
  const [hour, setHour]     = useState<number | null>(init.hour)
  const [minute, setMinute] = useState<string | null>(init.minute)
  const [ampm, setAmpm]     = useState<'AM' | 'PM'>(init.ampm)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const p = parse24(value)
    setHour(p.hour); setMinute(p.minute); setAmpm(p.ampm)
  }, [value])

  function handleOpen() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left })
    }
    setOpen(o => !o)
  }

  function emit(h: number | null, m: string | null, ap: 'AM' | 'PM') {
    const resolvedH = h ?? 12
    const resolvedM = m ?? '00'
    onChange(to24(resolvedH, resolvedM, ap))
  }

  function pickHour(h: number)        { setHour(h);   emit(h, minute, ampm) }
  function pickMinute(m: string)      { setMinute(m); emit(hour, m, ampm) }
  function pickAmpm(ap: 'AM' | 'PM') { setAmpm(ap);  emit(hour, minute, ap) }

  const label = hour !== null && minute !== null ? `${hour}:${minute} ${ampm}` : ''

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="form-input"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}
        onClick={handleOpen}
      >
        <span style={{ color: label ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
          {label || placeholder}
        </span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>

      {open && createPortal(
        <>
          {/* Backdrop — clicking anywhere outside closes the picker */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              background: 'var(--color-bg-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              padding: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              display: 'flex',
              gap: 4,
            }}
          >
            <Column label="Hour">
              {HOURS.map(h => (
                <TimeBtn key={h} label={String(h)} selected={h === hour} onClick={() => pickHour(h)} />
              ))}
            </Column>
            <Column label="Min">
              {MINUTES.map(m => (
                <TimeBtn key={m} label={m} selected={m === minute} onClick={() => pickMinute(m)} />
              ))}
            </Column>
            <Column label="">
              <TimeBtn label="AM" selected={ampm === 'AM'} onClick={() => pickAmpm('AM')} />
              <TimeBtn label="PM" selected={ampm === 'PM'} onClick={() => pickAmpm('PM')} />
            </Column>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

function Column({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center', padding: '0 0 4px', minWidth: 52 }}>
        {label}
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function TimeBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block', width: '100%', padding: '6px 8px',
        background: selected ? 'var(--color-accent)' : 'transparent',
        color: selected ? '#fff' : 'var(--color-text)',
        border: 'none', borderRadius: 6, cursor: 'pointer',
        fontSize: 13, textAlign: 'center', fontWeight: selected ? 700 : 400,
      }}
    >
      {label}
    </button>
  )
}
