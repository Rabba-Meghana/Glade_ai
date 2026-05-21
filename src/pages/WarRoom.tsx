import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, FileText, CheckCircle2, Brain, TrendingUp, Users, Zap, ArrowRight, Search } from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'
import { Case } from '../types'

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  intake:     { label: 'Intake',      color: '#6b7280', bg: '#f3f4f6' },
  retain:     { label: 'Retained',    color: '#7c3aed', bg: '#ede9fe' },
  collecting: { label: 'Collecting',  color: '#b45309', bg: '#fef3c7' },
  drafting:   { label: 'Drafting',    color: '#0369a1', bg: '#dbeafe' },
  review:     { label: 'Review',      color: '#5F4F86', bg: '#ede8f8' },
  filed:      { label: 'Filed',       color: '#4a3d6e', bg: '#ddd6f5' },
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eaeaea', borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
      }}>
        <Icon size={14} color={color} />
      </div>
      <div style={{ fontFamily: 'Onest, sans-serif', fontSize: 22, fontWeight: 500, color: '#111', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function CaseCard({ c, onClick }: { c: Case; onClick: () => void }) {
  const days = daysUntil(c.filingDeadline)
  const st = STATUS_CFG[c.status]
  const healthColor = c.healthScore >= 80 ? '#7c6fb5' : c.healthScore >= 50 ? '#f59e0b' : '#ef4444'
  const isCritical = c.urgency === 'critical'

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      style={{
        background: '#fff',
        border: `1px solid ${isCritical ? '#fca5a5' : '#eaeaea'}`,
        borderLeft: `3px solid ${isCritical ? '#ef4444' : c.urgency === 'high' ? '#f59e0b' : '#eaeaea'}`,
        borderRadius: 12,
        padding: '16px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)', y: -1 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14, color: '#111' }}>{c.clientName}</div>
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: '#999', marginTop: 2 }}>{c.caseNumber}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: st.bg, color: st.color }}>
            {st.label}
          </span>
          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, background: '#f5f3ff', color: '#5F4F86', fontWeight: 500 }}>
            Ch.{c.chapter}
          </span>
        </div>
      </div>

      {/* Health bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ height: 4, borderRadius: 2, background: '#f0f3ff', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: healthColor, width: `${c.healthScore}%`, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#666' }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isCritical ? '#ef4444' : c.urgency === 'high' ? '#f59e0b' : c.urgency === 'normal' ? '#60a5fa' : '#d1d5db',
            }} />
            {isCritical ? 'Critical' : c.urgency === 'high' ? 'High' : c.urgency === 'normal' ? 'Normal' : 'Low'}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
            color: c.status === 'filed' ? '#5F4F86' : days <= 7 ? '#ef4444' : days <= 14 ? '#f59e0b' : '#666',
          }}>
            <Clock size={11} />
            {c.status === 'filed' ? 'Filed' : days <= 0 ? 'Overdue' : `${days}d left`}
          </div>
        </div>
      </div>

      {/* Missing docs warning */}
      {c.missingDocs.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 6, marginBottom: 10,
          background: '#fff7ed', color: '#92400e', fontSize: 12,
        }}>
          <AlertTriangle size={11} />
          {c.missingDocs.length} doc{c.missingDocs.length > 1 ? 's' : ''} missing
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#aaa' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FileText size={11} />
            {c.documents.length} docs
          </span>
          {c.lastAgentRun && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5F4F86' }}>
              <Brain size={11} />
              AI run
            </span>
          )}
        </div>
        <ArrowRight size={13} style={{ color: '#ccc' }} />
      </div>
    </motion.div>
  )
}

export default function WarRoom() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_CASES.filter(c => {
    if (search && !c.clientName.toLowerCase().includes(search.toLowerCase()) && !c.caseNumber.includes(search)) return false
    if (filter === 'critical') return c.urgency === 'critical'
    if (filter === 'active') return c.status !== 'filed'
    if (filter === 'needsDoc') return c.missingDocs.length > 0
    return true
  })

  const stats = {
    active: MOCK_CASES.filter(c => c.status !== 'filed').length,
    critical: MOCK_CASES.filter(c => c.urgency === 'critical').length,
    missingDocs: MOCK_CASES.filter(c => c.missingDocs.length > 0).length,
    avgHealth: Math.round(MOCK_CASES.reduce((s, c) => s + c.healthScore, 0) / MOCK_CASES.length),
    filed: MOCK_CASES.filter(c => c.status === 'filed').length,
    hrsSaved: 326,
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Onest, sans-serif', fontSize: 22, fontWeight: 500, color: '#111', letterSpacing: '-0.02em', margin: 0 }}>
            Case War Room
          </h1>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
            Real-time intelligence across all active bankruptcy cases
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: '#5F4F86',
          background: '#ede8f8', padding: '5px 12px', borderRadius: 20,
          fontFamily: 'Geist Mono, monospace',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c6fb5', animation: 'pulse 2s infinite' }} />
          PARALEX agents active
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Active Cases"   value={stats.active}      icon={Users}        color="#5F4F86" bg="#ede8f8" />
        <StatCard label="Critical"       value={stats.critical}    icon={AlertTriangle} color="#dc2626" bg="#fee2e2" />
        <StatCard label="Missing Docs"   value={stats.missingDocs} icon={FileText}      color="#b45309" bg="#fef3c7" />
        <StatCard label="Avg Health"     value={`${stats.avgHealth}%`} icon={TrendingUp} color="#0369a1" bg="#dbeafe" />
        <StatCard label="Filed"          value={stats.filed}       icon={CheckCircle2}  color="#4a3d6e" bg="#ddd6f5" />
        <StatCard label="Hrs Saved/Mo"   value={stats.hrsSaved}    icon={Zap}           color="#7c3aed" bg="#ede9fe" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 260, flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search cases..."
            style={{
              width: '100%', padding: '8px 12px 8px 32px',
              border: '1px solid #eaeaea', borderRadius: 8,
              fontSize: 13, color: '#111', background: '#fff', outline: 'none',
              fontFamily: 'Onest, Inter, sans-serif',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { k: 'all', l: 'All' },
            { k: 'critical', l: 'Critical' },
            { k: 'active', l: 'Active' },
            { k: 'needsDoc', l: 'Missing Docs' },
          ].map(({ k, l }) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Onest, Inter, sans-serif',
              background: filter === k ? '#5F4F86' : '#fff',
              color: filter === k ? '#fff' : '#555',
              border: `1px solid ${filter === k ? '#5F4F86' : '#eaeaea'}`,
            }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Case grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {filtered.map(c => (
          <CaseCard key={c.id} c={c} onClick={() => navigate(`/case/${c.id}`)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', fontSize: 13, color: '#aaa' }}>
          No cases match your filter.
        </div>
      )}
    </div>
  )
}
