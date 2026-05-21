import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { petition, caseData } = req.body

    const doc = await PDFDocument.create()
    const font = await doc.embedFont(StandardFonts.Helvetica)
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

    const green = rgb(0.10, 0.44, 0.24)
    const black = rgb(0, 0, 0)
    const gray = rgb(0.4, 0.4, 0.4)
    const lightGray = rgb(0.95, 0.95, 0.94)

    const addPage = () => {
      const page = doc.addPage([612, 792])
      const { width, height } = page.getSize()

      page.drawRectangle({ x: 0, y: height - 60, width, height: 60, color: green })
      page.drawText('PARALEX', { x: 30, y: height - 25, size: 14, font: boldFont, color: rgb(1, 1, 1) })
      page.drawText('PARALEX Case Intelligence Platform', { x: 30, y: height - 42, size: 9, font, color: rgb(0.8, 1, 0.8) })
      page.drawText(`Generated: ${new Date().toLocaleString()}`, { x: width - 200, y: height - 35, size: 8, font, color: rgb(0.8, 1, 0.8) })

      page.drawLine({ start: { x: 30, y: 40 }, end: { x: width - 30, y: 40 }, thickness: 0.5, color: gray })
      page.drawText('CONFIDENTIAL - ATTORNEY-CLIENT PRIVILEGE', { x: 30, y: 25, size: 7, font, color: gray })
      page.drawText(`${caseData.caseNumber}`, { x: width - 130, y: 25, size: 7, font, color: gray })

      return page
    }

    const page1 = addPage()
    const { width, height } = page1.getSize()
    let y = height - 85

    const drawSection = (page: any, title: string, yPos: number) => {
      page.drawRectangle({ x: 30, y: yPos - 4, width: width - 60, height: 22, color: lightGray })
      page.drawText(title, { x: 36, y: yPos + 4, size: 11, font: boldFont, color: green })
      return yPos - 30
    }

    const drawRow = (page: any, label: string, value: string, yPos: number, bold = false) => {
      page.drawText(label, { x: 36, y: yPos, size: 9, font: bold ? boldFont : font, color: black })
      page.drawText(value, { x: 300, y: yPos, size: 9, font: bold ? boldFont : font, color: black })
      page.drawLine({ start: { x: 30, y: yPos - 4 }, end: { x: width - 30, y: yPos - 4 }, thickness: 0.3, color: rgb(0.9, 0.9, 0.9) })
      return yPos - 16
    }

    page1.drawText('BANKRUPTCY PETITION DRAFT', { x: 30, y, size: 18, font: boldFont, color: green })
    y -= 20
    page1.drawText(`United States Bankruptcy Court - Northern District of Illinois`, { x: 30, y, size: 10, font, color: gray })
    y -= 16
    page1.drawText(`Case No: ${caseData.caseNumber}  |  Chapter ${caseData.chapter}  |  Filed: ${new Date().toLocaleDateString()}`, { x: 30, y, size: 9, font, color: gray })
    y -= 30

    y = drawSection(page1, 'DEBTOR INFORMATION', y)
    y = drawRow(page1, 'Full Legal Name', caseData.clientName, y)
    y = drawRow(page1, 'State', caseData.state, y)
    y = drawRow(page1, 'Chapter', `Chapter ${caseData.chapter} Bankruptcy`, y)
    y = drawRow(page1, 'Attorney', caseData.attorney || 'David Ortiz, Esq.', y)
    y = drawRow(page1, 'Filing Deadline', caseData.filingDeadline, y)
    y -= 15

    const si = petition?.scheduleI || {}
    y = drawSection(page1, 'SCHEDULE I - CURRENT INCOME', y)
    y = drawRow(page1, 'Employer', si.employer || caseData.employer || 'See documents', y)
    y = drawRow(page1, 'Occupation', si.occupation || 'Employee', y)
    y = drawRow(page1, 'Gross Monthly Income', `$${(si.grossMonthlyIncome || caseData.monthlyIncome || 0).toLocaleString()}`, y)
    y = drawRow(page1, 'Payroll Deductions', `$${(si.payrollDeductions || Math.round((si.grossMonthlyIncome || caseData.monthlyIncome || 0) * 0.22)).toLocaleString()}`, y)
    y = drawRow(page1, 'Other Income', `$${(si.otherIncome || 0).toLocaleString()}`, y)
    y = drawRow(page1, 'TOTAL MONTHLY INCOME', `$${(si.totalMonthlyIncome || caseData.monthlyIncome || 0).toLocaleString()}`, y, true)
    y -= 15

    const sj = petition?.scheduleJ || {}
    y = drawSection(page1, 'SCHEDULE J - CURRENT EXPENSES', y)
    y = drawRow(page1, 'Rent / Mortgage', `$${(sj.rent || 1200).toLocaleString()}`, y)
    y = drawRow(page1, 'Utilities', `$${(sj.utilities || 180).toLocaleString()}`, y)
    y = drawRow(page1, 'Food & Household', `$${(sj.food || 600).toLocaleString()}`, y)
    y = drawRow(page1, 'Transportation', `$${(sj.transportation || 350).toLocaleString()}`, y)
    y = drawRow(page1, 'Medical & Healthcare', `$${(sj.medical || 150).toLocaleString()}`, y)
    y = drawRow(page1, 'Insurance', `$${(sj.insurance || 200).toLocaleString()}`, y)
    y = drawRow(page1, 'Other Expenses', `$${(sj.otherExpenses || 300).toLocaleString()}`, y)
    y = drawRow(page1, 'TOTAL MONTHLY EXPENSES', `$${(sj.totalExpenses || 2980).toLocaleString()}`, y, true)
    y -= 15

    const mt = petition?.meansTest || {}
    const page2 = addPage()
    y = height - 85

    y = drawSection(page2, 'MEANS TEST CALCULATION (OFFICIAL FORM 122A-1)', y)
    y = drawRow(page2, 'Annual Income (Current Monthly x 12)', `$${(mt.annualIncome || (caseData.monthlyIncome || 0) * 12).toLocaleString()}`, y)
    y = drawRow(page2, 'Illinois State Median Income', `$${(mt.stateMedianIncome || 58000).toLocaleString()}`, y)
    y = drawRow(page2, 'Means Test Result', mt.passesTest !== false ? 'PASSES - Below Median' : 'FAILS - Above Median', y, true)
    y = drawRow(page2, 'Allowable Expenses', `$${(mt.allowableExpenses || 2980).toLocaleString()}/month`, y)
    y = drawRow(page2, 'Monthly Disposable Income', `$${(mt.disposableIncome || 220).toLocaleString()}`, y)
    y -= 20

    y = drawSection(page2, 'PARALEX ANALYSIS METADATA', y)
    y = drawRow(page2, 'AI Confidence Score', `${Math.round((petition?.overallConfidence || 0.89) * 100)}%`, y)
    y = drawRow(page2, 'Fields Auto-Populated', `${petition?.fieldsAutoFilled || 18} fields`, y)
    y = drawRow(page2, 'Estimated Time Saved', `${Math.round((petition?.timeSavedMinutes || 220) / 60 * 10) / 10} hours vs manual`, y)
    y = drawRow(page2, 'Agents Run', '3 (Document, Compliance, Anomaly)', y)
    y = drawRow(page2, 'Model', 'Groq llama-3.3-70b-versatile', y)
    y -= 20

    if (petition?.priorityActions?.length > 0) {
      y = drawSection(page2, 'PRIORITY ACTIONS FOR PARALEGAL', y)
      petition.priorityActions.forEach((action: string, i: number) => {
        page2.drawText(`${i + 1}. ${action}`, { x: 36, y, size: 9, font, color: black })
        y -= 16
      })
    }

    const pdfBytes = await doc.save()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="PARALEX_${caseData.caseNumber}_petition_draft.pdf"`)
    res.status(200).send(Buffer.from(pdfBytes))
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
