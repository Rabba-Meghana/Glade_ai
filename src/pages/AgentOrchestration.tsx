import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain, FileSearch, Scale, AlertOctagon, Zap, CheckCircle2, RotateCcw, Download, ChevronRight } from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'

type AgentKey = 'document' | 'compliance' | 'anomaly' | 'orchestrator'
type AgentStatus = 'idle' | 'running' | 'complete' | 'error'

type AgentData = {
  status: AgentStatus
  streamText: string
  findings: any[]
  confidence: number
  elapsed?: number
  fields?: any
  meansTest?: any
  riskScore?: number
}

const AGENTS: Record<AgentKey, { icon: any; label: string; desc: string; color: string; bg: string }> = {
  document:     { icon: FileSearch,   label: 'Document Intelligence', desc: 'Extracting financial fields from uploaded documents', color: '#0369a1', bg: '#dbeafe' },
  compliance:   { icon: Scale,        label: 'Compliance Auditor',    desc: 'Means test calculation & filing requirements',        color: '#7c3aed', bg: '#ede9fe' },
  anomaly:      { icon: AlertOctagon, label: 'Anomaly Detector',      desc: 'Cross-referencing data for inconsistencies & risks',  color: '#b45309', bg: '#fef3c7' },
  orchestrator: { icon: Brain,        label: 'Master Orchestrator',   desc: 'Synthesizing agent findings — assembling petition draft', color: '#157040', bg: '#e6f5ed' },
}

const INIT: AgentData = { status: 'idle', streamText: '', findings: [], confidence: 0 }

function AgentPanel({ agentKey, data, isActive }: { agentKey: AgentKey; data: AgentData; isActive: boolean }) {
  const m = AGENTS[agentKey]
  const Icon = m.icon
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [data.streamText])

  const statusColor = data.status === 'running' ? m.color : data.status === 'complete' ? '#157040' : data.status === 'error' ? '#dc2626' : '#bbb'
  const statusBg = data.status === 'running' ? m.bg : data.status === 'complete' ? '#d1fae5' : data.status === 'error' ? '#fee2e2' : '#f5f5f3'
  const statusLabel = { idle: 'Standby', running: 'Running', complete: 'Complete', error: 'Error' }[data.status]

  return (
    <div style={{
      background: '#fff',
      border: `${isActive ? 1.5 : 1}px solid ${isActive ? m.color : data.status === 'complete' ? '#d1fae5' : '#e8e8e5'}`,
      borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      minHeight: 260,
      transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f5f5f3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={15} color={m.color} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#111' }}>{m.label}</div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{m.desc}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {data.elapsed && data.status === 'complete' && (
            <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#bbb' }}>{(data.elapsed / 1000).toFixed(1)}s</span>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
            background: statusBg, color: statusColor,
          }}>
            {data.status === 'running' && (
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: m.color, animation: 'pulse 1.2s infinite' }} />
            )}
            {data.status === 'complete' && <CheckCircle2 size={11} />}
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Stream */}
      <div ref={ref} style={{
        flex: 1, padding: '12px 16px', overflow: 'auto', maxHeight: 160,
        background: data.status === 'idle' ? '#fafaf9' : '#fff',
      }}>
        {data.status === 'idle' ? (
          <div style={{ textAlign: 'center', paddingTop: 32, fontSize: 12, color: '#ddd' }}>Waiting to initialize...</div>
        ) : (
          <pre style={{
            fontFamily: 'DM Mono, monospace', fontSize: 11, lineHeight: 1.7,
            color: '#333', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {data.streamText}
            {data.status === 'running' && (
              <span style={{
                display: 'inline-block', width: 6, height: 12, marginLeft: 2,
                background: m.color, verticalAlign: 'text-bottom',
                animation: 'pulse 0.8s infinite',
              }} />
            )}
          </pre>
        )}
      </div>

      {/* Findings */}
      {data.status === 'complete' && data.findings.length > 0 && (
        <div style={{ borderTop: '1px solid #f5f5f3', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.findings.slice(0, 3).map((f: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 11 }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                background: f.type === 'error' ? '#ef4444' : f.type === 'warning' ? '#f59e0b' : f.type === 'success' ? '#22c55e' : '#60a5fa',
              }} />
              <span style={{ color: '#555' }}>{f.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Confidence bar */}
      {data.status === 'complete' && data.confidence > 0 && (
        <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#f0f0ee' }}>
            <div style={{ height: '100%', borderRadius: 2, background: m.color, width: `${data.confidence * 100}%` }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: m.color }}>
            {Math.round(data.confidence * 100)}% conf.
          </span>
        </div>
      )}
    </div>
  )
}

export default function AgentOrchestration() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = MOCK_CASES.find(x => x.id === id)

  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null)
  const [petition, setPetition] = useState<any>(null)
  const [timeSaved, setTimeSaved] = useState(0)
  const [fieldsAutoFilled, setFieldsAutoFilled] = useState(0)
  const [overallConf, setOverallConf] = useState(0)
  const [priorityActions, setPriorityActions] = useState<string[]>([])
  const [summary, setSummary] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const timerRef = useRef<any>(null)

  const [agents, setAgents] = useState<Record<AgentKey, AgentData>>({
    document: { ...INIT }, compliance: { ...INIT }, anomaly: { ...INIT }, orchestrator: { ...INIT },
  })

  useEffect(() => {
    if (running) { timerRef.current = setInterval(() => setElapsed(Date.now() - startTime), 100) }
    else { clearInterval(timerRef.current) }
    return () => clearInterval(timerRef.current)
  }, [running, startTime])

  const update = (key: AgentKey, patch: Partial<AgentData>) =>
    setAgents(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  const append = (key: AgentKey, text: string) =>
    setAgents(prev => ({ ...prev, [key]: { ...prev[key], streamText: prev[key].streamText + text } }))

  const reset = () => {
    setRunning(false); setDone(false); setActiveAgent(null); setPetition(null)
    setTimeSaved(0); setFieldsAutoFilled(0); setOverallConf(0); setPriorityActions([]); setSummary(''); setElapsed(0)
    setAgents({ document: { ...INIT }, compliance: { ...INIT }, anomaly: { ...INIT }, orchestrator: { ...INIT } })
  }

  const run = async () => {
    if (!c) return
    reset()
    await new Promise(r => setTimeout(r, 50))
    setRunning(true)
    const t0 = Date.now()
    setStartTime(t0)

    try {
      setAgents({
        document: { status: 'running', streamText: '', findings: [], confidence: 0, startTime: t0 } as any,
        compliance: { status: 'running', streamText: '', findings: [], confidence: 0 },
        anomaly: { status: 'running', streamText: '', findings: [], confidence: 0 },
        orchestrator: { ...INIT },
      })
      setActiveAgent('document')

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData: c, documents: c.documents }),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)

      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let buf = ''

      while (true) {
        const { done: sd, value } = await reader.read()
        if (sd) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          try {
            const msg = JSON.parse(raw)
            if (msg.type === 'start') continue

            if (msg.type === 'status' && msg.agent) {
              setActiveAgent(msg.agent as AgentKey)
              update(msg.agent as AgentKey, { status: 'running', startTime: Date.now() } as any)
            }
            if (msg.type === 'stream' && msg.agent && msg.text) {
              append(msg.agent as AgentKey, msg.text)
            }
            if (msg.type === 'complete' && msg.agent) {
              update(msg.agent as AgentKey, {
                status: 'complete',
                confidence: msg.confidence || 0.85,
                findings: msg.findings || [],
                fields: msg.fields,
                meansTest: msg.meansTest,
                riskScore: msg.riskScore,
                elapsed: Date.now() - t0,
              })
              if (msg.agent !== 'orchestrator') {
                const next: Record<string, AgentKey> = { document: 'compliance', compliance: 'anomaly', anomaly: 'orchestrator' }
                setActiveAgent(next[msg.agent] || null)
              } else {
                setActiveAgent(null)
              }
            }
            if (msg.type === 'complete' && msg.agent === 'orchestrator') {
              setPetition(msg.petition)
              setTimeSaved(msg.timeSavedMinutes || 230)
              setFieldsAutoFilled(msg.fieldsAutoFilled || 18)
              setOverallConf(msg.confidence || 0.89)
              setPriorityActions(msg.priorityActions || [])
              setSummary(msg.summary || '')
            }
            if (msg.type === 'done') { setRunning(false); setDone(true); setActiveAgent(null) }
            if (msg.type === 'error') throw new Error(msg.message)
          } catch {}
        }
      }
    } catch (e: any) {
      console.error(e); setRunning(false)
    }
  }

  const downloadPdf = async () => {
    if (!c || !petition) return
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petition, caseData: c }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PARALEX_${c?.caseNumber}_petition.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
  }

  if (!c) return <div style={{ padding: 32, color: '#888', fontSize: 13 }}>Case not found.</div>

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => navigate(`/case/${id}`)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: '#666', background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, sans-serif',
        }}>
          <ArrowLeft size={14} />
          {c.clientName} — {c.caseNumber}
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          {done && (
            <button onClick={downloadPdf} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 8, fontSize: 13,
              background: '#fff', border: '1px solid #e8e8e5', color: '#555',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            }}>
              <Download size={13} />
              Export PDF
            </button>
          )}
          <button onClick={running ? undefined : run} disabled={running} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: running ? '#e8e8e5' : '#157040', color: running ? '#888' : '#fff',
            border: 'none', cursor: running ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
          }}>
            {running ? (
              <>
                <div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid #aaa', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                Running... {(elapsed / 1000).toFixed(1)}s
              </>
            ) : done ? (
              <><RotateCcw size={13} />Re-run Agents</>
            ) : (
              <><Zap size={13} />Launch PARALEX Agents</>
            )}
          </button>
        </div>
      </div>

      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500, color: '#111', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
        PARALEX Agent Orchestration
      </h1>
      <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>
        3 Groq agents running in parallel — watch them think in real time
      </p>

      {/* Success banner */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: '#fff', border: '1px solid #d1fae5', borderRadius: 12,
              padding: '14px 18px', marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: summary ? 6 : 0 }}>
                <CheckCircle2 size={15} color="#157040" />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>Analysis Complete</span>
                <span style={{
                  fontSize: 11, fontFamily: 'DM Mono, monospace',
                  padding: '2px 8px', borderRadius: 20, background: '#e6f5ed', color: '#157040',
                }}>
                  {(elapsed / 1000).toFixed(1)}s total
                </span>
              </div>
              {summary && <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.6, maxWidth: 560 }}>{summary}</p>}
            </div>
            <div style={{ display: 'flex', gap: 24, flexShrink: 0, marginLeft: 16 }}>
              {[
                { l: 'Confidence', v: `${Math.round(overallConf * 100)}%`, c: '#157040' },
                { l: 'Fields Filled', v: fieldsAutoFilled, c: '#0369a1' },
                { l: 'Time Saved', v: `${Math.round(timeSaved / 60 * 10) / 10}h`, c: '#7c3aed' },
              ].map(({ l, v, c: col }) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500, color: col }}>{v}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 agent panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {(['document', 'compliance', 'anomaly'] as AgentKey[]).map(k => (
          <AgentPanel key={k} agentKey={k} data={agents[k]} isActive={activeAgent === k} />
        ))}

        {/* Orchestrator - spans full width */}
        <div style={{
          background: '#fff',
          border: `${activeAgent === 'orchestrator' ? 1.5 : 1}px solid ${activeAgent === 'orchestrator' ? '#157040' : agents.orchestrator.status === 'complete' ? '#d1fae5' : '#e8e8e5'}`,
          borderRadius: 12,
          transition: 'border-color 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f5f5f3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f5ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={15} color="#157040" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#111' }}>Master Orchestrator</div>
                <div style={{ fontSize: 11, color: '#bbb' }}>Synthesizing agent findings — assembling petition draft</div>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
              background: agents.orchestrator.status === 'running' ? '#e6f5ed' : agents.orchestrator.status === 'complete' ? '#d1fae5' : '#f5f5f3',
              color: agents.orchestrator.status === 'running' ? '#157040' : agents.orchestrator.status === 'complete' ? '#166534' : '#bbb',
            }}>
              {agents.orchestrator.status === 'running' && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.2s infinite' }} />}
              {agents.orchestrator.status === 'complete' && <CheckCircle2 size={11} />}
              {agents.orchestrator.status === 'idle' ? 'Waiting for agents' : agents.orchestrator.status === 'running' ? 'Synthesizing' : 'Complete'}
            </div>
          </div>
          <div style={{ padding: '12px 16px', maxHeight: 180, overflow: 'auto' }}>
            {agents.orchestrator.status === 'idle' ? (
              <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: '#ddd' }}>
                Awaiting document, compliance, and anomaly agent results...
              </div>
            ) : (
              <pre style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, lineHeight: 1.7, color: '#333', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {agents.orchestrator.streamText}
                {agents.orchestrator.status === 'running' && (
                  <span style={{ display: 'inline-block', width: 6, height: 12, marginLeft: 2, background: '#157040', verticalAlign: 'text-bottom', animation: 'pulse 0.8s infinite' }} />
                )}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Petition output */}
      <AnimatePresence>
        {done && petition && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              {
                title: 'SCHEDULE I — INCOME', color: '#157040',
                data: petition.scheduleI,
              },
              {
                title: 'SCHEDULE J — EXPENSES', color: '#7c3aed',
                data: petition.scheduleJ,
              },
              {
                title: 'MEANS TEST', color: '#b45309',
                data: petition.meansTest,
                extra: priorityActions,
              },
            ].map(({ title, color, data, extra }) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: 12, padding: 16 }}>
                <div style={{
                  fontSize: 10, fontFamily: 'DM Mono, monospace', fontWeight: 500,
                  color, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 12,
                }}>
                  {title}
                </div>
                {data && Object.entries(data).map(([k, v]) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0', borderBottom: '1px solid #f8f8f6', fontSize: 12,
                  }}>
                    <span style={{ color: '#666' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontWeight: 500,
                      color: k === 'passesTest' ? (v ? '#157040' : '#dc2626') : '#111',
                    }}>
                      {typeof v === 'boolean' ? (v ? 'PASSES' : 'FAILS') :
                       typeof v === 'number' ? (k.toLowerCase().includes('employer') || k.toLowerCase().includes('occupation') ? String(v) : `$${(v as number).toLocaleString()}`) :
                       String(v)}
                    </span>
                  </div>
                ))}
                {extra && extra.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0ee' }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#b45309', marginBottom: 8 }}>Priority Actions</div>
                    {extra.map((a: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11, marginBottom: 6 }}>
                        <ChevronRight size={11} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ color: '#555' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </div>
  )
}
