import '../App.css'
import { buildLoginUrl } from '../auth/cognito'
import heroImage from '../assets/funnel-images/standard-image-1.png'

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: 'Guided FNOL Intake',
    description: 'Claimants report incidents in minutes with a structured digital wizard — capturing incident details, damage assessments, and supporting documents.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Intelligent Triage',
    description: 'Claims are automatically routed to straight-through processing, manual review, or SIU escalation — getting the right claim to the right adjuster instantly.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Adjuster Workspace',
    description: 'Full case detail with timeline, policy coverage, risk flags, and document management — everything an adjuster needs to resolve claims efficiently.',
  },
]

export default function Landing() {
  const systemName = import.meta.env.VITE_SYSTEM_NAME
  const tagline = import.meta.env.VITE_SYSTEM_LOGO

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <span className="landing-nav-brand">{systemName}</span>
        <a href={buildLoginUrl()} className="btn btn-primary btn-sm">Sign in</a>
      </nav>

      <section className="landing-hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <span className="landing-pill">FOR P&amp;C INSURANCE CARRIERS AND CLAIMS TEAMS</span>
          <h1 className="landing-hero-title">{systemName}</h1>
          <p className="landing-hero-subtitle">{tagline}</p>
          <a href={buildLoginUrl()} className="btn btn-primary btn-lg">Sign in</a>
        </div>
      </section>

      <section className="landing-features">
        {features.map((f) => (
          <div className="landing-feature-card card card-md" key={f.title}>
            <div className="landing-feature-icon">{f.icon}</div>
            <h3 className="landing-feature-title">{f.title}</h3>
            <p className="landing-feature-desc">{f.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
