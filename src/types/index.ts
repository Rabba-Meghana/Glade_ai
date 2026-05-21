export type CaseStatus = 'intake' | 'retain' | 'collecting' | 'drafting' | 'review' | 'filed'
export type CaseUrgency = 'critical' | 'high' | 'normal' | 'low'
export type AgentStatus = 'idle' | 'running' | 'complete' | 'error'

export type Case = {
  id: string
  clientName: string
  caseNumber: string
  chapter: 7 | 13
  status: CaseStatus
  urgency: CaseUrgency
  filingDeadline: string
  createdAt: string
  updatedAt: string
  paralegal: string
  attorney: string
  state: string
  documents: DocumentFile[]
  missingDocs: string[]
  healthScore: number
  lastAgentRun?: string
  notes: string
  monthlyIncome?: number
  totalDebt?: number
  meansTestResult?: 'pass' | 'fail' | 'pending'
}

export type DocumentFile = {
  id: string
  name: string
  type: 'paystub' | 'bank_statement' | 'tax_return' | 'credit_report' | 'expense_record' | 'other'
  uploadedAt: string
  status: 'pending' | 'processing' | 'verified' | 'flagged'
  extractedFields?: Record<string, ExtractedField>
  confidence?: number
}

export type ExtractedField = {
  value: string | number
  confidence: number
  source: string
  flagged?: boolean
  flagReason?: string
}

export type AgentRun = {
  id: string
  caseId: string
  startedAt: string
  completedAt?: string
  agents: {
    document: AgentResult
    compliance: AgentResult
    anomaly: AgentResult
  }
  orchestratorSummary?: string
  overallConfidence?: number
  timeSavedMinutes?: number
  fieldsAutoFilled?: number
  fieldsCorreected?: number
}

export type AgentResult = {
  status: AgentStatus
  startedAt?: string
  completedAt?: string
  findings: AgentFinding[]
  streamedText?: string
  confidence?: number
  tokensUsed?: number
}

export type AgentFinding = {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  field?: string
  message: string
  value?: string | number
  timestamp: string
}

export type EvalMetric = {
  date: string
  accuracy: number
  fieldsAutoFilled: number
  fieldsCorreected: number
  timeSavedHours: number
  casesProcessed: number
}

export type PetitionDraft = {
  caseId: string
  scheduleI: ScheduleI
  scheduleJ: ScheduleJ
  meansTest: MeansTest
  generatedAt: string
  confidence: number
}

export type ScheduleI = {
  grossMonthlyIncome: number
  payrollDeductions: number
  netMonthlyIncome: number
  otherIncome: number
  totalMonthlyIncome: number
  employer: string
  occupation: string
}

export type ScheduleJ = {
  rent: number
  utilities: number
  food: number
  transportation: number
  medical: number
  insurance: number
  otherExpenses: number
  totalExpenses: number
  netMonthlyDisposable: number
}

export type MeansTest = {
  annualIncome: number
  stateMedianIncome: number
  passesTest: boolean
  allowableExpenses: number
  disposableIncome: number
  calculatedAt: string
}
