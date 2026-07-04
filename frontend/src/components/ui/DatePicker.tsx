import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  value: string       // YYYY-MM-DD or ''
  onChange: (v: string) => void
  placeholder?: string
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DOW    = ['Su','Mo','Tu','We','Th','Fr','Sa']

function parseIso(v: string) {
  if (!v) return null
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function DatePicker({ value, onChange, placeholder = 'Select date…' }: Props) {
  const today   = new Date()
  const sel     = parseIso(value)
  const [open, setOpen]           = useState(false)
  const [pos, setPos]             = useState({ top: 0, left: 0, width: 0 })
  const [viewYear, setViewYear]   = useState((sel ?? today).getFullYear())
  const [viewMonth, setViewMonth] = useState((sel ?? today).getMonth())
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const portal = document.getElementById('datepicker-portal')
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        portal && !portal.contains(e.target as Node)
      ) setOpen(false)
    }
    function onScroll() { setOpen(false) }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [])

  function handleOpen() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setOpen(o => !o)
  }

  function prev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function next() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }
  function pick(day: number) {
    onChange(toIso(new Date(viewYear, viewMonth, day)))
    setOpen(false)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay()
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const label = sel
    ? sel.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''

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
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {open && createPortal(
        <div
          id="datepicker-portal"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            minWidth: Math.max(pos.width, 272),
            zIndex: 9999,
            background: 'var(--color-bg-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button type="button" onClick={prev} style={navBtn}>‹</button>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={next} style={navBtn}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DOW.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, padding: '2px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const isSel   = sel && sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && sel.getDate() === day
              const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(day)}
                  style={{
                    padding: '7px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'center',
                    background: isSel ? 'var(--color-accent)' : 'transparent',
                    color: isSel ? '#fff' : isToday ? 'var(--color-accent)' : 'var(--color-text)',
                    fontWeight: isSel || isToday ? 700 : 400,
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

const navBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--color-text)', fontSize: 20, padding: '0 8px',
  borderRadius: 4, lineHeight: 1,
}
