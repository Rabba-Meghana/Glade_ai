import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, FileText, CheckCircle2, Brain, TrendingUp, Users, Zap, ArrowRight, Filter } from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'
import { Case } from '../types'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  intake:     { label: 'Intake',     color: '#6b7280', bg: '#f3f4f6' },
  retain:     { label: 'Retained',   color: '#7c3aed', bg: '#ede9fe' },
  collecting: { label: 'Collecting', color: '#b45309', bg: '#fef3c7' },
  drafting:   { label: 'Drafting',   color: '#0369a1', bg: '#e0f2fe' },
  review:     { label: 'Review',     color: '#157040', bg: '#dcfce7' },
  filed:      { label: 'Filed',      color: '#166534', bg: '#bbf7d0' },
}

const urgencyConfig: Record<string, { dot: string; label: string }> = {
  critical: { dot: 'bg-red-500',    label: 'Critical' },
  high:     { dot: 'bg-amber-500',  label: 'High' },
  normal:   { dot: 'bg-blue-400',   label: 'Normal' },
  low:      { dot: 'bg-gray-300',   label: 'Low' },
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: '#f0f0ee' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-mono" style={{ color, minWidth: 28 }}>{score}%</span>
    </div>
  )
}

function CaseCard({ c, onClick }: { c: Case; onClick: () => void }) {
  const days = daysUntil(c.filingDeadline)
  const status = statusConfig[c.status]
  const urgency = urgencyConfig[c.urgency]
  const isUrgent = c.urgency === 'critical' || (days <= 10 && c.status !== 'filed')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="glade-card p-4 cursor-pointer hover:shadow-md transition-all group"
      style={{
        borderColor: c.urgency === 'critical' ? '#fca5a5' : '#e8e8e5',
        borderLeftWidth: c.urgency === 'critical' ? 3 : 1,
        borderLeftColor: c.urgency === 'critical' ? '#ef4444' : c.urgency === 'high' ? '#f59e0b' : '#e8e8e5',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-medium text-sm" style={{ color: '#111' }}>{c.clientName}</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: '#888' }}>{c.caseNumber}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: '#f0faf4', color: '#157040' }}>
            Ch.{c.chapter}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <HealthBar score={c.healthScore} />
        <div className="flex items-center justify-between text-xs" style={{ color: '#666' }}>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
            {urgency.label}
          </div>
          <div className="flex items-center gap-1" style={{ color: days <= 7 ? '#ef4444' : days <= 14 ? '#f59e0b' : '#666' }}>
            <Clock size={11} />
            {c.status === 'filed' ? 'Filed' : days <= 0 ? 'Overdue' : `${days}d left`}
          </div>
        </div>
      </div>

      {c.missingDocs.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md mb-3" style={{ background: '#fff7ed', color: '#92400e' }}>
          <AlertTriangle size={11} />
          <span>{c.missingDocs.length} doc{c.missingDocs.length > 1 ? 's' : ''} missing</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs" style={{ color: '#aaa' }}>
          <FileText size={11} />
          <span>{c.documents.length} docs</span>
          {c.lastAgentRun && (
            <>
              <span className="mx-1">|</span>
              <Brain size={11} style={{ color: '#157040' }} />
              <span style={{ color: '#157040' }}>AI run</span>
            </>
          )}
        </div>
        <ArrowRight size={13} className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: '#157040' }} />
      </div>
    </motion.div>
  )
}

export default function WarRoom() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const cases = MOCK_CASES.filter(c => {
    if (search && !c.clientName.toLowerCase().includes(search.toLowerCase()) && !c.caseNumber.includes(search)) return false
    if (filter === 'critical') return c.urgency === 'critical'
    if (filter === 'active') return c.status !== 'filed'
    if (filter === 'needsDoc') return c.missingDocs.length > 0
    return true
  })

  const stats = {
    total: MOCK_CASES.filter(c => c.status !== 'filed').length,
    critical: MOCK_CASES.filter(c => c.urgency === 'critical').length,
    missingDocs: MOCK_CASES.filter(c => c.missingDocs.length > 0).length,
    filed: MOCK_CASES.filter(c => c.status === 'filed').length,
    avgHealth: Math.round(MOCK_CASES.reduce((s, c) => s + c.healthScore, 0) / MOCK_CASES.length),
    timeSaved: 326,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-display font-medium" style={{ color: '#111', letterSpacing: '-0.02em' }}>Case War Room</h1>
          <div className="text-xs font-mono px-2 py-1 rounded-full flex items-center gap-1.5" style={{ background: '#e6f5ed', color: '#157040' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            AXIOM agents active
          </div>
        </div>
        <p className="text-sm" style={{ color: '#666' }}>Real-time intelligence across all active bankruptcy cases</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Active Cases', value: stats.total, icon: Users, color: '#157040', bg: '#e6f5ed' },
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Missing Docs', value: stats.missingDocs, icon: FileText, color: '#b45309', bg: '#fef3c7' },
          { label: 'Avg Health', value: `${stats.avgHealth}%`, icon: TrendingUp, color: '#0369a1', bg: '#e0f2fe' },
          { label: 'Filed', value: stats.filed, icon: CheckCircle2, color: '#166534', bg: '#bbf7d0' },
          { label: 'Hrs Saved/Mo', value: stats.timeSaved, icon: Zap, color: '#7c3aed', bg: '#ede9fe' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glade-card p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <div className="text-xl font-display font-medium" style={{ color: '#111' }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#888' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search cases..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border outline-none"
          style={{ background: 'white', borderColor: '#e8e8e5', color: '#111', maxWidth: 280 }}
        />
        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: 'All' },
            { key: 'critical', label: 'Critical' },
            { key: 'active', label: 'Active' },
            { key: 'needsDoc', label: 'Missing Docs' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filter === key ? '#157040' : 'white',
                color: filter === key ? 'white' : '#555',
                border: `1px solid ${filter === key ? '#157040' : '#e8e8e5'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map(c => (
          <CaseCard
            key={c.id}
            c={c}
            onClick={() => navigate(`/case/${c.id}`)}
          />
        ))}
      </div>

      {cases.length === 0 && (
        <div className="text-center py-16 text-sm" style={{ color: '#888' }}>
          No cases match your filter.
        </div>
      )}
    </div>
  )
}
