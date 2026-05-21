import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  c: ThemeTokens
}

export interface ThemeTokens {
  bg: string
  bgElevated: string
  surface: string
  surfaceHover: string
  border: string
  borderStrong: string
  text: string
  textMuted: string
  textSubtle: string
  accent: string
  accentSoft: string
  accentText: string
  success: string
  warning: string
  danger: string
  info: string
  gradient: string
  shadow: string
}

const DARK: ThemeTokens = {
  bg: '#0a0a0b',
  bgElevated: '#111113',
  surface: '#16161a',
  surfaceHover: '#1c1c22',
  border: '#26262e',
  borderStrong: '#34343d',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  textSubtle: '#71717a',
  accent: '#a78bfa',
  accentSoft: '#2a1f4a',
  accentText: '#c4b5fd',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#60a5fa',
  gradient: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
  shadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
}

const LIGHT: ThemeTokens = {
  bg: '#f5f5f7',
  bgElevated: '#ffffff',
  surface: '#ffffff',
  surfaceHover: '#fafafa',
  border: '#eaeaea',
  borderStrong: '#d4d4d8',
  text: '#161616',
  textMuted: '#52525b',
  textSubtle: '#a1a1aa',
  accent: '#5F4F86',
  accentSoft: '#ede8f8',
  accentText: '#4a3d6e',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
  shadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem('paralex-theme') as Theme | null
    return stored ?? 'dark'
  })

  useEffect(() => {
    localStorage.setItem('paralex-theme', theme)
    document.documentElement.style.colorScheme = theme
    document.body.style.background = theme === 'dark' ? DARK.bg : LIGHT.bg
    document.body.style.color = theme === 'dark' ? DARK.text : LIGHT.text
  }, [theme])

  const value: ThemeContextValue = {
    theme,
    toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
    c: theme === 'dark' ? DARK : LIGHT,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
