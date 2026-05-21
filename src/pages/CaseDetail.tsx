import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Clock, AlertTriangle, CheckCircle2, FileText, Upload, Zap, ChevronRight, TrendingUp, User, Scale } from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'

function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) }

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = MOCK_CASES.find(x => x.id === id)

  if (!c) return <div className="p-8 text-sm" style={{ color: '#888' }}>Case not found.</div>

  const days = daysUntil(c.filingDeadline)

  const timeline = [
    { label: 'Intake', done: true },
    { label: 'Retain', done: ['retain','collecting','drafting','review','filed'].includes(c.status) },
    { label: 'Documents', done: ['collecting','drafting','review','filed'].includes(c.status) },
    { label: 'Draft', done: ['drafting','review','filed'].includes(c.status) },
    { label: 'Review', done: ['review','filed'].includes(c.status) },
    { label: 'Filed', done: c.status === 'filed' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/war-room')}
        className="flex items-center gap-1.5 text-sm mb-5 hover:opacity-70 transition-opacity"
        style={{ color: '#555' }}
      >
        <ArrowLeft size={14} />
        Back to War Room
      </button>

      <div className="glade-card p-5 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-display font-medium" style={{ color: '#111', letterSpacing: '-0.02em' }}>{c.clientName}</h1>
              {c.urgency === 'critical' && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  Critical
                </span>
              )}
            </div>
            <div className="text-sm font-mono" style={{ color: '#888' }}>{c.caseNumber} | Chapter {c.chapter} | {c.state}</div>
          </div>
          <button
            onClick={() => navigate(`/case/${id}/agents`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: '#157040', color: 'white' }}
          >
            <Brain size={15} />
            Run AXIOM Agents
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="flex items-center gap-1 mb-4">
          {timeline.map((t, i) => (
            <div key={t.label} className="flex items-center gap-1 flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-full h-1 rounded-full ${t.done ? '' : ''}`} style={{ background: t.done ? '#157040' : '#e8e8e5' }} />
                <span className="text-xs mt-1" style={{ color: t.done ? '#157040' : '#aaa' }}>{t.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Case Health', value: `${c.healthScore}%`, icon: TrendingUp, color: c.healthScore >= 80 ? '#22c55e' : c.healthScore >= 50 ? '#f59e0b' : '#ef4444' },
            { label: 'Filing Deadline', value: c.status === 'filed' ? 'Filed' : `${days}d`, icon: Clock, color: days <= 7 ? '#ef4444' : days <= 14 ? '#f59e0b' : '#157040' },
            { label: 'Monthly Income', value: `$${c.monthlyIncome?.toLocaleString()}`, icon: TrendingUp, color: '#0369a1' },
            { label: 'Total Debt', value: `$${((c.totalDebt || 0) / 1000).toFixed(0)}K`, icon: Scale, color: '#7c3aed' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: '#f8f8f6' }}>
              <div className="text-xs mb-1" style={{ color: '#888' }}>{label}</div>
              <div className="text-base font-display font-medium" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">
        <div className="glade-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium" style={{ color: '#111' }}>Documents</h3>
            <span className="text-xs font-mono" style={{ color: '#888' }}>{c.documents.length} uploaded</span>
          </div>

          <div className="space-y-2 mb-3">
            {c.documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: '#f8f8f6' }}>
                <FileText size={14} style={{ color: '#888', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: '#333' }}>{doc.name}</div>
                  <div className="text-xs" style={{ color: '#aaa' }}>{doc.type}</div>
                </div>
                <div className="flex items-center gap-1 text-xs" style={{
                  color: doc.status === 'verified' ? '#157040' : doc.status === 'flagged' ? '#b45309' : '#888'
                }}>
                  {doc.status === 'verified' ? <CheckCircle2 size={12} /> : doc.status === 'flagged' ? <AlertTriangle size={12} /> : null}
                  {doc.status}
                </div>
                {doc.confidence && (
                  <span className="text-xs font-mono" style={{ color: '#aaa' }}>{Math.round(doc.confidence * 100)}%</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed text-xs cursor-pointer hover:opacity-70 transition-opacity" style={{ borderColor: '#d1d5db', color: '#888' }}>
            <Upload size={13} />
            Drop documents here or click to upload
          </div>
        </div>

        <div className="glade-card p-4">
          <h3 className="text-sm font-medium mb-3" style={{ color: '#111' }}>Missing Documents</h3>
          {c.missingDocs.length === 0 ? (
            <div className="flex items-center gap-2 text-sm py-4" style={{ color: '#157040' }}>
              <CheckCircle2 size={16} />
              All documents collected
            </div>
          ) : (
            <div className="space-y-2">
              {c.missingDocs.map((doc, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: '#fff7ed' }}>
                  <AlertTriangle size={13} style={{ color: '#b45309', flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: '#92400e' }}>{doc}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#e8e8e5' }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: '#111' }}>Case Team</h3>
            {[{ role: 'Paralegal', name: c.paralegal }, { role: 'Attorney', name: c.attorney }].map(({ role, name }) => (
              <div key={role} className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: '#e6f5ed', color: '#157040' }}>
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-xs font-medium" style={{ color: '#333' }}>{name}</div>
                  <div className="text-xs" style={{ color: '#aaa' }}>{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {c.notes && (
        <div className="glade-card p-4 mb-4">
          <h3 className="text-sm font-medium mb-2" style={{ color: '#111' }}>Notes</h3>
          <p className="text-sm" style={{ color: '#555', lineHeight: '1.6' }}>{c.notes}</p>
        </div>
      )}

      <div className="glade-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium mb-0.5" style={{ color: '#111' }}>Ready to run AXIOM intelligence?</div>
            <div className="text-xs" style={{ color: '#888' }}>3 Groq agents will analyze this case in parallel. Estimated time: 8-12 seconds.</div>
          </div>
          <button
            onClick={() => navigate(`/case/${id}/agents`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: '#157040', color: 'white' }}
          >
            <Zap size={14} />
            Launch Agents
          </button>
        </div>
      </div>
    </div>
  )
}
