import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { EVAL_METRICS } from '../lib/mockData'
import { TrendingUp, Zap, CheckCircle2, Clock, Brain, Target } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glade-card px-3 py-2 text-xs shadow-sm">
      <div className="font-medium mb-1" style={{ color: '#111' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.key} style={{ color: p.color }}>{p.name}: {p.value}{p.name.includes('Accuracy') ? '%' : ''}</div>
      ))}
    </div>
  )
}

export default function EvalDashboard() {
  const latest = EVAL_METRICS[EVAL_METRICS.length - 1]
  const prev = EVAL_METRICS[EVAL_METRICS.length - 2]
  const totalTimeSaved = EVAL_METRICS.reduce((s, m) => s + m.timeSavedHours, 0)
  const totalCases = EVAL_METRICS.reduce((s, m) => s + m.casesProcessed, 0)
  const totalAutoFilled = EVAL_METRICS.reduce((s, m) => s + m.fieldsAutoFilled, 0)

  const acceptanceRate = Math.round(
    (EVAL_METRICS.reduce((s, m) => s + m.fieldsAutoFilled, 0) /
    (EVAL_METRICS.reduce((s, m) => s + m.fieldsAutoFilled + m.fieldsCorreected, 0))) * 100
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-display font-medium mb-0.5" style={{ color: '#111', letterSpacing: '-0.02em' }}>Eval Dashboard</h1>
        <p className="text-sm" style={{ color: '#666' }}>Agent accuracy, field acceptance rates, and time savings over time</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Current Accuracy', value: `${latest.accuracy}%`, sub: `+${latest.accuracy - prev.accuracy}% vs last week`, icon: Target, color: '#157040', bg: '#e6f5ed' },
          { label: 'Field Acceptance', value: `${acceptanceRate}%`, sub: 'auto-filled & accepted', icon: CheckCircle2, color: '#0369a1', bg: '#e0f2fe' },
          { label: 'Total Hours Saved', value: totalTimeSaved, sub: 'across 8 weeks', icon: Clock, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Cases Processed', value: totalCases, sub: 'by AXIOM agents', icon: Brain, color: '#b45309', bg: '#fef3c7' },
          { label: 'Fields Auto-Filled', value: totalAutoFilled.toLocaleString(), sub: 'total across all cases', icon: Zap, color: '#157040', bg: '#e6f5ed' },
          { label: 'This Week', value: `${latest.casesProcessed}`, sub: `${latest.timeSavedHours}h saved`, icon: TrendingUp, color: '#166534', bg: '#bbf7d0' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="glade-card p-3.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: bg }}>
              <Icon size={14} style={{ color }} />
            </div>
            <div className="text-xl font-display font-medium" style={{ color: '#111' }}>{value}</div>
            <div className="text-xs mt-0.5 font-medium" style={{ color: '#444' }}>{label}</div>
            <div className="text-xs mt-0.5" style={{ color: '#aaa' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">
        <div className="glade-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#111' }}>Agent Accuracy Over Time</h3>
            <span className="text-xs font-mono px-2 py-1 rounded-full" style={{ background: '#e6f5ed', color: '#157040' }}>8 week trend</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={EVAL_METRICS} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#aaa' }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: '#aaa' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="accuracy" stroke="#157040" strokeWidth={2} dot={{ r: 3, fill: '#157040' }} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glade-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#111' }}>Hours Saved Per Week</h3>
            <span className="text-xs font-mono px-2 py-1 rounded-full" style={{ background: '#ede9fe', color: '#7c3aed' }}>vs. 4.5h manual baseline</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={EVAL_METRICS} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#aaa' }} />
              <YAxis tick={{ fontSize: 10, fill: '#aaa' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="timeSavedHours" fill="#157040" radius={[3, 3, 0, 0]} name="Hours Saved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glade-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#111' }}>Auto-Fill vs Corrections</h3>
            <span className="text-xs" style={{ color: '#888' }}>Fields auto-accepted vs manually corrected</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={EVAL_METRICS} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#aaa' }} />
              <YAxis tick={{ fontSize: 10, fill: '#aaa' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="fieldsAutoFilled" fill="#157040" radius={[2, 2, 0, 0]} name="Auto-Filled" stackId="a" />
              <Bar dataKey="fieldsCorreected" fill="#fca5a5" radius={[2, 2, 0, 0]} name="Corrected" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: '#157040' }} /><span style={{ color: '#555' }}>Auto-accepted</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-300" /><span style={{ color: '#555' }}>Manually corrected</span></div>
          </div>
        </div>

        <div className="glade-card p-5">
          <h3 className="text-sm font-medium mb-4" style={{ color: '#111' }}>Business Impact Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Paralegal hours saved (8 weeks)', value: `${totalTimeSaved} hours`, pct: 85, color: '#157040' },
              { label: 'At $45/hr fully loaded cost', value: `$${(totalTimeSaved * 45).toLocaleString()} saved`, pct: 85, color: '#0369a1' },
              { label: 'Annualized for this firm', value: `~$${Math.round(totalTimeSaved * 45 * 6.5 / 1000)}K/year`, pct: 90, color: '#7c3aed' },
              { label: 'Scaled to 200 Glade firms', value: `~$${Math.round(totalTimeSaved * 45 * 6.5 * 200 / 1000000)}M/year`, pct: 95, color: '#b45309' },
            ].map(({ label, value, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#555' }}>{label}</span>
                  <span className="font-mono font-medium" style={{ color }}>{value}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#f0f0ee' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{ background: '#e6f5ed' }}>
            <div className="text-xs font-medium mb-0.5" style={{ color: '#0f5530' }}>Total 8-week ROI</div>
            <div className="text-2xl font-display font-medium" style={{ color: '#157040' }}>
              ${(totalTimeSaved * 45).toLocaleString()}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#34a85a' }}>across {totalCases} cases processed by AXIOM</div>
          </div>
        </div>
      </div>
    </div>
  )
}
