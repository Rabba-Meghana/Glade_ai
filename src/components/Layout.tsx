import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import { LayoutGrid, BarChart3, Sun, Moon, Bell, Search, Command, Cpu, Sparkles, Menu, X } from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'
import { useTheme } from '../contexts/ThemeContext'
import { useViewport } from '../hooks/useViewport'
import { useState, useEffect } from 'react'

const criticalCount = MOCK_CASES.filter(c => c.urgency === 'critical').length
const activeCount = MOCK_CASES.filter(c => c.status !== 'filed').length

function Logo({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(167, 139, 250, 0.4)',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)',
      }} />
      <Sparkles size={size * 0.5} color="#fff" style={{ position: 'relative', zIndex: 1 }} />
    </div>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { theme, toggle, c } = useTheme()
  const location = useLocation()
  const { isMobile } = useViewport()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, borderBottom: `1px solid ${c.border}`, position: 'relative' }}>
        {isMobile && onClose && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: 7, width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: c.textMuted,
          }}>
            <X size={14} />
          </button>
        )}
        <Logo size={44} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Onest, sans-serif', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: c.text }}>
            PARALEX
          </div>
          <div style={{ fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 9.5, color: c.textSubtle, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
            case intelligence
          </div>
        </div>
      </div>

      {/* Critical alert */}
      {criticalCount > 0 && (
        <div style={{
          margin: '12px 12px 0',
          padding: '10px 12px',
          borderRadius: 10,
          background: theme === 'dark' ? 'rgba(248, 113, 113, 0.08)' : '#fef2f2',
          border: `1px solid ${theme === 'dark' ? 'rgba(248, 113, 113, 0.2)' : '#fecaca'}`,
          display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: c.danger }} />
            <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: c.danger, opacity: 0.3, animation: 'ping 2s infinite' }} />
          </div>
          <span style={{ fontSize: 11.5, color: c.danger, fontWeight: 500 }}>
            {criticalCount} critical case{criticalCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {[
          { to: '/war-room', icon: LayoutGrid, label: 'War Room', badge: String(activeCount) },
          { to: '/eval', icon: BarChart3, label: 'Eval Dashboard', badge: null },
        ].map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} onClick={onClose} style={({ isActive }) => ({
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 12px', borderRadius: 9,
            background: isActive ? c.accentSoft : 'transparent',
            color: isActive ? c.accentText : c.textMuted,
            textDecoration: 'none', fontSize: 13,
            fontWeight: isActive ? 600 : 500,
            transition: 'all 0.15s',
          })}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 18, borderRadius: 2,
                    background: c.gradient,
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={15} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span style={{
                    fontSize: 10.5, padding: '2px 7px', borderRadius: 6,
                    background: isActive ? 'rgba(167, 139, 250, 0.15)' : (theme === 'dark' ? c.surface : '#f1f1f3'),
                    color: isActive ? c.accent : c.textMuted,
                    fontFamily: 'Geist Mono, ui-monospace, monospace',
                    fontWeight: 600,
                  }}>
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Live cases */}
        <div style={{ marginTop: 18 }}>
          <div style={{
            fontSize: 10, color: c.textSubtle, padding: '0 12px 8px',
            fontFamily: 'Geist Mono, ui-monospace, monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Live Cases
          </div>
          {MOCK_CASES.filter(c => ['critical', 'high'].includes(c.urgency) && c.status !== 'filed').slice(0, 6).map(cs => {
            const active = location.pathname.includes(cs.id)
            return (
              <NavLink key={cs.id} to={`/case/${cs.id}`} onClick={onClose} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 12px', borderRadius: 7,
                background: active ? (theme === 'dark' ? 'rgba(167,139,250,0.06)' : '#faf8ff') : 'transparent',
                color: c.textMuted, textDecoration: 'none', fontSize: 12,
                transition: 'all 0.15s',
              }}>
                <div style={{ position: 'relative', width: 7, height: 7, flexShrink: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                    background: cs.urgency === 'critical' ? c.danger : c.warning }} />
                  {cs.urgency === 'critical' && (
                    <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', background: c.danger, opacity: 0.3, animation: 'ping 2s infinite' }} />
                  )}
                </div>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cs.clientName}</span>
                <span style={{ fontSize: 10, color: c.textSubtle, fontFamily: 'Geist Mono, monospace' }}>{cs.healthScore}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div style={{ padding: 10, borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={toggle} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 8,
          background: c.surface, border: `1px solid ${c.border}`, color: c.textMuted,
          cursor: 'pointer', fontSize: 12, fontWeight: 500,
          transition: 'all 0.15s',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
          <div style={{
            width: 28, height: 16, borderRadius: 10, position: 'relative',
            background: theme === 'dark' ? c.accent : c.borderStrong,
            transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: theme === 'dark' ? 14 : 2,
              width: 12, height: 12, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }} />
          </div>
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 9,
          background: c.surface, border: `1px solid ${c.border}`,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: c.gradient, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, flexShrink: 0,
          }}>
            MR
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Meghana Rabba</div>
            <div style={{ fontSize: 10.5, color: c.textSubtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Geist Mono, monospace' }}>FDE • IL</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const { theme, c } = useTheme()
  const { isMobile, isTablet } = useViewport()
  const [now, setNow] = useState(new Date())
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Close drawer on route change for mobile
  useEffect(() => {
    setDrawerOpen(false)
  }, [])

  const showSidebar = !isMobile && !isTablet
  const showDrawer = isMobile || isTablet

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: c.bg, color: c.text, fontFamily: 'Onest, Inter, system-ui, sans-serif' }}>

      {/* Desktop sidebar */}
      {showSidebar && (
        <aside style={{
          width: 240, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: c.bgElevated,
          borderRight: `1px solid ${c.border}`,
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile/Tablet drawer overlay */}
      {showDrawer && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Mobile/Tablet drawer panel */}
      {showDrawer && (
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
          width: 260,
          background: c.bgElevated,
          borderRight: `1px solid ${c.border}`,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
        }}>
          <SidebarContent onClose={() => setDrawerOpen(false)} />
        </aside>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: 54, flexShrink: 0,
          background: c.bgElevated, borderBottom: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '0 12px' : '0 24px',
          gap: 10,
        }}>
          {/* Hamburger on mobile/tablet */}
          {showDrawer && (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: c.surface, border: `1px solid ${c.border}`,
                color: c.textMuted, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Menu size={16} />
            </button>
          )}

          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 14px', borderRadius: 8,
            background: c.surface, border: `1px solid ${c.border}`,
            flex: 1, minWidth: 0,
            maxWidth: isMobile ? '100%' : 380,
          }}>
            <Search size={14} color={c.textSubtle} style={{ flexShrink: 0 }} />
            <input placeholder={isMobile ? 'Search...' : 'Search cases, documents, agents...'} style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: c.text, fontSize: 12.5, flex: 1, fontFamily: 'inherit', minWidth: 0,
            }} />
            {!isMobile && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 10, color: c.textSubtle,
                padding: '2px 6px', borderRadius: 4,
                background: c.bg, border: `1px solid ${c.border}`,
                fontFamily: 'Geist Mono, monospace', flexShrink: 0,
              }}>
                <Command size={9} /> K
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexShrink: 0 }}>
            {!isMobile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, color: c.textMuted,
                padding: '5px 10px', borderRadius: 6,
                background: c.surface, border: `1px solid ${c.border}`,
                fontFamily: 'Geist Mono, monospace',
              }}>
                <Cpu size={11} color={c.success} />
                <span>groq • llama-3.3-70b</span>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.success, marginLeft: 4 }} />
              </div>
            )}
            {!isMobile && (
              <div style={{ fontSize: 11, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', flexShrink: 0 }}>
                {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
            )}
            <button style={{
              width: 32, height: 32, borderRadius: 8,
              background: c.surface, border: `1px solid ${c.border}`,
              color: c.textMuted, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', flexShrink: 0,
            }}>
              <Bell size={14} />
              <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 6, height: 6, borderRadius: '50%', background: c.danger,
              }} />
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
