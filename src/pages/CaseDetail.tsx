import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Brain, Clock, AlertTriangle, CheckCircle2, FileText, Upload, Zap, TrendingUp, Scale, ChevronRight, User } from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'

function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) }

const STATUS_STEPS = ['intake', 'retain', 'collecting', 'drafting', 'review', 'filed']

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = MOCK_CASES.find(x => x.id === id)
  if (!c) return <div style={{ padding: 32, color: '#888', fontSize: 13 }}>Case not found.</div>

  const days = daysUntil(c.filingDeadline)
  const currentStep = STATUS_STEPS.indexOf(c.status)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      {/* Back */}
      <button onClick={() => navigate('/war-room')} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, color: '#666', background: 'none', border: 'none',
        cursor: 'pointer', padding: 0, marginBottom: 20, fontFamily: 'Onest, Inter, sans-serif',
      }}>
        <ArrowLeft size={14} />
        Back to War Room
      </button>

      {/* Hero card */}
      <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Onest, sans-serif', fontSize: 20, fontWeight: 500, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>
                {c.clientName}
              </h1>
              {c.urgency === 'critical' && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#fee2e2', color: '#dc2626', fontWeight: 500 }}>
                  Critical
                </span>
              )}
            </div>
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, color: '#999' }}>
              {c.caseNumber} &nbsp;|&nbsp; Chapter {c.chapter} &nbsp;|&nbsp; {c.state}
            </div>
          </div>
          <button onClick={() => navigate(`/case/${id}/agents`)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: '#5F4F86', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'Onest, Inter, sans-serif',
          }}>
            <Brain size={14} />
            Run PARALEX Agents
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Progress timeline */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 20 }}>
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentStep
            const active = i === currentStep
            return (
              <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 6, left: '50%', width: '100%', height: 2,
                    background: done && !active ? '#5F4F86' : '#eaeaea',
                    zIndex: 0,
                  }} />
                )}
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', zIndex: 1,
                  background: done ? '#5F4F86' : '#eaeaea',
                  border: active ? '2px solid #5F4F86' : 'none',
                  boxShadow: active ? '0 0 0 3px #e2daf5' : 'none',
                }} />
                <span style={{ fontSize: 10, marginTop: 6, color: done ? '#5F4F86' : '#bbb', fontWeight: done ? 500 : 400 }}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            {
              label: 'Case Health', icon: TrendingUp,
              value: `${c.healthScore}%`,
              color: c.healthScore >= 80 ? '#7c6fb5' : c.healthScore >= 50 ? '#f59e0b' : '#ef4444',
            },
            {
              label: 'Filing Deadline', icon: Clock,
              value: c.status === 'filed' ? 'Filed' : `${days}d`,
              color: days <= 7 ? '#ef4444' : days <= 14 ? '#f59e0b' : '#5F4F86',
            },
            {
              label: 'Monthly Income', icon: TrendingUp,
              value: `$${c.monthlyIncome?.toLocaleString()}`,
              color: '#0369a1',
            },
            {
              label: 'Total Debt', icon: Scale,
              value: `$${((c.totalDebt || 0) / 1000).toFixed(0)}K`,
              color: '#7c3aed',
            },
          ].map(({ label, icon: Icon, value, color }) => (
            <div key={label} style={{ padding: '12px 14px', borderRadius: 10, background: '#fafafa' }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'Onest, sans-serif', fontSize: 18, fontWeight: 500, color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Documents */}
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>Documents</span>
            <span style={{ fontSize: 11, color: '#999', fontFamily: 'Geist Mono, monospace' }}>{c.documents.length} uploaded</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {c.documents.length === 0 ? (
              <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', padding: '16px 0' }}>No documents yet</div>
            ) : c.documents.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, background: '#fafafa',
              }}>
                <FileText size={13} color="#aaa" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: '#bbb' }}>{doc.type.replace('_', ' ')}</div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                  color: doc.status === 'verified' ? '#5F4F86' : doc.status === 'flagged' ? '#b45309' : '#888',
                }}>
                  {doc.status === 'verified' ? <CheckCircle2 size={11} /> : doc.status === 'flagged' ? <AlertTriangle size={11} /> : null}
                  {doc.status}
                </div>
                {doc.confidence && (
                  <span style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: '#bbb' }}>
                    {Math.round(doc.confidence * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 8,
            border: '1px dashed #d1d5db', fontSize: 12, color: '#aaa', cursor: 'pointer',
          }}>
            <Upload size={13} />
            Drop documents here or click to upload
          </div>
        </div>

        {/* Missing + Team */}
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 12 }}>Missing Documents</div>
          {c.missingDocs.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#5F4F86', marginBottom: 16 }}>
              <CheckCircle2 size={15} />
              All documents collected
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
              {c.missingDocs.map((doc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 8, background: '#fff7ed',
                }}>
                  <AlertTriangle size={12} color="#b45309" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#92400e' }}>{doc}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid #f0f3ff', paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 10 }}>Case Team</div>
            {[{ role: 'Paralegal', name: c.paralegal }, { role: 'Attorney', name: c.attorney }].map(({ role, name }) => (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#ede8f8', color: '#5F4F86',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0,
                }}>
                  {name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#bbb' }}>{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      {c.notes && (
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 8 }}>Notes</div>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0 }}>{c.notes}</p>
        </div>
      )}

      {/* CTA */}
      <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>Ready to run PARALEX intelligence?</div>
          <div style={{ fontSize: 12, color: '#888' }}>3 Groq agents analyze this case in parallel. Avg runtime: 8-12 seconds.</div>
        </div>
        <button onClick={() => navigate(`/case/${id}/agents`)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          background: '#5F4F86', color: '#fff', border: 'none', cursor: 'pointer',
          fontFamily: 'Onest, Inter, sans-serif',
        }}>
          <Zap size={14} />
          Launch Agents
        </button>
      </div>
    </div>
  )
}
