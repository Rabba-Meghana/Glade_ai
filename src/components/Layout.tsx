import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, BarChart3, ChevronRight, Zap, AlertCircle } from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'

const criticalCount = MOCK_CASES.filter(c => c.urgency === 'critical').length
const activeCount = MOCK_CASES.filter(c => c.status !== 'filed').length

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f0f3ff' }}>
      <aside style={{
        width: 224,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRight: '1px solid #eaeaea',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#5F4F86',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={15} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'Onest, sans-serif', fontWeight: 500, fontSize: 15, color: '#3d3060', letterSpacing: '-0.01em' }}>
                PARALEX
              </div>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#999', letterSpacing: '0.04em' }}>
                case intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Critical alert */}
        {criticalCount > 0 && (
          <div style={{
            margin: '10px 12px 0',
            padding: '8px 12px',
            borderRadius: 8,
            background: '#fff5f5',
            border: '1px solid #fecaca',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#b91c1c' }}>
              {criticalCount} critical case{criticalCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { to: '/war-room', icon: LayoutGrid, label: 'Case War Room', badge: String(activeCount) },
            { to: '/eval', icon: BarChart3, label: 'Eval Dashboard', badge: null },
          ].map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8,
              background: isActive ? '#ede8f8' : 'transparent',
              color: isActive ? '#4a3d6e' : '#555',
              textDecoration: 'none', fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.15s',
            })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon size={15} />
                <span>{label}</span>
              </div>
              {badge && (
                <span style={{
                  fontSize: 11, padding: '1px 7px', borderRadius: 20,
                  background: '#e2daf5', color: '#4a3d6e',
                  fontFamily: 'Geist Mono, monospace',
                }}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}

          {/* Active cases section */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 10, color: '#bbb', padding: '0 12px 6px',
              fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Active Cases
            </div>
            {MOCK_CASES.filter(c => ['critical', 'high'].includes(c.urgency) && c.status !== 'filed').slice(0, 5).map(c => (
              <NavLink key={c.id} to={`/case/${c.id}`} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', borderRadius: 8,
                background: isActive ? '#f5f3ff' : 'transparent',
                color: '#555', textDecoration: 'none', fontSize: 12,
                transition: 'all 0.15s',
              })}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: c.urgency === 'critical' ? '#ef4444' : c.urgency === 'high' ? '#f59e0b' : '#9b8fd4',
                }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.clientName}</span>
                <ChevronRight size={10} style={{ opacity: 0.35, flexShrink: 0 }} />
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User */}
        <div style={{ padding: '12px', borderTop: '1px solid #eaeaea' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 8, background: '#fafafa',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: '#5F4F86', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 500, flexShrink: 0,
            }}>
              MR
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Meghana Rabba</div>
              <div style={{ fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>FDE Candidate</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
