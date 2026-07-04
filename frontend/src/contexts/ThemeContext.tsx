import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark'
export type AccentKey = 'blue' | 'green' | 'orange' | 'violet' | 'rose'
export type SidebarKey = 'graphite' | 'midnight' | 'slate' | 'forest' | 'light'

type AccentColors = { accent: string; hover: string; subtle: string; muted: string; text: string }
type AccentConfig = { label: string; swatch: string; light: AccentColors; dark: AccentColors }

type SidebarColors = { bg: string; hover: string; active: string; border: string; text: string; textActive: string }
type SidebarConfig = { label: string; swatch: string; colors: SidebarColors }

export const ACCENTS: Record<AccentKey, AccentConfig> = {
  blue: {
    label: 'Blue', swatch: '#2563eb',
    light: { accent: '#2563eb', hover: '#1d4ed8', subtle: '#eff6ff', muted: '#dbeafe', text: '#1e40af' },
    dark:  { accent: '#3b82f6', hover: '#60a5fa', subtle: '#1e3a5f', muted: '#1e40af', text: '#93c5fd' },
  },
  green: {
    label: 'Green', swatch: '#16a34a',
    light: { accent: '#16a34a', hover: '#15803d', subtle: '#f0fdf4', muted: '#bbf7d0', text: '#166534' },
    dark:  { accent: '#22c55e', hover: '#4ade80', subtle: '#052e16', muted: '#166534', text: '#86efac' },
  },
  orange: {
    label: 'Orange', swatch: '#ea580c',
    light: { accent: '#ea580c', hover: '#c2410c', subtle: '#fff7ed', muted: '#fed7aa', text: '#9a3412' },
    dark:  { accent: '#f97316', hover: '#fb923c', subtle: '#431407', muted: '#9a3412', text: '#fdba74' },
  },
  violet: {
    label: 'Violet', swatch: '#7c3aed',
    light: { accent: '#7c3aed', hover: '#6d28d9', subtle: '#f5f3ff', muted: '#ddd6fe', text: '#5b21b6' },
    dark:  { accent: '#8b5cf6', hover: '#a78bfa', subtle: '#2e1065', muted: '#5b21b6', text: '#c4b5fd' },
  },
  rose: {
    label: 'Rose', swatch: '#e11d48',
    light: { accent: '#e11d48', hover: '#be123c', subtle: '#fff1f2', muted: '#fecdd3', text: '#9f1239' },
    dark:  { accent: '#f43f5e', hover: '#fb7185', subtle: '#4c0519', muted: '#9f1239', text: '#fda4af' },
  },
}

export const SIDEBARS: Record<SidebarKey, SidebarConfig> = {
  graphite: {
    label: 'Graphite', swatch: '#111827',
    colors: { bg: '#111827', hover: '#1f2937', active: '#1f2937', border: '#1f2937', text: '#9ca3af', textActive: '#f9fafb' },
  },
  midnight: {
    label: 'Midnight', swatch: '#0f172a',
    colors: { bg: '#0f172a', hover: '#1e293b', active: '#1e293b', border: '#1e293b', text: '#94a3b8', textActive: '#f1f5f9' },
  },
  slate: {
    label: 'Slate', swatch: '#334155',
    colors: { bg: '#1e293b', hover: '#334155', active: '#334155', border: '#334155', text: '#94a3b8', textActive: '#f1f5f9' },
  },
  forest: {
    label: 'Forest', swatch: '#166534',
    colors: { bg: '#14532d', hover: '#166534', active: '#166534', border: '#166534', text: '#86efac', textActive: '#f0fdf4' },
  },
  light: {
    label: 'Light', swatch: '#e5e7eb',
    colors: { bg: '#f9fafb', hover: '#f3f4f6', active: '#f3f4f6', border: '#e5e7eb', text: '#6b7280', textActive: '#111827' },
  },
}

function applyAccent(mode: ThemeMode, accent: AccentKey) {
  const colors = ACCENTS[accent][mode]
  const s = document.documentElement.style
  s.setProperty('--color-accent',        colors.accent)
  s.setProperty('--color-accent-hover',  colors.hover)
  s.setProperty('--color-accent-subtle', colors.subtle)
  s.setProperty('--color-accent-muted',  colors.muted)
  s.setProperty('--color-accent-text',   colors.text)
}

function applySidebar(key: SidebarKey) {
  const c = SIDEBARS[key].colors
  const s = document.documentElement.style
  s.setProperty('--sidebar-bg',          c.bg)
  s.setProperty('--sidebar-hover',       c.hover)
  s.setProperty('--sidebar-active',      c.active)
  s.setProperty('--sidebar-border',      c.border)
  s.setProperty('--sidebar-text',        c.text)
  s.setProperty('--sidebar-text-active', c.textActive)
}

interface ThemeContextValue {
  mode: ThemeMode
  accent: AccentKey
  sidebar: SidebarKey
  toggleMode: () => void
  setAccent: (key: AccentKey) => void
  setSidebar: (key: SidebarKey) => void
}

const ThemeContext = createContext<ThemeContextValue>({} as ThemeContextValue)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(
    () => (localStorage.getItem('theme-mode') as ThemeMode) ?? 'light'
  )
  const [accent, setAccentState] = useState<AccentKey>(
    () => (localStorage.getItem('theme-accent') as AccentKey) ?? 'blue'
  )
  const [sidebar, setSidebarState] = useState<SidebarKey>(
    () => (localStorage.getItem('theme-sidebar') as SidebarKey) ?? 'graphite'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    localStorage.setItem('theme-mode', mode)
    applyAccent(mode, accent)
    applySidebar(sidebar)
  }, [mode, accent, sidebar])

  function toggleMode() { setMode(m => (m === 'light' ? 'dark' : 'light')) }
  function setAccent(key: AccentKey) { setAccentState(key); localStorage.setItem('theme-accent', key) }
  function setSidebar(key: SidebarKey) { setSidebarState(key); localStorage.setItem('theme-sidebar', key) }

  return (
    <ThemeContext.Provider value={{ mode, accent, sidebar, toggleMode, setAccent, setSidebar }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
