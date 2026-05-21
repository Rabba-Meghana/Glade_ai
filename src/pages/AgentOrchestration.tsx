import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain, FileSearch, Scale, AlertOctagon, Zap, CheckCircle2, Clock, TrendingUp, Download, RotateCcw, ChevronRight } from 'lucide-react'
import { MOCK_CASES } from '../lib/mockData'

type AgentState = 'idle' | 'running' | 'complete' | 'error'

interface AgentData {
  status: AgentState
  streamText: string
  findings: any[]
  confidence: number
  tokensPerSec?: number
  fields?: Record<string, any>
  meansTest?: any
  riskScore?: number
  startTime?: number
  elapsed?: number
}

const AGENT_META = {
  document:    { icon: FileSearch, label: 'Document Intelligence', desc: 'Extracting financial fields from uploaded documents', color: '#0369a1', bg: '#e0f2fe' },
  compliance:  { icon: Scale,      label: 'Compliance Auditor',    desc: 'Means test calculation & filing requirements',        color: '#7c3aed', bg: '#ede9fe' },
  anomaly:     { icon: AlertOctagon,label: 'Anomaly Detector',     desc: 'Cross-referencing data for inconsistencies & risks',  color: '#b45309', bg: '#fef3c7' },
  orchestrator:{ icon: Brain,       label: 'Master Orchestrator',  desc: 'Synthesizing all agent findings into petition draft', color: '#157040', bg: '#e6f5ed' },
}

function AgentPanel({ agentKey, data, isActive }: { agentKey: string; data: AgentData; isActive: boolean }) {
  const meta = AGENT_META[agentKey as keyof typeof AGENT_META]
  const Icon = meta.icon
  const streamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight
  }, [data.streamText])

  return (
    <div
      className="glade-card flex flex-col transition-all"
      style={{
        borderColor: isActive ? meta.color : data.status === 'complete' ? '#d1fae5' : '#e8e8e5',
        borderWidth: isActive ? 1.5 : 1,
        minHeight: 280,
      }}
    >
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#f0f0ee' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: meta.bg }}>
            <Icon size={16} style={{ color: meta.color }} />
          </div>
          <div>
            <div className="text-xs font-medium" style={{ color: '#111' }}>{meta.label}</div>
            <div className="text-xs" style={{ color: '#aaa' }}>{meta.desc}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.elapsed && data.status === 'complete' && (
            <span className="text-xs font-mono" style={{ color: '#aaa' }}>{(data.elapsed / 1000).toFixed(1)}s</span>
          )}
          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${
            data.status === 'idle' ? 'opacity-50' : ''
          }`} style={{
            background: data.status === 'running' ? meta.bg :
                        data.status === 'complete' ? '#d1fae5' :
                        data.status === 'error' ? '#fee2e2' : '#f5f5f3',
            color: data.status === 'running' ? meta.color :
                   data.status === 'complete' ? '#166534' :
                   data.status === 'error' ? '#dc2626' : '#888',
          }}>
            {data.status === 'running' && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: meta.color }} />}
            {data.status === 'complete' && <CheckCircle2 size={11} />}
            {data.status === 'idle' ? 'Standby' :
             data.status === 'running' ? 'Running' :
             data.status === 'complete' ? 'Complete' : 'Error'}
          </div>
        </div>
      </div>

      <div ref={streamRef} className="flex-1 p-4 overflow-auto" style={{ maxHeight: 180, fontFamily: 'DM Mono, monospace', fontSize: 11, lineHeight: '1.7', color: '#444', background: data.status === 'idle' ? '#fafaf9' : 'white' }}>
        {data.status === 'idle' && (
          <div className="text-center py-8" style={{ color: '#ccc' }}>
            Waiting to initialize...
          </div>
        )}
        {(data.status === 'running' || data.status === 'complete') && data.streamText && (
          <pre className="whitespace-pre-wrap break-words text-xs" style={{ color: '#333' }}>
            {data.streamText}
            {data.status === 'running' && <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse" style={{ background: meta.color, verticalAlign: 'text-bottom' }} />}
          </pre>
        )}
      </div>

      {data.status === 'complete' && data.findings.length > 0 && (
        <div className="border-t px-4 py-3 space-y-1.5" style={{ borderColor: '#f0f0ee' }}>
          {data.findings.slice(0, 3).map((f: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                f.type === 'error' ? 'bg-red-500' :
                f.type === 'warning' ? 'bg-amber-500' :
                f.type === 'success' ? 'bg-green-500' : 'bg-blue-400'
              }`} />
              <span style={{ color: '#555' }}>{f.message}</span>
            </div>
          ))}
        </div>
      )}

      {data.status === 'complete' && data.confidence > 0 && (
        <div className="px-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex-1 w-24 h-1 rounded-full" style={{ background: '#f0f0ee' }}>
              <div className="h-full rounded-full" style={{ width: `${data.confidence * 100}%`, background: meta.color }} />
            </div>
            <span className="text-xs font-mono" style={{ color: meta.color }}>{Math.round(data.confidence * 100)}% conf.</span>
          </div>
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
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [petition, setPetition] = useState<any>(null)
  const [timeSaved, setTimeSaved] = useState(0)
  const [fieldsAutoFilled, setFieldsAutoFilled] = useState(0)
  const [overallConf, setOverallConf] = useState(0)
  const [priorityActions, setPriorityActions] = useState<string[]>([])
  const [summary, setSummary] = useState('')
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsed, setElapsed] = useState(0)

  const [agents, setAgents] = useState<Record<string, AgentData>>({
    document:     { status: 'idle', streamText: '', findings: [], confidence: 0 },
    compliance:   { status: 'idle', streamText: '', findings: [], confidence: 0 },
    anomaly:      { status: 'idle', streamText: '', findings: [], confidence: 0 },
    orchestrator: { status: 'idle', streamText: '', findings: [], confidence: 0 },
  })

  const timerRef = useRef<any>(null)

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(Date.now() - startTime), 100)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [running, startTime])

  const updateAgent = (key: string, update: Partial<AgentData>) => {
    setAgents(prev => ({
      ...prev,
      [key]: { ...prev[key], ...update }
    }))
  }

  const appendStream = (key: string, text: string) => {
    setAgents(prev => ({
      ...prev,
      [key]: { ...prev[key], streamText: prev[key].streamText + text }
    }))
  }

  const reset = () => {
    setRunning(false)
    setDone(false)
    setActiveAgent(null)
    setPetition(null)
    setTimeSaved(0)
    setFieldsAutoFilled(0)
    setOverallConf(0)
    setPriorityActions([])
    setSummary('')
    setElapsed(0)
    setAgents({
      document:     { status: 'idle', streamText: '', findings: [], confidence: 0 },
      compliance:   { status: 'idle', streamText: '', findings: [], confidence: 0 },
      anomaly:      { status: 'idle', streamText: '', findings: [], confidence: 0 },
      orchestrator: { status: 'idle', streamText: '', findings: [], confidence: 0 },
    })
  }

  const runAgents = async () => {
    if (!c) return
    reset()
    await new Promise(r => setTimeout(r, 50))

    setRunning(true)
    setDone(false)
    const t0 = Date.now()
    setStartTime(t0)

    try {
      const agentStart = { status: 'running' as AgentState, streamText: '', findings: [], confidence: 0, startTime: t0 }
      setAgents({
        document:     { ...agentStart },
        compliance:   { ...agentStart },
        anomaly:      { ...agentStart },
        orchestrator: { status: 'idle', streamText: '', findings: [], confidence: 0 },
      })
      setActiveAgent('document')

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData: c,
          documents: c.documents
        })
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          try {
            const msg = JSON.parse(raw)

            if (msg.type === 'start') continue

            if (msg.type === 'status' && msg.agent) {
              setActiveAgent(msg.agent)
              updateAgent(msg.agent, { status: 'running', startTime: Date.now() })
            }

            if (msg.type === 'stream' && msg.agent && msg.text) {
              appendStream(msg.agent, msg.text)
            }

            if (msg.type === 'complete' && msg.agent) {
              const elapsed = Date.now() - (agents[msg.agent]?.startTime || t0)
              updateAgent(msg.agent, {
                status: 'complete',
                confidence: msg.confidence || 0.85,
                findings: msg.findings || [],
                fields: msg.fields,
                meansTest: msg.meansTest,
                riskScore: msg.riskScore,
                elapsed,
              })
              if (msg.agent === 'orchestrator') setActiveAgent(null)
              else setActiveAgent(msg.agent === 'document' ? 'compliance' : msg.agent === 'compliance' ? 'anomaly' : 'orchestrator')
            }

            if (msg.type === 'complete' && msg.agent === 'orchestrator') {
              setPetition(msg.petition)
              setTimeSaved(msg.timeSavedMinutes || 230)
              setFieldsAutoFilled(msg.fieldsAutoFilled || 18)
              setOverallConf(msg.confidence || 0.89)
              setPriorityActions(msg.priorityActions || [])
              setSummary(msg.summary || '')
            }

            if (msg.type === 'done') {
              setRunning(false)
              setDone(true)
              setActiveAgent(null)
            }

            if (msg.type === 'error') throw new Error(msg.message)
          } catch {}
        }
      }
    } catch (err: any) {
      console.error(err)
      setRunning(false)
    }
  }

  const downloadPdf = async () => {
    if (!c || !petition) return
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petition, caseData: c })
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AXIOM_${c.caseNumber}_petition_draft.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
  }

  if (!c) return <div className="p-8 text-sm" style={{ color: '#888' }}>Case not found.</div>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(`/case/${id}`)}
          className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
          style={{ color: '#555' }}
        >
          <ArrowLeft size={14} />
          {c.clientName} — {c.caseNumber}
        </button>
        <div className="flex items-center gap-2">
          {done && (
            <button
              onClick={downloadPdf}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border hover:opacity-80 transition-opacity"
              style={{ borderColor: '#e8e8e5', color: '#555' }}
            >
              <Download size={14} />
              Export PDF
            </button>
          )}
          <button
            onClick={done || !running ? runAgents : undefined}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: running ? '#e8e8e5' : '#157040', color: running ? '#888' : 'white' }}
          >
            {running ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Running... {(elapsed / 1000).toFixed(1)}s
              </>
            ) : done ? (
              <>
                <RotateCcw size={14} />
                Re-run Agents
              </>
            ) : (
              <>
                <Zap size={14} />
                Launch AXIOM Agents
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h1 className="text-xl font-display font-medium mb-0.5" style={{ color: '#111', letterSpacing: '-0.02em' }}>AXIOM Agent Orchestration</h1>
        <p className="text-sm" style={{ color: '#666' }}>3 Groq agents running in parallel — watch them think in real time</p>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glade-card p-4 mb-4"
          style={{ borderColor: '#d1fae5' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} style={{ color: '#157040' }} />
                <span className="text-sm font-medium" style={{ color: '#111' }}>Analysis Complete</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: '#e6f5ed', color: '#157040' }}>
                  {(elapsed / 1000).toFixed(1)}s total
                </span>
              </div>
              {summary && <p className="text-xs leading-relaxed" style={{ color: '#555', maxWidth: 600 }}>{summary}</p>}
            </div>
            <div className="flex items-center gap-4 ml-4">
              {[
                { label: 'Confidence', value: `${Math.round(overallConf * 100)}%`, color: '#157040' },
                { label: 'Fields Filled', value: fieldsAutoFilled, color: '#0369a1' },
                { label: 'Time Saved', value: `${Math.round(timeSaved / 60 * 10) / 10}h`, color: '#7c3aed' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-display font-medium" style={{ color }}>{value}</div>
                  <div className="text-xs" style={{ color: '#888' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        {['document', 'compliance', 'anomaly'].map(key => (
          <AgentPanel
            key={key}
            agentKey={key}
            data={agents[key]}
            isActive={activeAgent === key}
          />
        ))}

        <div className="glade-card col-span-2" style={{
          borderColor: activeAgent === 'orchestrator' ? '#157040' :
                       agents.orchestrator.status === 'complete' ? '#d1fae5' : '#e8e8e5',
          borderWidth: activeAgent === 'orchestrator' ? 1.5 : 1,
        }}>
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#f0f0ee' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#e6f5ed' }}>
                <Brain size={16} style={{ color: '#157040' }} />
              </div>
              <div>
                <div className="text-xs font-medium" style={{ color: '#111' }}>Master Orchestrator</div>
                <div className="text-xs" style={{ color: '#aaa' }}>Synthesizing agent findings — assembling petition draft</div>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium`} style={{
              background: agents.orchestrator.status === 'running' ? '#e6f5ed' :
                          agents.orchestrator.status === 'complete' ? '#d1fae5' :
                          agents.orchestrator.status === 'error' ? '#fee2e2' : '#f5f5f3',
              color: agents.orchestrator.status === 'running' ? '#157040' :
                     agents.orchestrator.status === 'complete' ? '#166534' :
                     agents.orchestrator.status === 'error' ? '#dc2626' : '#888',
            }}>
              {agents.orchestrator.status === 'running' && <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-600" />}
              {agents.orchestrator.status === 'complete' && <CheckCircle2 size={11} />}
              {agents.orchestrator.status === 'idle' ? 'Waiting for agents' :
               agents.orchestrator.status === 'running' ? 'Synthesizing' :
               agents.orchestrator.status === 'complete' ? 'Complete' : 'Error'}
            </div>
          </div>

          <div className="p-4">
            {agents.orchestrator.status === 'idle' && (
              <div className="text-center py-6 text-xs" style={{ color: '#ccc' }}>
                Awaiting document, compliance, and anomaly agent results...
              </div>
            )}
            {(agents.orchestrator.status === 'running' || agents.orchestrator.status === 'complete') && (
              <pre className="text-xs whitespace-pre-wrap break-words" style={{ fontFamily: 'DM Mono, monospace', lineHeight: '1.7', color: '#333', maxHeight: 200, overflow: 'auto' }}>
                {agents.orchestrator.streamText}
                {agents.orchestrator.status === 'running' && <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse bg-green-700" style={{ verticalAlign: 'text-bottom' }} />}
              </pre>
            )}
          </div>
        </div>
      </div>

      {done && petition && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="glade-card p-4">
            <h3 className="text-xs font-medium mb-3 uppercase tracking-wide" style={{ color: '#157040', fontFamily: 'DM Mono, monospace' }}>Schedule I — Income</h3>
            {petition.scheduleI && Object.entries(petition.scheduleI).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: '#f5f5f3' }}>
                <span style={{ color: '#666' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-mono font-medium" style={{ color: '#111' }}>
                  {typeof v === 'number' && k !== 'occupation' && !k.toLowerCase().includes('employer') ? `$${(v as number).toLocaleString()}` : String(v)}
                </span>
              </div>
            ))}
          </div>
          <div className="glade-card p-4">
            <h3 className="text-xs font-medium mb-3 uppercase tracking-wide" style={{ color: '#7c3aed', fontFamily: 'DM Mono, monospace' }}>Schedule J — Expenses</h3>
            {petition.scheduleJ && Object.entries(petition.scheduleJ).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: '#f5f5f3' }}>
                <span style={{ color: '#666' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-mono font-medium" style={{ color: '#111' }}>
                  {typeof v === 'number' ? `$${(v as number).toLocaleString()}` : String(v)}
                </span>
              </div>
            ))}
          </div>
          <div className="glade-card p-4">
            <h3 className="text-xs font-medium mb-3 uppercase tracking-wide" style={{ color: '#b45309', fontFamily: 'DM Mono, monospace' }}>Means Test</h3>
            {petition.meansTest && Object.entries(petition.meansTest).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: '#f5f5f3' }}>
                <span style={{ color: '#666' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className={`font-mono font-medium ${k === 'passesTest' ? (v ? 'text-green-600' : 'text-red-600') : ''}`} style={{ color: k === 'passesTest' ? undefined : '#111' }}>
                  {typeof v === 'boolean' ? (v ? 'PASSES' : 'FAILS') : typeof v === 'number' ? `$${(v as number).toLocaleString()}` : String(v)}
                </span>
              </div>
            ))}
            {priorityActions.length > 0 && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: '#f0f0ee' }}>
                <div className="text-xs font-medium mb-2" style={{ color: '#b45309' }}>Priority Actions</div>
                {priorityActions.map((a, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs mb-1.5">
                    <ChevronRight size={11} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: '#555' }}>{a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
