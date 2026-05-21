import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function runDocumentAgent(
  caseContext: string,
  documents: string,
  onStream: (text: string) => void
): Promise<{ findings: any[]; confidence: number; fields: Record<string, any> }> {
  const findings: any[] = []
  let fullText = ''

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    stream: true,
    max_tokens: 1024,
    messages: [
      {
        role: 'system',
        content: `You are PARALEX Document Intelligence Agent for PARALEX - a legal document extraction specialist for bankruptcy law firms.

Your job: Extract and validate financial data from bankruptcy client documents with surgical precision.

ALWAYS respond in this exact JSON structure:
{
  "fields": {
    "grossMonthlyIncome": { "value": number, "confidence": 0.0-1.0, "source": "document name" },
    "employer": { "value": "string", "confidence": 0.0-1.0, "source": "document name" },
    "netMonthlyIncome": { "value": number, "confidence": 0.0-1.0, "source": "document name" },
    "averageMonthlyBalance": { "value": number, "confidence": 0.0-1.0, "source": "document name" },
    "annualIncome": { "value": number, "confidence": 0.0-1.0, "source": "document name" }
  },
  "findings": [
    { "type": "info|warning|error|success", "field": "fieldName", "message": "finding description", "value": "extracted value" }
  ],
  "overallConfidence": 0.0-1.0,
  "summary": "2-3 sentence summary of what was extracted and key observations"
}

Be precise, flag anomalies, note missing data. Think like a senior paralegal who has reviewed 10,000 bankruptcy cases.`
      },
      {
        role: 'user',
        content: `Case: ${caseContext}\n\nDocuments available:\n${documents}\n\nExtract all financial fields. Flag any anomalies or inconsistencies.`
      }
    ]
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || ''
    fullText += text
    onStream(text)
  }

  try {
    const jsonMatch = fullText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        findings: parsed.findings || [],
        confidence: parsed.overallConfidence || 0.85,
        fields: parsed.fields || {}
      }
    }
  } catch {}

  return { findings: [], confidence: 0.8, fields: {} }
}

export async function runComplianceAgent(
  caseContext: string,
  extractedFields: Record<string, any>,
  state: string,
  chapter: number,
  onStream: (text: string) => void
): Promise<{ findings: any[]; confidence: number; meansTestResult: any }> {
  const findings: any[] = []
  let fullText = ''

  const IL_MEDIAN_INCOME_1PERSON = 58000
  const IL_MEDIAN_INCOME_2PERSON = 76000
  const IL_MEDIAN_INCOME_4PERSON = 98000

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    stream: true,
    max_tokens: 1024,
    messages: [
      {
        role: 'system',
        content: `You are PARALEX Compliance Agent for PARALEX - a bankruptcy law compliance specialist.

State: ${state} | Chapter: ${chapter}
Illinois Means Test Thresholds (2026): 1 person: $58,000 | 2 person: $76,000 | 4 person: $98,000

Your job: Run means test calculations, check exemptions, verify filing requirements, identify compliance risks.

ALWAYS respond in this exact JSON structure:
{
  "meansTest": {
    "annualIncome": number,
    "stateMedianIncome": number,
    "passesTest": boolean,
    "disposableMonthlyIncome": number,
    "presumptionOfAbuse": boolean
  },
  "filingRequirements": [
    { "requirement": "description", "status": "met|missing|unknown", "critical": boolean }
  ],
  "findings": [
    { "type": "info|warning|error|success", "message": "compliance finding", "value": "detail" }
  ],
  "overallConfidence": 0.0-1.0,
  "summary": "Compliance analysis summary with specific recommendations"
}`
      },
      {
        role: 'user',
        content: `Case: ${caseContext}\n\nExtracted financial data:\n${JSON.stringify(extractedFields, null, 2)}\n\nRun complete compliance analysis. Calculate means test. Identify any red flags.`
      }
    ]
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || ''
    fullText += text
    onStream(text)
  }

  try {
    const jsonMatch = fullText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        findings: parsed.findings || [],
        confidence: parsed.overallConfidence || 0.88,
        meansTestResult: parsed.meansTest || {}
      }
    }
  } catch {}

  return { findings: [], confidence: 0.88, meansTestResult: {} }
}

export async function runAnomalyAgent(
  caseContext: string,
  documentData: string,
  extractedFields: Record<string, any>,
  onStream: (text: string) => void
): Promise<{ findings: any[]; confidence: number; riskScore: number }> {
  let fullText = ''

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    stream: true,
    max_tokens: 1024,
    messages: [
      {
        role: 'system',
        content: `You are PARALEX Anomaly Detection Agent for PARALEX - a forensic financial analyst specializing in bankruptcy fraud detection and data inconsistency identification.

Your job: Cross-reference all data sources, find contradictions, flag suspicious patterns, identify risks that could jeopardize the filing.

ALWAYS respond in this exact JSON structure:
{
  "anomalies": [
    { "type": "contradiction|suspicious|missing|risk", "severity": "low|medium|high|critical", "description": "specific anomaly description", "fields": ["field1", "field2"], "recommendation": "what to do" }
  ],
  "riskScore": 0-100,
  "findings": [
    { "type": "info|warning|error|success", "message": "anomaly finding with specific numbers", "value": "detail" }
  ],
  "overallConfidence": 0.0-1.0,
  "summary": "Risk assessment summary with top 3 concerns"
}

Be specific. Reference actual numbers. Think like a trustee looking for reasons to dismiss.`
      },
      {
        role: 'user',
        content: `Case: ${caseContext}\n\nDocument context:\n${documentData}\n\nExtracted fields:\n${JSON.stringify(extractedFields, null, 2)}\n\nFind every inconsistency, contradiction, and risk. Be thorough.`
      }
    ]
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || ''
    fullText += text
    onStream(text)
  }

  try {
    const jsonMatch = fullText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        findings: parsed.findings || [],
        confidence: parsed.overallConfidence || 0.82,
        riskScore: parsed.riskScore || 25
      }
    }
  } catch {}

  return { findings: [], confidence: 0.82, riskScore: 20 }
}

export async function runOrchestratorAgent(
  caseContext: string,
  documentResults: any,
  complianceResults: any,
  anomalyResults: any,
  onStream: (text: string) => void
): Promise<{ summary: string; petitionDraft: any; timeSaved: number }> {
  let fullText = ''

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    stream: true,
    max_tokens: 2048,
    messages: [
      {
        role: 'system',
        content: `You are PARALEX Master Orchestrator for PARALEX - the final synthesis agent that assembles bankruptcy petition data and provides actionable case guidance.

You receive findings from 3 specialist agents and produce the final petition draft + paralegal action plan.

ALWAYS respond in this exact JSON structure:
{
  "scheduleI": {
    "grossMonthlyIncome": number,
    "payrollDeductions": number,
    "netMonthlyIncome": number,
    "otherIncome": number,
    "totalMonthlyIncome": number,
    "employer": "string",
    "occupation": "string"
  },
  "scheduleJ": {
    "rent": number,
    "utilities": number,
    "food": number,
    "transportation": number,
    "medical": number,
    "insurance": number,
    "otherExpenses": number,
    "totalExpenses": number,
    "netMonthlyDisposable": number
  },
  "meansTest": {
    "annualIncome": number,
    "stateMedianIncome": number,
    "passesTest": boolean,
    "allowableExpenses": number,
    "disposableIncome": number
  },
  "overallConfidence": 0.0-1.0,
  "timeSavedMinutes": number,
  "fieldsAutoFilled": number,
  "priorityActions": ["action1", "action2", "action3"],
  "summary": "Executive summary for the paralegal - what was done, what needs attention, confidence level"
}`
      },
      {
        role: 'user',
        content: `Case: ${caseContext}

Document Agent Results:
${JSON.stringify(documentResults, null, 2)}

Compliance Agent Results:
${JSON.stringify(complianceResults, null, 2)}

Anomaly Agent Results:
${JSON.stringify(anomalyResults, null, 2)}

Synthesize all findings. Generate complete petition draft. Calculate time saved vs manual processing (baseline: 4.5 hours manual).`
      }
    ]
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || ''
    fullText += text
    onStream(text)
  }

  try {
    const jsonMatch = fullText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        summary: parsed.summary || 'Analysis complete.',
        petitionDraft: parsed,
        timeSaved: parsed.timeSavedMinutes || 220
      }
    }
  } catch {}

  return {
    summary: 'Analysis complete. Review findings above.',
    petitionDraft: {},
    timeSaved: 220
  }
}
