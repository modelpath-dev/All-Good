import { getReports, getReportById, logActivity } from '@/lib/db'
import { chatWithReport } from '@/lib/openai'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { message, userId, reportId, history } = await request.json()

    if (!message || !userId) {
      return Response.json({ error: 'Message and userId required' }, { status: 400 })
    }

    let reportContext = 'No reports available yet.'

    if (reportId) {
      const report = await getReportById(reportId)
      if (report?.analysis) {
        reportContext = `Report (${new Date(report.created_at).toLocaleDateString()}) - ${report.file_name}:\n${report.analysis}`
      }
    } else {
      const reports = await getReports(userId)
      const analyzed = reports.filter(r => r.analysis)
      if (analyzed.length > 0) {
        reportContext = analyzed.map((r, i) =>
          `Report ${i + 1} (${new Date(r.created_at).toLocaleDateString()}) - ${r.file_name}:\n${r.analysis}`
        ).join('\n\n---\n\n')
      }
    }

    const reply = await chatWithReport(message, reportContext, history || [])
    logActivity(ip, 'chat', `msg: ${message.slice(0, 100)}, userId: ${userId}`)
    return Response.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
