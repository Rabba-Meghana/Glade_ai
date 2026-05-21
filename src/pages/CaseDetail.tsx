import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Brain, Clock, AlertTriangle, CheckCircle2, FileText, Upload, Sparkles,
  TrendingUp, Scale, ChevronRight, User, DollarSign, FileSearch, Activity
} from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'
import { useTheme } from '../contexts/ThemeContext'
import { useViewport } from '../hooks/useViewport'

function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) }

const STATUS_STEPS = ['intake', 'retain', 'collecting', 'drafting', 'review', 'filed']
const STEP_LABELS: Record<string, string> = {
  intake: 'Intake', retain: 'Retained', collecting: 'Collecting',
  drafting: 'Drafting', review: 'Review', filed: 'Filed',
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { c: t, theme } = useTheme()
  const { isMobile } = useViewport()
  const cs = MOCK_CASES.find(x => x.id === id)
  if (!cs) return <div style={{ padding: 32, color: t.textSubtle, fontSize: 13 }}>Case not found.</div>

  const days = daysUntil(cs.filingDeadline)
  const currentStep = STATUS_STEPS.indexOf(cs.status)
  const healthColor = cs.healthScore >= 75 ? t.success : cs.healthScore >= 50 ? t.warning : t.danger

  return (
    <div style={{ padding: isMobile ? '16px 14px' : '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
      <button onClick={() => navigate('/war-room')} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12.5, color: t.textMuted, background: 'none', border: 'none',
        cursor: 'pointer', padding: 0, marginBottom: 18,
      }}>
        <ArrowLeft size={13} /> Back to War Room
      </button>

      {/* Hero */}
      <div style={{
        background: t.bgElevated, border: `1px solid ${t.border}`,
        borderRadius: 14, padding: 22, marginBottom: 14, position: 'relative', overflow: 'hidden',
      }}>
        {cs.urgency === 'critical' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: t.danger }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
                {cs.clientName}
              </h1>
              {cs.urgency === 'critical' && (
                <span style={{
                  fontSize: 10.5, padding: '3px 9px', borderRadius: 20,
                  background: theme === 'dark' ? 'rgba(248,113,113,0.12)' : '#fee2e2',
                  color: t.danger, fontWeight: 600,
                  border: `1px solid ${theme === 'dark' ? 'rgba(248,113,113,0.3)' : '#fecaca'}`,
                }}>
                  CRITICAL
                </span>
              )}
            </div>
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, color: t.textMuted }}>
              {cs.caseNumber} · Chapter {cs.chapter} · {cs.state}
            </div>
          </div>
          <button onClick={() => navigate(`/case/${id}/agents`)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: t.gradient, color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(167, 139, 250, 0.35)',
          }}>
            <Sparkles size={14} /> Launch Agents <ChevronRight size={13} />
          </button>
        </div>

        {/* Progress timeline */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
            {STATUS_STEPS.map((step, i) => {
              const isComplete = i < currentStep
              const isCurrent = i === currentStep
              return (
                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {i > 0 && (
                    <div style={{
                      position: 'absolute', top: 11, left: '-50%', right: '50%', height: 2,
                      background: isComplete || isCurrent ? t.gradient : t.border,
                    }} />
                  )}
                  <motion.div
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', zIndex: 1,
                      background: isComplete ? t.success : isCurrent ? t.accent : t.surface,
                      border: `2px solid ${isComplete ? t.success : isCurrent ? t.accent : t.borderStrong}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isCurrent ? `0 0 0 4px ${t.accent}33` : 'none',
                    }}>
                    {isComplete && <CheckCircle2 size={11} color="#fff" />}
                    {isCurrent && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </motion.div>
                  <div style={{ fontSize: 10.5, color: isCurrent ? t.text : t.textMuted, marginTop: 6, fontWeight: isCurrent ? 600 : 500, fontFamily: 'Geist Mono, monospace' }}>
                    {STEP_LABELS[step]}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { icon: Activity, label: 'Health', value: cs.healthScore, color: healthColor, suffix: '/100' },
          { icon: Clock, label: 'Days to deadline', value: days, color: days <= 3 ? t.danger : days <= 10 ? t.warning : t.text, suffix: 'd' },
          { icon: DollarSign, label: 'Monthly income', value: `$${cs.monthlyIncome.toLocaleString()}`, color: t.text },
          { icon: Scale, label: 'Means test', value: cs.meansTestResult.toUpperCase(), color: cs.meansTestResult === 'pass' ? t.success : cs.meansTestResult === 'fail' ? t.danger : t.warning, mono: true },
        ].map((m, i) => (
          <div key={i} style={{
            background: t.bgElevated, border: `1px solid ${t.border}`,
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <m.icon size={13} color={t.textMuted} />
              <span style={{ fontSize: 10.5, color: t.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: m.color, fontFamily: m.mono ? 'Geist Mono, monospace' : 'Onest, sans-serif', letterSpacing: '-0.02em' }}>
              {m.value}{m.suffix && <span style={{ fontSize: 13, color: t.textSubtle, marginLeft: 2 }}>{m.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main: documents + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 14 }}>
        {/* Documents */}
        <div style={{ background: t.bgElevated, border: `1px solid ${t.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <FileSearch size={14} color={t.textMuted} />
              <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Documents</span>
              <span style={{ fontSize: 11, color: t.textSubtle, fontFamily: 'Geist Mono, monospace' }}>{cs.documents.length}</span>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 11px', borderRadius: 7,
              background: t.surface, border: `1px solid ${t.border}`, color: t.textMuted,
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
            }}>
              <Upload size={11} /> Upload
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cs.documents.map((d, i) => (
              <motion.div key={d.id}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{
                  padding: 12, borderRadius: 10,
                  background: t.surface, border: `1px solid ${t.border}`,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: theme === 'dark' ? 'rgba(96,165,250,0.12)' : '#dbeafe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <FileText size={13} color={t.info} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                      <div style={{ fontSize: 10.5, color: t.textSubtle, fontFamily: 'Geist Mono, monospace', marginTop: 1, textTransform: 'capitalize' }}>
                        {d.type.replace('_', ' ')} · {d.uploadedAt}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: t.textMuted, fontFamily: 'Geist Mono, monospace' }}>
                      {Math.round((d.confidence || 0) * 100)}%
                    </span>
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600,
                      background: d.status === 'verified' ? (theme === 'dark' ? 'rgba(52,211,153,0.12)' : '#d1fae5') :
                                  d.status === 'flagged' ? (theme === 'dark' ? 'rgba(251,191,36,0.12)' : '#fef3c7') :
                                  theme === 'dark' ? 'rgba(96,165,250,0.12)' : '#dbeafe',
                      color: d.status === 'verified' ? t.success : d.status === 'flagged' ? t.warning : t.info,
                      fontFamily: 'Geist Mono, monospace',
                    }}>
                      {d.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {d.extractedFields && Object.keys(d.extractedFields).length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}`, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(d.extractedFields).map(([k, v]: [string, any]) => (
                      <div key={k} style={{
                        fontSize: 10.5, padding: '3px 8px', borderRadius: 5,
                        background: v.flagged ? (theme === 'dark' ? 'rgba(248,113,113,0.1)' : '#fef2f2') : t.bgElevated,
                        border: `1px solid ${v.flagged ? (theme === 'dark' ? 'rgba(248,113,113,0.3)' : '#fecaca') : t.border}`,
                        color: v.flagged ? t.danger : t.textMuted,
                        fontFamily: 'Geist Mono, monospace',
                      }}>
                        <span style={{ color: t.textSubtle }}>{k}:</span> <span style={{ color: v.flagged ? t.danger : t.text, fontWeight: 600 }}>{typeof v.value === 'number' ? v.value.toLocaleString() : v.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Missing docs */}
          {cs.missingDocs.length > 0 && (
            <div style={{
              background: t.bgElevated,
              border: `1px solid ${theme === 'dark' ? 'rgba(248,113,113,0.25)' : '#fecaca'}`,
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <AlertTriangle size={13} color={t.danger} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: t.danger }}>Missing Documents</span>
                <span style={{ fontSize: 11, color: t.danger, fontFamily: 'Geist Mono, monospace' }}>{cs.missingDocs.length}</span>
              </div>
              {cs.missingDocs.map(d => (
                <div key={d} style={{ fontSize: 12, color: t.text, padding: '5px 0', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: t.danger }} />
                  {d}
                </div>
              ))}
            </div>
          )}

          {/* People */}
          <div style={{ background: t.bgElevated, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10.5, color: t.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>
              Case Team
            </div>
            {[
              { label: 'Paralegal', name: cs.paralegal },
              { label: 'Attorney', name: cs.attorney },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === 0 ? t.gradient : t.accent,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600,
                }}>
                  {p.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: t.text }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: t.textSubtle, fontFamily: 'Geist Mono, monospace' }}>{p.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div style={{ background: t.bgElevated, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10.5, color: t.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>
              Notes
            </div>
            <div style={{ fontSize: 12, color: t.text, lineHeight: 1.55 }}>{cs.notes}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
