import React, { useState, useRef } from 'react'
import { submitClaim } from '../../api/claimApi'

const STEPS = ['Incident', 'People', 'Damage', 'Documents', 'Review'] as const

interface FormState {
  loss_type: string
  date_of_loss: string
  time_of_loss: string
  location: string
  description: string
  name: string
  email: string
  phone: string
  other_parties: string
  damage_description: string
  estimated_amount: string
  vehicle_info: string
  doc_names: string[]
}

const BLANK: FormState = {
  loss_type: '', date_of_loss: '', time_of_loss: '', location: '', description: '',
  name: '', email: '', phone: '', other_parties: '',
  damage_description: '', estimated_amount: '', vehicle_info: '',
  doc_names: [],
}

// ── Shared field styles ────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 6,
  border: '1px solid var(--color-border, #e5e7eb)',
  fontSize: 14, background: '#fff',
  color: '#111', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4,
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Step components ────────────────────────────────────────────────────────

function IncidentStep({ d, set }: { d: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <>
      <Field label="Type of Loss" required>
        <select value={d.loss_type} onChange={e => set('loss_type', e.target.value)} style={inputStyle}>
          <option value="">Select one…</option>
          <option value="auto">Auto</option>
          <option value="property">Property</option>
          <option value="liability">Liability</option>
        </select>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Date of Loss" required>
          <input type="date" value={d.date_of_loss} onChange={e => set('date_of_loss', e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Time of Loss">
          <input type="time" value={d.time_of_loss} onChange={e => set('time_of_loss', e.target.value)} style={inputStyle} />
        </Field>
      </div>
      <Field label="Location / Address" required>
        <input type="text" placeholder="123 Main St, Raleigh, NC 27601" value={d.location} onChange={e => set('location', e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Describe what happened" required>
        <textarea rows={4} placeholder="Describe the incident in as much detail as possible." value={d.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>
    </>
  )
}

function PeopleStep({ d, set }: { d: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Tell us about the policyholder reporting this claim.</p>
      <Field label="Full Name" required>
        <input type="text" placeholder="Jane Smith" value={d.name} onChange={e => set('name', e.target.value)} style={inputStyle} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Email" required>
          <input type="email" placeholder="jane@example.com" value={d.email} onChange={e => set('email', e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Phone">
          <input type="tel" placeholder="(555) 555-5555" value={d.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} />
        </Field>
      </div>
      <Field label="Other parties involved (optional)">
        <textarea rows={3} placeholder="Names, contact info, insurance carrier for anyone else involved." value={d.other_parties} onChange={e => set('other_parties', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>
    </>
  )
}

function DamageStep({ d, set }: { d: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <>
      <Field label="Describe the damage" required>
        <textarea rows={4} placeholder="What was damaged? How severely?" value={d.damage_description} onChange={e => set('damage_description', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>
      <Field label="Estimated damage amount">
        <input type="text" placeholder="$5,000" value={d.estimated_amount} onChange={e => set('estimated_amount', e.target.value)} style={inputStyle} />
      </Field>
      {d.loss_type === 'auto' && (
        <Field label="Vehicle — Year, Make, Model, VIN">
          <input type="text" placeholder="2021 Toyota Camry — 4T1BF1FK5MU123456" value={d.vehicle_info} onChange={e => set('vehicle_info', e.target.value)} style={inputStyle} />
        </Field>
      )}
    </>
  )
}

function DocumentsStep({ d, setData }: { d: FormState; setData: React.Dispatch<React.SetStateAction<FormState>> }) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const names = Array.from(files).map(f => f.name)
    setData(prev => ({ ...prev, doc_names: [...prev.doc_names, ...names] }))
  }

  function remove(name: string) {
    setData(prev => ({ ...prev, doc_names: prev.doc_names.filter(n => n !== name) }))
  }

  return (
    <>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
        Upload photos, repair estimates, police reports, or any other supporting documents.
        <br />Optional, but recommended.
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #d1d5db', borderRadius: 8, padding: '28px 16px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 16,
          color: '#6b7280', fontSize: 14,
        }}
      >
        Click to select files
        <div style={{ fontSize: 12, marginTop: 4, color: '#9ca3af' }}>JPG, PNG, PDF — up to 10 MB each</div>
      </div>
      <input ref={inputRef} type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

      {d.doc_names.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {d.doc_names.map(name => (
            <li key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
              <span>📄 {name}</span>
              <button onClick={() => remove(name)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function ReviewStep({ d }: { d: FormState }) {
  const rows: [string, string][] = [
    ['Loss Type',    d.loss_type || '—'],
    ['Date of Loss', d.date_of_loss || '—'],
    ['Time of Loss', d.time_of_loss || '—'],
    ['Location',     d.location || '—'],
    ['Description',  d.description || '—'],
    ['Your Name',    d.name || '—'],
    ['Email',        d.email || '—'],
    ['Phone',        d.phone || '—'],
    ['Damage',       d.damage_description || '—'],
    ['Est. Amount',  d.estimated_amount || '—'],
    ['Vehicle',      d.vehicle_info || (d.loss_type === 'auto' ? '—' : '')],
    ['Documents',    d.doc_names.length > 0 ? `${d.doc_names.length} file(s)` : 'None attached'],
  ].filter(([, v]) => v !== '') as [string, string][]

  return (
    <>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>Review your information before submitting.</p>
      <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px 16px', margin: 0 }}>
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, margin: 0, paddingTop: 1 }}>{label}</dt>
            <dd style={{ fontSize: 13, margin: 0, wordBreak: 'break-word' }}>{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </>
  )
}

// ── Progress indicator ─────────────────────────────────────────────────────

function Progress({ current }: { current: number }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        {STEPS.map((label, i) => (
          <span key={label} style={{ fontSize: 11, fontWeight: i <= current ? 600 : 400, color: i <= current ? 'var(--color-accent, #6366f1)' : '#9ca3af', flex: 1, textAlign: 'center' }}>
            {label}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {STEPS.map((label, i) => (
          <div key={label} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= current ? 'var(--color-accent, #6366f1)' : '#e5e7eb' }} />
        ))}
      </div>
    </div>
  )
}

// ── Confirmation ───────────────────────────────────────────────────────────

function Confirmation({ name, claimId }: { name: string; claimId: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f8f9fa' }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>Claim Submitted</h2>
        <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 4 }}>
          Thank you{name ? `, ${name.split(' ')[0]}` : ''}. Your claim has been received and an adjuster will be in touch within 1–2 business days.
        </p>
        <p style={{ color: '#9ca3af', fontSize: 13 }}>Reference: <strong>{claimId}</strong></p>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function IntakePage() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [claimId, setClaimId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [data, setData] = useState<FormState>(BLANK)

  function set(field: keyof FormState, value: string) {
    setData(d => ({ ...d, [field]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await submitClaim(data)
      setClaimId(result.ClaimId)
      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return <Confirmation name={data.name} claimId={claimId} />

  const isLast = step === STEPS.length - 1

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Report a Claim</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>Walk through each section. Takes about 5 minutes.</p>
        </div>

        <Progress current={step} />

        <div style={{ background: '#fff', borderRadius: 12, padding: 32, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 600 }}>{STEPS[step]}</h2>

          {step === 0 && <IncidentStep d={data} set={set} />}
          {step === 1 && <PeopleStep d={data} set={set} />}
          {step === 2 && <DamageStep d={data} set={set} />}
          {step === 3 && <DocumentsStep d={data} setData={setData} />}
          {step === 4 && <ReviewStep d={data} />}

          {submitError && (
            <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{submitError}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0 || submitting}
              style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'transparent', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.35 : 1, fontSize: 14 }}
            >
              Back
            </button>
            <button
              onClick={isLast ? handleSubmit : () => setStep(s => s + 1)}
              disabled={submitting}
              style={{ padding: '8px 22px', borderRadius: 6, border: 'none', background: 'var(--color-accent, #6366f1)', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, opacity: submitting ? 0.7 : 1 }}
            >
              {isLast ? (submitting ? 'Submitting…' : 'Submit Claim') : 'Continue →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9ca3af' }}>
          Claim Flow · Questions? Contact your insurer directly.
        </p>
      </div>
    </div>
  )
}
