import { useState, useEffect } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export interface Viewport {
  width: number
  bp: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export function useViewport(): Viewport {
  const [width, setWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200)

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const bp: Breakpoint = width < 768 ? 'mobile' : width < 1100 ? 'tablet' : 'desktop'

  return { width, bp, isMobile: bp === 'mobile', isTablet: bp === 'tablet', isDesktop: bp === 'desktop' }
}
