import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, Brain, BarChart3, ChevronRight, Zap, Bell, Settings, FileText } from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'

const criticalCount = MOCK_CASES.filter(c => c.urgency === 'critical').length

export default function Layout() {
  const location = useLocation()

  const nav = [
    { to: '/war-room', icon: LayoutGrid, label: 'Case War Room', badge: `${MOCK_CASES.filter(c => c.status !== 'filed').length}` },
    { to: '/eval', icon: BarChart3, label: 'Eval Dashboard', badge: null },
  ]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f5f5f3' }}>
      <aside className="w-56 flex-shrink-0 flex flex-col border-r" style={{ background: 'white', borderColor: '#e8e8e5' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: '#e8e8e5' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#157040' }}>
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <div className="font-display font-medium text-sm" style={{ color: '#0a3d22', letterSpacing: '-0.01em' }}>AXIOM</div>
              <div className="text-xs" style={{ color: '#888', fontFamily: 'DM Mono, monospace' }}>by Glade AI</div>
            </div>
          </div>
        </div>

        {criticalCount > 0 && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg border text-xs flex items-center gap-2" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#b91c1c' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {criticalCount} critical case{criticalCount > 1 ? 's' : ''}
          </div>
        )}

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {nav.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'font-medium'
                    : 'hover:opacity-80'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? '#e6f5ed' : 'transparent',
                color: isActive ? '#0f5530' : '#444',
              })}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-mono" style={{ background: '#d6f2e0', color: '#0f5530' }}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}

          <div className="pt-3 pb-1">
            <div className="text-xs px-3 mb-1" style={{ color: '#aaa', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>ACTIVE CASES</div>
            {MOCK_CASES.filter(c => ['critical', 'high'].includes(c.urgency) && c.status !== 'filed').slice(0, 4).map(c => (
              <NavLink
                key={c.id}
                to={`/case/${c.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-all"
                style={({ isActive }) => ({
                  background: isActive ? '#f0faf4' : 'transparent',
                  color: '#555',
                })}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  c.urgency === 'critical' ? 'bg-red-500' :
                  c.urgency === 'high' ? 'bg-amber-500' : 'bg-green-500'
                }`} />
                <span className="truncate">{c.clientName}</span>
                <ChevronRight size={10} className="ml-auto flex-shrink-0 opacity-40" />
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: '#e8e8e5' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: '#f5f5f3' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: '#157040', color: 'white' }}>
              MR
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: '#222' }}>Meghana Rabba</div>
              <div className="text-xs truncate" style={{ color: '#888' }}>Forward Deployed Eng.</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
