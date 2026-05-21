import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Clock, DollarSign, Target, Zap, Brain, FileSearch, Scale, FilePen, AlertCircle,
  ArrowUpRight, Activity, Award
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, BarChart, Bar
} from 'recharts'
import { useTheme } from '../contexts/ThemeContext'

const WEEKS = ['W-7', 'W-6', 'W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'Now']

const TREND = WEEKS.map((w, i) => ({
  week: w,
  Document: 84 + i * 1.4 + Math.sin(i) * 1.2,
  Compliance: 78 + i * 1.8 + Math.cos(i) * 1.5,
  Generation: 80 + i * 1.6 + Math.sin(i * 1.4) * 1.8,
  Anomaly: 76 + i * 2.1 + Math.cos(i * 0.8) * 2.0,
}))

const ROI_DATA = WEEKS.map((w, i) => ({
  week: w,
  manual: 326,
  paralex: 11 + Math.sin(i) * 2,
  saved: 326 - (11 + Math.sin(i) * 2),
}))

const FIELDS = [
  { name: 'Income', accepted: 94, corrected: 6 },
  { name: 'Assets', accepted: 91, corrected: 9 },
  { name: 'Debts', accepted: 88, corrected: 12 },
  { name: 'Expenses', accepted: 85, corrected: 15 },
  { name: 'Exemptions', accepted: 79, corrected: 21 },
  { name: 'Schedule J', accepted: 92, corrected: 8 },
]

const RADAR = [
  { metric: 'Accuracy', Doc: 94, Comp: 89, Gen: 91, Anom: 86 },
  { metric: 'Speed', Doc: 96, Comp: 82, Gen: 88, Anom: 90 },
  { metric: 'Coverage', Doc: 88, Comp: 92, Gen: 90, Anom: 84 },
  { metric: 'Confidence', Doc: 91, Comp: 87, Gen: 89, Anom: 82 },
  { metric: 'Auto-accept', Doc: 92, Comp: 78, Gen: 86, Anom: 75 },
]

function MetricCard({ label, value, sub, icon: Icon, change, accent }: any) {
  const { c, theme } = useTheme()
  return (
    <div style={{
      background: c.bgElevated, border: `1px solid ${c.border}`,
      borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle, ${accent}22, transparent 70%)`, borderRadius: '50%' }} />
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: theme === 'dark' ? `${accent}1f` : `${accent}1f`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${accent}33`, marginBottom: 14,
      }}>
        <Icon size={16} color={accent} />
      </div>
      <div style={{ fontFamily: 'Onest, sans-serif', fontSize: 28, fontWeight: 600, color: c.text, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{ fontSize: 12, color: c.textMuted }}>{label}</div>
        {change !== undefined && (
          <div style={{
            fontSize: 11, fontWeight: 600, color: change >= 0 ? c.success : c.danger,
            fontFamily: 'Geist Mono, monospace',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <ArrowUpRight size={11} style={{ transform: change < 0 ? 'rotate(90deg)' : 'none' }} />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      {sub && <div style={{ fontSize: 10.5, color: c.textSubtle, marginTop: 2, fontFamily: 'Geist Mono, monospace' }}>{sub}</div>}
    </div>
  )
}

// Heatmap cell
function HeatCell({ value, max }: { value: number; max: number }) {
  const { c, theme } = useTheme()
  const intensity = value / max
  const bg = theme === 'dark'
    ? `rgba(167, 139, 250, ${0.08 + intensity * 0.6})`
    : `rgba(95, 79, 134, ${0.08 + intensity * 0.4})`
  return (
    <div style={{
      flex: 1, height: 32, borderRadius: 5,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 600, color: intensity > 0.5 ? '#fff' : c.text,
      fontFamily: 'Geist Mono, monospace',
      border: `1px solid ${c.border}`,
    }}>
      {value}
    </div>
  )
}

export default function EvalDashboard() {
  const { c, theme } = useTheme()
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Synthetic heatmap data: 7 days x 6 agents
  const heatmap = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const agents = ['Doc', 'Comp', 'Gen', 'Anom']
    const rows = agents.map(a => ({
      agent: a,
      values: days.map((_, i) => Math.round(60 + Math.sin(i + a.length) * 20 + Math.random() * 15)),
    }))
    const max = Math.max(...rows.flatMap(r => r.values))
    return { days, rows, max }
  }, [])

  return (
    <div style={{ padding: '24px 28px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Evaluation
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: c.text, letterSpacing: '-0.02em' }}>
            Eval Command Center
          </h1>
          <div style={{ fontSize: 13, color: c.textMuted, marginTop: 3 }}>
            Agent accuracy, time saved, and trust signals across all production runs
          </div>
        </div>

        <div style={{ display: 'flex', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 9, padding: 2 }}>
          {(['7d', '30d', '90d'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 500,
              background: range === r ? c.bgElevated : 'transparent',
              border: 'none', borderRadius: 7, cursor: 'pointer',
              color: range === r ? c.text : c.textMuted,
              boxShadow: range === r ? c.shadow : 'none',
              fontFamily: 'Geist Mono, monospace',
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <MetricCard label="Overall accuracy" value="94.2%" sub="across 12,847 runs" icon={Target} change={4} accent="#10b981" />
        <MetricCard label="Time saved / case" value="5.2 hrs" sub="vs 6.1 hrs manual" icon={Clock} change={18} accent="#3b82f6" />
        <MetricCard label="Auto-accept rate" value="87%" sub="fields not corrected" icon={Zap} change={6} accent="#a78bfa" />
        <MetricCard label="Cost saved / mo" value="$14.6K" sub="per 60-case firm" icon={DollarSign} change={23} accent="#f97316" />
      </div>

      {/* Charts row 1: trend + radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Accuracy trend */}
        <div style={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>Agent Accuracy Over Time</div>
              <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>Per-agent accuracy %, weekly aggregation</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 10.5 }}>
              {[{ name: 'Document', color: '#3b82f6' }, { name: 'Compliance', color: '#a855f7' }, { name: 'Generation', color: '#10b981' }, { name: 'Anomaly', color: '#f97316' }].map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 5, color: c.textMuted }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
                  {s.name}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={TREND} margin={{ top: 4, right: 4, bottom: 4, left: -8 }}>
              <CartesianGrid stroke={c.border} strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke={c.textSubtle} tick={{ fontSize: 10, fontFamily: 'Geist Mono, monospace' }} />
              <YAxis stroke={c.textSubtle} tick={{ fontSize: 10, fontFamily: 'Geist Mono, monospace' }} domain={[70, 100]} />
              <Tooltip contentStyle={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="Document" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="Compliance" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
              <Line type="monotone" dataKey="Generation" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
              <Line type="monotone" dataKey="Anomaly" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Agent capability radar */}
        <div style={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>Agent Capability Profile</div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>Normalized scores across 5 dimensions</div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={RADAR}>
              <PolarGrid stroke={c.border} />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: c.textMuted, fontFamily: 'Geist Mono, monospace' }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: c.textSubtle }} stroke={c.border} />
              <Radar name="Doc" dataKey="Doc" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={1.5} />
              <Radar name="Comp" dataKey="Comp" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={1.5} />
              <Radar name="Gen" dataKey="Gen" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={1.5} />
              <Radar name="Anom" dataKey="Anom" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: ROI area + heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* ROI hours saved */}
        <div style={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>Hours Saved Per Week</div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>Manual baseline vs PARALEX execution</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ROI_DATA} margin={{ top: 4, right: 4, bottom: 4, left: -8 }}>
              <defs>
                <linearGradient id="grad-saved" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={c.border} strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke={c.textSubtle} tick={{ fontSize: 10, fontFamily: 'Geist Mono, monospace' }} />
              <YAxis stroke={c.textSubtle} tick={{ fontSize: 10, fontFamily: 'Geist Mono, monospace' }} />
              <Tooltip contentStyle={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="saved" stroke="#10b981" strokeWidth={2} fill="url(#grad-saved)" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12, padding: 10, background: c.surface, borderRadius: 9 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: c.textSubtle, fontFamily: 'Geist Mono, monospace' }}>MANUAL</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>326h</div>
            </div>
            <div style={{ width: 1, background: c.border }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: c.textSubtle, fontFamily: 'Geist Mono, monospace' }}>PARALEX</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>11h</div>
            </div>
            <div style={{ width: 1, background: c.border }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: c.textSubtle, fontFamily: 'Geist Mono, monospace' }}>SAVED</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: c.success }}>96.6%</div>
            </div>
          </div>
        </div>

        {/* Accuracy heatmap by day */}
        <div style={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>Run Volume Heatmap</div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>Agent runs per day of week, last 30 days</div>
          </div>
          {/* Heatmap grid */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              <div />
              {heatmap.days.map(d => (
                <div key={d} style={{ fontSize: 9.5, color: c.textSubtle, textAlign: 'center', fontFamily: 'Geist Mono, monospace' }}>{d}</div>
              ))}
            </div>
            {heatmap.rows.map(row => (
              <div key={row.agent} style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: c.textMuted, display: 'flex', alignItems: 'center', fontFamily: 'Geist Mono, monospace' }}>{row.agent}</div>
                {row.values.map((v, i) => <HeatCell key={i} value={v} max={heatmap.max} />)}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 10.5, color: c.textMuted, fontFamily: 'Geist Mono, monospace' }}>
            <span>Low</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: `linear-gradient(to right, ${theme === 'dark' ? 'rgba(167,139,250,0.08)' : 'rgba(95,79,134,0.08)'}, ${theme === 'dark' ? 'rgba(167,139,250,0.7)' : 'rgba(95,79,134,0.5)'})` }} />
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Row 3: field-level trust + ROI calc */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* Field-level trust */}
        <div style={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>Field-Level Trust Score</div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>What paralegals accept vs correct, last 1,000 runs</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={FIELDS} margin={{ top: 4, right: 4, bottom: 4, left: -8 }}>
              <CartesianGrid stroke={c.border} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={c.textSubtle} tick={{ fontSize: 10, fontFamily: 'Geist Mono, monospace' }} />
              <YAxis stroke={c.textSubtle} tick={{ fontSize: 10, fontFamily: 'Geist Mono, monospace' }} />
              <Tooltip contentStyle={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="accepted" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="corrected" stackId="a" fill="#f87171" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: c.textMuted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Accepted
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#f87171' }} /> Corrected
            </div>
          </div>
        </div>

        {/* Impact calculator */}
        <div style={{ background: c.gradient, borderRadius: 14, padding: 1 }}>
          <div style={{ background: c.bgElevated, borderRadius: 13, padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <Award size={14} color={c.accent} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>Firm Impact at Scale</span>
              </div>
              <div style={{ fontSize: 11, color: c.textMuted }}>Projected annual savings</div>
            </div>

            {[
              { size: 'Small (3 paralegals)', cases: '60/mo', savings: '$176K', accent: '#3b82f6' },
              { size: 'Mid (6 paralegals)', cases: '140/mo', savings: '$411K', accent: '#a855f7' },
              { size: 'Large (12 paralegals)', cases: '300/mo', savings: '$880K', accent: '#10b981' },
            ].map((tier, i) => (
              <motion.div key={tier.size}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10, marginBottom: 8,
                  background: c.surface, border: `1px solid ${c.border}`,
                  position: 'relative', overflow: 'hidden',
                }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: tier.accent }} />
                <div style={{ paddingLeft: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{tier.size}</div>
                  <div style={{ fontSize: 10.5, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>{tier.cases}</div>
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, color: tier.accent, fontFamily: 'Geist Mono, monospace' }}>{tier.savings}</div>
              </motion.div>
            ))}

            <div style={{
              marginTop: 12, padding: '12px 14px',
              borderRadius: 10, background: c.surface,
              border: `1px dashed ${c.accent}`,
            }}>
              <div style={{ fontSize: 10.5, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', marginBottom: 3 }}>200 FIRMS DEPLOYED</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: c.text, letterSpacing: '-0.02em' }}>
                $88M–$176M
              </div>
              <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>annual value created</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
