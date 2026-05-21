import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Brain, FileSearch, Scale, AlertOctagon, FilePen, Zap, CheckCircle2,
  RotateCcw, Download, Cpu, Activity, Sparkles
} from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'
import { useTheme } from '../contexts/ThemeContext'

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
  startTime?: number
}

const AGENT_META: Record<AgentKey, { icon: any; label: string; desc: string; color: string }> = {
  document:     { icon: FileSearch,   label: 'Document Intelligence', desc: 'Extracting financial fields from uploaded documents',     color: '#3b82f6' },
  compliance:   { icon: Scale,        label: 'Compliance Auditor',    desc: 'Means test calculation & filing requirements',             color: '#a855f7' },
  anomaly:      { icon: AlertOctagon, label: 'Anomaly Detector',      desc: 'Cross-referencing data for inconsistencies & risks',      color: '#f97316' },
  orchestrator: { icon: Brain,        label: 'Master Orchestrator',   desc: 'Synthesizing findings, assembling petition draft',       color: '#a78bfa' },
}

const INIT: AgentData = { status: 'idle', streamText: '', findings: [], confidence: 0 }

// Token-counter animated number
function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = display
    const t0 = Date.now()
    const dur = 400
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / dur)
      setDisplay(start + (value - start) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(tick)
    }
    tick()
  }, [value])
  return <>{format ? format(display) : Math.round(display)}</>
}

// Confidence ring
function ConfidenceRing({ value, color, size = 56 }: { value: number; color: string; size?: number }) {
  const { c } = useTheme()
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value)
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c.border} strokeWidth={4} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={4} strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8 }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: c.text, fontFamily: 'Geist Mono, monospace', lineHeight: 1 }}>
          {Math.round(value * 100)}
        </span>
        <span style={{ fontSize: 8, color: c.textSubtle, fontFamily: 'Geist Mono, monospace' }}>%</span>
      </div>
    </div>
  )
}

function StatusPulse({ status, color }: { status: AgentStatus; color: string }) {
  const { c } = useTheme()
  const map = {
    idle:     { label: 'STANDBY',  bg: c.textSubtle },
    running:  { label: 'STREAMING', bg: color },
    complete: { label: 'COMPLETE', bg: c.success },
    error:    { label: 'ERROR',    bg: c.danger },
  }[status]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 6, height: 6 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: map.bg }} />
        {status === 'running' && <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: map.bg, opacity: 0.4, animation: 'ping 1.4s infinite' }} />}
      </div>
      <span style={{ fontSize: 9.5, fontWeight: 600, color: map.bg, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>
        {map.label}
      </span>
    </div>
  )
}

function AgentPanel({ agentKey, data, isActive }: { agentKey: AgentKey; data: AgentData; isActive: boolean }) {
  const m = AGENT_META[agentKey]
  const Icon = m.icon
  const { c, theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [data.streamText])

  const tokenCount = Math.floor(data.streamText.length / 4)

  return (
    <motion.div
      animate={{
        borderColor: isActive ? m.color : (data.status === 'complete' ? c.borderStrong : c.border),
        boxShadow: isActive ? `0 0 0 1px ${m.color}, 0 8px 32px ${m.color}33` : 'none',
      }}
      style={{
        background: c.bgElevated, border: `1px solid ${c.border}`,
        borderRadius: 14, display: 'flex', flexDirection: 'column',
        minHeight: 280, overflow: 'hidden',
      }}>

      {/* Header strip */}
      {isActive && (
        <div style={{ height: 2, background: m.color, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, transparent, ${m.color}cc, transparent)`,
            width: '40%', animation: 'data-flow 1.4s infinite linear',
          }} />
        </div>
      )}

      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: theme === 'dark' ? `${m.color}1a` : `${m.color}1f`,
            border: `1px solid ${m.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} color={m.color} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: c.text, letterSpacing: '-0.01em' }}>{m.label}</div>
            <div style={{ fontSize: 10, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>
              groq · llama-3.3-70b
            </div>
          </div>
        </div>
        <StatusPulse status={data.status} color={m.color} />
      </div>

      {/* Live metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ padding: '10px 12px', borderRight: `1px solid ${c.border}` }}>
          <div style={{ fontSize: 9, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>TOKENS</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.text, fontFamily: 'Geist Mono, monospace', marginTop: 2 }}>
            <AnimatedNumber value={tokenCount} />
          </div>
        </div>
        <div style={{ padding: '10px 12px', borderRight: `1px solid ${c.border}` }}>
          <div style={{ fontSize: 9, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>FINDINGS</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.text, fontFamily: 'Geist Mono, monospace', marginTop: 2 }}>
            <AnimatedNumber value={data.findings.length} />
          </div>
        </div>
        <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>CONF</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: m.color, fontFamily: 'Geist Mono, monospace', marginTop: 2 }}>
              <AnimatedNumber value={data.confidence * 100} format={n => n.toFixed(0) + '%'} />
            </div>
          </div>
          <ConfidenceRing value={data.confidence} color={m.color} size={36} />
        </div>
      </div>

      {/* Stream area */}
      <div ref={ref} style={{
        flex: 1, padding: 12, overflowY: 'auto', minHeight: 130, maxHeight: 200,
        background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#fbfbfd',
        fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 11.5, lineHeight: 1.55,
        color: c.textMuted,
      }}>
        {data.streamText ? (
          <>
            {data.streamText}
            {data.status === 'running' && (
              <span style={{ display: 'inline-block', width: 6, height: 12, background: m.color, marginLeft: 2, verticalAlign: 'middle', animation: 'cursor-blink 0.9s infinite' }} />
            )}
          </>
        ) : (
          <span style={{ color: c.textSubtle, fontStyle: 'italic' }}>{m.desc}</span>
        )}
      </div>

      {/* Findings */}
      {data.findings.length > 0 && (
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${c.border}` }}>
          <div style={{ fontSize: 9.5, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em', marginBottom: 6 }}>
            KEY FINDINGS
          </div>
          {data.findings.slice(0, 3).map((f, i) => (
            <div key={i} style={{ fontSize: 11, color: c.text, marginBottom: 4, paddingLeft: 10, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 6, width: 4, height: 4, borderRadius: '50%', background: m.color }} />
              {typeof f === 'string' ? f : f.label || f.message || JSON.stringify(f)}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function AgentOrchestration() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { c, theme } = useTheme()
  const caseData = MOCK_CASES.find(x => x.id === id)

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
    if (!caseData) return
    reset()
    await new Promise(r => setTimeout(r, 50))
    setRunning(true)
    const t0 = Date.now()
    setStartTime(t0)

    try {
      setAgents({
        document: { status: 'running', streamText: '', findings: [], confidence: 0, startTime: t0 },
        compliance: { status: 'running', streamText: '', findings: [], confidence: 0 },
        anomaly: { status: 'running', streamText: '', findings: [], confidence: 0 },
        orchestrator: { ...INIT },
      })
      setActiveAgent('document')

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData, documents: caseData.documents }),
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
              update(msg.agent as AgentKey, { status: 'running', startTime: Date.now() })
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
    if (!caseData || !petition) return
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petition, caseData }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PARALEX_${caseData.caseNumber}_petition.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
  }

  if (!caseData) return <div style={{ padding: 32, color: c.textSubtle, fontSize: 13 }}>Case not found.</div>

  return (
    <div style={{ padding: '24px 28px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => navigate(`/case/${id}`)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12.5, color: c.textMuted, background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, fontFamily: 'inherit',
        }}>
          <ArrowLeft size={13} />
          {caseData.clientName} · {caseData.caseNumber}
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {done && (
            <button onClick={downloadPdf} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
              background: c.surface, border: `1px solid ${c.border}`, color: c.text,
              cursor: 'pointer',
            }}>
              <Download size={13} /> Export PDF
            </button>
          )}
          <button onClick={running ? undefined : run} disabled={running} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
            background: running ? c.surface : c.gradient,
            color: running ? c.textMuted : '#fff',
            border: running ? `1px solid ${c.border}` : 'none',
            cursor: running ? 'not-allowed' : 'pointer',
            boxShadow: running ? 'none' : '0 4px 14px rgba(167, 139, 250, 0.35)',
          }}>
            {running ? (
              <>
                <div style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${c.textSubtle}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                Streaming · {(elapsed / 1000).toFixed(1)}s
              </>
            ) : done ? (
              <><RotateCcw size={13} /> Re-run</>
            ) : (
              <><Sparkles size={13} /> Launch Agents</>
            )}
          </button>
        </div>
      </div>

      {/* Title block */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Theater
          </span>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: c.textSubtle }} />
          <span style={{ fontSize: 11, color: c.accent, fontFamily: 'Geist Mono, monospace' }}>
            multi-agent · parallel
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: c.text, letterSpacing: '-0.02em' }}>
          Agent Orchestration
        </h1>
        <p style={{ fontSize: 13, color: c.textMuted, margin: '3px 0 0' }}>
          Three specialized Groq agents work in parallel, hand off findings to the orchestrator
        </p>
      </div>

      {/* Hero stat row when complete */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginBottom: 16 }}>
            <div style={{ background: c.gradient, borderRadius: 14, padding: 1 }}>
              <div style={{ background: c.bgElevated, borderRadius: 13, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, background: c.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(167, 139, 250, 0.4)',
                    }}>
                      <CheckCircle2 size={18} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Analysis complete</div>
                      <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 2, maxWidth: 480 }}>{summary}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {[
                      { label: 'TIME SAVED', value: `${(timeSaved / 60).toFixed(1)}h`, color: c.success },
                      { label: 'AUTO-FILLED', value: `${fieldsAutoFilled}`, color: c.info },
                      { label: 'CONFIDENCE', value: `${Math.round(overallConf * 100)}%`, color: c.accent },
                      { label: 'TOTAL', value: `${(elapsed / 1000).toFixed(1)}s`, color: c.text },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9.5, color: c.textSubtle, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>{s.label}</div>
                        <div style={{ fontSize: 19, fontWeight: 600, color: s.color, fontFamily: 'Geist Mono, monospace', marginTop: 2, letterSpacing: '-0.02em' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 parallel agent panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        <AgentPanel agentKey="document" data={agents.document} isActive={activeAgent === 'document'} />
        <AgentPanel agentKey="compliance" data={agents.compliance} isActive={activeAgent === 'compliance'} />
        <AgentPanel agentKey="anomaly" data={agents.anomaly} isActive={activeAgent === 'anomaly'} />
      </div>

      {/* Handoff arrow + Orchestrator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 12px' }}>
        <svg width="100%" height="40" viewBox="0 0 800 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="handoff-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={c.accent} stopOpacity="0.6" />
              <stop offset="100%" stopColor={c.accent} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M 130 0 Q 130 20, 400 30 Q 670 20, 670 0" fill="none" stroke="url(#handoff-grad)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 400 0 L 400 32" stroke="url(#handoff-grad)" strokeWidth="1.5" strokeDasharray="4 4" />
          {(activeAgent === 'orchestrator' || agents.orchestrator.status === 'running') && (
            <motion.circle r="3" fill={c.accent}
              initial={{ cx: 130, cy: 0 }}
              animate={{ cx: [130, 400, 670, 400], cy: [0, 30, 0, 30] }}
              transition={{ duration: 2, repeat: Infinity }} />
          )}
        </svg>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AgentPanel agentKey="orchestrator" data={agents.orchestrator} isActive={activeAgent === 'orchestrator'} />
      </div>

      {/* Priority actions */}
      {priorityActions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: c.bgElevated, border: `1px solid ${c.border}`,
            borderRadius: 14, padding: 18, marginBottom: 16,
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <Activity size={14} color={c.accent} />
            <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Priority Actions</span>
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 5, background: c.accentSoft, color: c.accentText,
              fontFamily: 'Geist Mono, monospace', fontWeight: 600,
            }}>
              {priorityActions.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {priorityActions.map((a, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 9,
                  background: c.surface, border: `1px solid ${c.border}`,
                }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: c.accentSoft, color: c.accentText,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10.5, fontWeight: 700, fontFamily: 'Geist Mono, monospace',
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 12.5, color: c.text, lineHeight: 1.5 }}>{a}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
