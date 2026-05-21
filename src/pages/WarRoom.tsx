import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Clock, FileText, CheckCircle2, Activity, TrendingUp, Users,
  Zap, ArrowUpRight, Filter, Plus, Brain, FileSearch, Scale, FilePen, Sparkles,
  Calendar, DollarSign, AlertCircle
} from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'
import { Case } from '../types'
import { useTheme } from '../contexts/ThemeContext'

const STATUS_PALETTE: Record<string, { label: string; color: string; dark: string }> = {
  intake:     { label: 'Intake',      color: '#06b6d4', dark: '#0e7490' },
  retain:     { label: 'Retained',    color: '#f97316', dark: '#9a3412' },
  collecting: { label: 'Collecting',  color: '#3b82f6', dark: '#1e40af' },
  drafting:   { label: 'Drafting',    color: '#eab308', dark: '#854d0e' },
  review:     { label: 'Review',      color: '#a855f7', dark: '#6b21a8' },
  filed:      { label: 'Filed',       color: '#10b981', dark: '#065f46' },
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

// Animated health ring
function HealthRing({ value, size = 38 }: { value: number; size?: number }) {
  const { c } = useTheme()
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  const color = value >= 75 ? c.success : value >= 50 ? c.warning : c.danger

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c.border} strokeWidth={3} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10.5, fontWeight: 700, color, fontFamily: 'Geist Mono, monospace',
      }}>
        {value}
      </div>
    </div>
  )
}

// Sparkline
function Sparkline({ data, color, width = 60, height = 22 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ')
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <polyline points={`0,${height} ${pts} ${width},${height}`} fill={`url(#sg-${color})`} />
    </svg>
  )
}

// Deadline pressure bar
function DeadlineBar({ days }: { days: number }) {
  const { c } = useTheme()
  const max = 30
  const pct = Math.max(0, Math.min(100, ((max - days) / max) * 100))
  const color = days <= 3 ? c.danger : days <= 10 ? c.warning : c.success
  return (
    <div style={{ width: 60, height: 4, background: c.border, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
        style={{ height: '100%', background: color, borderRadius: 2 }}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const { theme } = useTheme()
  const s = STATUS_PALETTE[status]
  if (!s) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px', borderRadius: 20,
      background: theme === 'dark' ? `${s.color}1a` : `${s.color}1f`,
      color: theme === 'dark' ? s.color : s.dark,
      fontSize: 10.5, fontWeight: 600,
      border: `1px solid ${theme === 'dark' ? s.color + '33' : s.color + '40'}`,
      fontFamily: 'Geist Mono, monospace', letterSpacing: '0.02em',
    }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  )
}

// Top stat card with animated number
function StatCard({ label, value, change, icon: Icon, accent, spark }: any) {
  const { c, theme } = useTheme()
  return (
    <div style={{
      background: c.bgElevated, border: `1px solid ${c.border}`,
      borderRadius: 14, padding: '16px 18px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent, opacity: 0.6 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: theme === 'dark' ? `${accent}1a` : `${accent}1f`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${accent}33`,
        }}>
          <Icon size={15} color={accent} />
        </div>
        {spark && <Sparkline data={spark} color={accent} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontFamily: 'Onest, sans-serif', fontSize: 26, fontWeight: 600, color: c.text, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
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
      <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 4 }}>{label}</div>
    </div>
  )
}

// Agent activity stream item
function ActivityItem({ icon: Icon, color, text, time }: any) {
  const { c } = useTheme()
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 0', borderBottom: `1px solid ${c.border}`,
      }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
        background: `${color}1f`, border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={12} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: c.text, lineHeight: 1.4 }}>{text}</div>
        <div style={{ fontSize: 10.5, color: c.textSubtle, marginTop: 2, fontFamily: 'Geist Mono, monospace' }}>{time}</div>
      </div>
    </motion.div>
  )
}

// Pipeline column for kanban
function PipelineColumn({ status, cases, onCaseClick }: { status: string; cases: Case[]; onCaseClick: (id: string) => void }) {
  const { c, theme } = useTheme()
  const s = STATUS_PALETTE[status]
  return (
    <div style={{
      flex: 1, minWidth: 200,
      background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#fafafb',
      borderRadius: 12, padding: 10, border: `1px solid ${c.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text, letterSpacing: '0.02em' }}>{s.label}</span>
        </div>
        <span style={{ fontSize: 11, color: c.textMuted, fontFamily: 'Geist Mono, monospace' }}>{cases.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cases.map(cs => {
          const days = daysUntil(cs.filingDeadline)
          return (
            <motion.div
              key={cs.id} whileHover={{ y: -2 }}
              onClick={() => onCaseClick(cs.id)}
              style={{
                background: c.bgElevated, border: `1px solid ${c.border}`,
                borderRadius: 9, padding: '10px 11px', cursor: 'pointer',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: c.text }}>{cs.clientName}</div>
                <HealthRing value={cs.healthScore} size={26} />
              </div>
              <div style={{ fontSize: 10.5, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', marginBottom: 6 }}>
                {cs.caseNumber} • Ch{cs.chapter}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <DeadlineBar days={days} />
                <span style={{
                  fontSize: 10.5, fontWeight: 600,
                  color: days <= 3 ? c.danger : days <= 10 ? c.warning : c.textMuted,
                  fontFamily: 'Geist Mono, monospace',
                }}>{days}d</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function WarRoom() {
  const nav = useNavigate()
  const { c, theme } = useTheme()
  const [view, setView] = useState<'table' | 'pipeline'>('table')
  const [filter, setFilter] = useState<'all' | 'critical' | 'today'>('all')
  const [activityIdx, setActivityIdx] = useState(0)

  const cases = useMemo(() => {
    if (filter === 'critical') return MOCK_CASES.filter(c => c.urgency === 'critical')
    if (filter === 'today') return MOCK_CASES.filter(c => daysUntil(c.filingDeadline) <= 7)
    return MOCK_CASES
  }, [filter])

  const stats = useMemo(() => ({
    active: MOCK_CASES.filter(c => c.status !== 'filed').length,
    critical: MOCK_CASES.filter(c => c.urgency === 'critical').length,
    avgHealth: Math.round(MOCK_CASES.reduce((s, c) => s + c.healthScore, 0) / MOCK_CASES.length),
    upcoming: MOCK_CASES.filter(c => { const d = daysUntil(c.filingDeadline); return d > 0 && d <= 7 }).length,
  }), [])

  // Synthetic activity feed
  const activities = [
    { icon: FileSearch, color: '#3b82f6', text: 'Document Agent extracted 14 fields from paystub_april_2026.pdf for Rosa Martinez', time: '2s ago' },
    { icon: Scale, color: '#a855f7', text: 'Compliance Agent flagged income $4,200/mo - below IL Ch7 threshold ($4,883)', time: '7s ago' },
    { icon: FilePen, color: '#10b981', text: 'Generation Agent assembled Schedule J for James Kowalski (12 fields populated)', time: '14s ago' },
    { icon: AlertCircle, color: '#f97316', text: 'Anomaly Agent: Bank deposit inconsistency in Priya Nair case requires review', time: '22s ago' },
    { icon: Brain, color: '#a78bfa', text: 'Orchestrator: Means test calculation complete for 3 cases (12.4s avg)', time: '34s ago' },
    { icon: CheckCircle2, color: '#10b981', text: 'Petition draft finalized for Diego Reyes (Ch13) - ready for attorney review', time: '48s ago' },
  ]

  useEffect(() => {
    const t = setInterval(() => setActivityIdx(i => (i + 1) % activities.length), 3000)
    return () => clearInterval(t)
  }, [])

  const statusGroups = useMemo(() => {
    const groups: Record<string, Case[]> = {}
    for (const status of ['intake', 'retain', 'collecting', 'drafting', 'review', 'filed']) {
      groups[status] = cases.filter(c => c.status === status)
    }
    return groups
  }, [cases])

  return (
    <div style={{ padding: '24px 28px', minHeight: '100%' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Operations
            </span>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: c.textSubtle }} />
            <span style={{ fontSize: 11, color: c.success, fontFamily: 'Geist Mono, monospace' }}>
              4 agents online
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: c.text, letterSpacing: '-0.02em' }}>
            War Room
          </h1>
          <div style={{ fontSize: 13, color: c.textMuted, marginTop: 3 }}>
            Live case intelligence across {MOCK_CASES.length} active matters
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 9, padding: 2 }}>
            {(['table', 'pipeline'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 500,
                background: view === v ? c.bgElevated : 'transparent',
                border: 'none', borderRadius: 7, cursor: 'pointer',
                color: view === v ? c.text : c.textMuted,
                boxShadow: view === v ? c.shadow : 'none',
                textTransform: 'capitalize',
              }}>{v}</button>
            ))}
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', fontSize: 12, fontWeight: 600,
            background: c.gradient, color: '#fff',
            border: 'none', borderRadius: 9, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(167, 139, 250, 0.3)',
          }}>
            <Plus size={13} /> New Case
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Active cases" value={stats.active} change={12} icon={Activity} accent="#3b82f6" spark={[12, 14, 13, 16, 15, 18, 17, 19]} />
        <StatCard label="Critical urgency" value={stats.critical} change={-8} icon={AlertTriangle} accent="#f87171" spark={[5, 4, 6, 5, 3, 4, 3, 2]} />
        <StatCard label="Avg health score" value={`${stats.avgHealth}`} change={5} icon={TrendingUp} accent="#10b981" spark={[62, 65, 64, 68, 70, 71, 72, stats.avgHealth]} />
        <StatCard label="Filing this week" value={stats.upcoming} change={2} icon={Clock} accent="#a78bfa" spark={[2, 3, 4, 3, 5, 4, 6, stats.upcoming]} />
      </div>

      {/* Main grid: cases table + activity feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Cases area */}
        <div style={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 18px', borderBottom: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>All Cases</span>
              <span style={{ fontSize: 11, color: c.textSubtle, fontFamily: 'Geist Mono, monospace' }}>
                {cases.length} of {MOCK_CASES.length}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', 'critical', 'today'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '4px 10px', fontSize: 11, fontWeight: 500,
                  background: filter === f ? c.accentSoft : 'transparent',
                  color: filter === f ? c.accentText : c.textMuted,
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  textTransform: 'capitalize',
                }}>{f}</button>
              ))}
            </div>
          </div>

          {view === 'table' ? (
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 80px 70px 90px 50px',
                padding: '10px 18px', borderBottom: `1px solid ${c.border}`,
                fontSize: 10.5, fontWeight: 600, color: c.textSubtle,
                fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                <div>Client</div>
                <div>Status</div>
                <div>Means Test</div>
                <div>Health</div>
                <div>Trend</div>
                <div>Deadline</div>
                <div></div>
              </div>
              <AnimatePresence>
                {cases.map((cs, i) => {
                  const days = daysUntil(cs.filingDeadline)
                  // Synthetic per-case trend
                  const trend = Array.from({ length: 8 }, (_, j) => cs.healthScore - 10 + (j * 2) + Math.sin(i + j) * 5)
                  return (
                    <motion.div key={cs.id}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      onClick={() => nav(`/case/${cs.id}`)}
                      whileHover={{ background: c.surfaceHover }}
                      style={{
                        display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 80px 70px 90px 50px',
                        alignItems: 'center', padding: '12px 18px',
                        borderBottom: `1px solid ${c.border}`, cursor: 'pointer',
                      }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {cs.urgency === 'critical' && (
                            <div style={{ position: 'relative', width: 6, height: 6 }}>
                              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: c.danger }} />
                              <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: c.danger, opacity: 0.3, animation: 'ping 2s infinite' }} />
                            </div>
                          )}
                          <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{cs.clientName}</span>
                        </div>
                        <div style={{ fontSize: 10.5, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', marginTop: 2 }}>
                          {cs.caseNumber} • Ch{cs.chapter} • {cs.state}
                        </div>
                      </div>
                      <div><StatusBadge status={cs.status} /></div>
                      <div>
                        {cs.meansTestResult === 'pass' && <span style={{ fontSize: 11.5, color: c.success, fontWeight: 600 }}>● Pass</span>}
                        {cs.meansTestResult === 'fail' && <span style={{ fontSize: 11.5, color: c.danger, fontWeight: 600 }}>● Fail</span>}
                        {cs.meansTestResult === 'pending' && <span style={{ fontSize: 11.5, color: c.warning, fontWeight: 600 }}>● Pending</span>}
                      </div>
                      <div><HealthRing value={cs.healthScore} /></div>
                      <div>
                        <Sparkline data={trend} color={cs.healthScore >= 70 ? c.success : cs.healthScore >= 50 ? c.warning : c.danger} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: days <= 3 ? c.danger : days <= 10 ? c.warning : c.text, fontFamily: 'Geist Mono, monospace' }}>
                          {days}d
                        </div>
                        <DeadlineBar days={days} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={(e) => { e.stopPropagation(); nav(`/case/${cs.id}/agents`) }} style={{
                          padding: '5px 8px', borderRadius: 6,
                          background: c.accentSoft, color: c.accentText,
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 10.5, fontWeight: 600,
                        }}>
                          <Sparkles size={10} /> Run
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, padding: 14, overflowX: 'auto' }}>
              {Object.entries(statusGroups).map(([status, group]) => (
                <PipelineColumn key={status} status={status} cases={group} onCaseClick={(id) => nav(`/case/${id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* Right side: Agent activity feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Live agent constellation */}
          <div style={{
            background: c.bgElevated, border: `1px solid ${c.border}`,
            borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Brain size={14} color={c.accent} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: c.text }}>Agent Mesh</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: c.success, fontFamily: 'Geist Mono, monospace' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.success, animation: 'pulse-dot 2s infinite' }} />
                ACTIVE
              </div>
            </div>

            {/* SVG agent constellation */}
            <div style={{ position: 'relative', height: 140, marginBottom: 12 }}>
              <svg width="100%" height="100%" viewBox="0 0 260 140" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <linearGradient id="line-grad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor={c.accent} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={c.accent} stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {/* Connection lines */}
                <line x1="130" y1="70" x2="50" y2="35" stroke="url(#line-grad)" strokeWidth="1" />
                <line x1="130" y1="70" x2="50" y2="105" stroke="url(#line-grad)" strokeWidth="1" />
                <line x1="130" y1="70" x2="210" y2="35" stroke="url(#line-grad)" strokeWidth="1" />
                <line x1="130" y1="70" x2="210" y2="105" stroke="url(#line-grad)" strokeWidth="1" />
                {/* Pulse dots along lines */}
                {[
                  { from: [130, 70], to: [50, 35] }, { from: [130, 70], to: [50, 105] },
                  { from: [130, 70], to: [210, 35] }, { from: [130, 70], to: [210, 105] },
                ].map((p, i) => (
                  <motion.circle key={i} r="2" fill={c.accent}
                    initial={{ cx: p.from[0], cy: p.from[1] }}
                    animate={{ cx: p.to[0], cy: p.to[1] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, delay: i * 0.3 }} />
                ))}
              </svg>

              {/* Agent nodes */}
              {[
                { x: 50, y: 35, label: 'Doc', color: '#3b82f6', icon: FileSearch },
                { x: 50, y: 105, label: 'Compl.', color: '#a855f7', icon: Scale },
                { x: 130, y: 70, label: 'Orch.', color: '#a78bfa', icon: Brain, big: true },
                { x: 210, y: 35, label: 'Gen', color: '#10b981', icon: FilePen },
                { x: 210, y: 105, label: 'Anom.', color: '#f97316', icon: AlertCircle },
              ].map((n, i) => {
                const Icon = n.icon
                const s = n.big ? 36 : 26
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    left: `${(n.x / 260) * 100}%`, top: `${(n.y / 140) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}>
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      style={{
                        width: s, height: s, borderRadius: '50%',
                        background: `radial-gradient(circle, ${n.color}, ${n.color}aa)`,
                        boxShadow: `0 0 16px ${n.color}66`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1.5px solid ${n.color}`,
                      }}>
                      <Icon size={n.big ? 16 : 12} color="#fff" />
                    </motion.div>
                    <div style={{
                      position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                      marginTop: 4, fontSize: 9.5, color: c.textMuted, whiteSpace: 'nowrap',
                      fontFamily: 'Geist Mono, monospace',
                    }}>{n.label}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
              <div style={{ padding: 8, borderRadius: 7, background: c.surface, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 10, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', marginBottom: 2 }}>RUNS/HR</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>247</div>
              </div>
              <div style={{ padding: 8, borderRadius: 7, background: c.surface, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 10, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', marginBottom: 2 }}>AVG LATENCY</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>3.4s</div>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div style={{
            background: c.bgElevated, border: `1px solid ${c.border}`,
            borderRadius: 14, padding: 16, flex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Activity size={14} color={c.info} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: c.text }}>Live Activity</span>
              </div>
              <span style={{ fontSize: 10, color: c.textSubtle, fontFamily: 'Geist Mono, monospace' }}>STREAM</span>
            </div>
            <div>
              {activities.map((a, i) => (
                <ActivityItem key={i} {...a} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
