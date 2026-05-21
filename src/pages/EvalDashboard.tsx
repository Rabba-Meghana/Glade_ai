import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { EVAL_METRICS } from '../lib/mockData'
import { TrendingUp, Zap, CheckCircle2, Clock, Brain, Target } from 'lucide-react'

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
      <div style={{ fontWeight: 500, color: '#111', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}{p.name.includes('Accuracy') || p.name.includes('%') ? '%' : ''}</div>
      ))}
    </div>
  )
}

export default function EvalDashboard() {
  const latest = EVAL_METRICS[EVAL_METRICS.length - 1]
  const prev = EVAL_METRICS[EVAL_METRICS.length - 2]
  const totalHrs = EVAL_METRICS.reduce((s, m) => s + m.timeSavedHours, 0)
  const totalCases = EVAL_METRICS.reduce((s, m) => s + m.casesProcessed, 0)
  const totalFields = EVAL_METRICS.reduce((s, m) => s + m.fieldsAutoFilled, 0)
  const totalCorrections = EVAL_METRICS.reduce((s, m) => s + m.fieldsCorreected, 0)
  const acceptance = Math.round(totalFields / (totalFields + totalCorrections) * 100)
  const roi = totalHrs * 45

  const stats = [
    { l: 'Current Accuracy', v: `${latest.accuracy}%`, sub: `+${latest.accuracy - prev.accuracy}% vs last week`, icon: Target, color: '#157040', bg: '#e6f5ed' },
    { l: 'Field Acceptance', v: `${acceptance}%`, sub: 'auto-filled and accepted', icon: CheckCircle2, color: '#0369a1', bg: '#dbeafe' },
    { l: 'Total Hours Saved', v: totalHrs, sub: 'across 8 weeks', icon: Clock, color: '#7c3aed', bg: '#ede9fe' },
    { l: 'Cases Processed', v: totalCases, sub: 'by PARALEX agents', icon: Brain, color: '#b45309', bg: '#fef3c7' },
    { l: 'Fields Auto-Filled', v: totalFields.toLocaleString(), sub: 'total across all cases', icon: Zap, color: '#157040', bg: '#e6f5ed' },
    { l: 'This Week', v: latest.casesProcessed, sub: `${latest.timeSavedHours}h saved`, icon: TrendingUp, color: '#166534', bg: '#bbf7d0' },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: '#111', letterSpacing: '-0.02em', margin: 0 }}>
          Eval Dashboard
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
          Agent accuracy, field acceptance rates, and time savings over time
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
        {stats.map(({ l, v, sub, icon: Icon, color, bg }) => (
          <div key={l} style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={14} color={color} />
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: '#111', lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#444', marginTop: 4 }}>{l}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>Agent Accuracy Over Time</span>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#e6f5ed', color: '#157040', fontFamily: 'DM Mono, monospace' }}>
              8 week trend
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={EVAL_METRICS} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#bbb' }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: '#bbb' }} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#157040" strokeWidth={2} dot={{ r: 3, fill: '#157040' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>Hours Saved Per Week</span>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#ede9fe', color: '#7c3aed', fontFamily: 'DM Mono, monospace' }}>
              vs. 4.5h manual baseline
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={EVAL_METRICS} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#bbb' }} />
              <YAxis tick={{ fontSize: 10, fill: '#bbb' }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="timeSavedHours" name="Hours Saved" fill="#157040" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>Auto-Fill vs Corrections</span>
            <span style={{ fontSize: 11, color: '#aaa' }}>Fields auto-accepted vs manually corrected</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={EVAL_METRICS} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#bbb' }} />
              <YAxis tick={{ fontSize: 10, fill: '#bbb' }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="fieldsAutoFilled" name="Auto-accepted" fill="#157040" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="fieldsCorreected" name="Corrected" fill="#fca5a5" radius={[2, 2, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#555' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#157040' }} />
              Auto-accepted
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#555' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#fca5a5' }} />
              Manually corrected
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 16 }}>Business Impact Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { l: 'Paralegal hours saved (8 weeks)', v: `${totalHrs} hours`, pct: 85, c: '#157040' },
              { l: 'At $45/hr fully loaded cost', v: `$${roi.toLocaleString()} saved`, pct: 85, c: '#0369a1' },
              { l: 'Annualized for this firm', v: `~$${Math.round(roi * 6.5 / 1000)}K/year`, pct: 90, c: '#7c3aed' },
              { l: 'Scaled to 200 Glade firms', v: `~$${Math.round(roi * 6.5 * 200 / 1000000)}M/year`, pct: 95, c: '#b45309' },
            ].map(({ l, v, pct, c }) => (
              <div key={l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                  <span style={{ color: '#666' }}>{l}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500, color: c }}>{v}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: '#f0f0ee' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: c, width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, background: '#e6f5ed' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#0f5530', marginBottom: 2 }}>Total 8-week ROI</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, color: '#157040' }}>
              ${roi.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#34a85a', marginTop: 2 }}>
              across {totalCases} cases processed by PARALEX
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
