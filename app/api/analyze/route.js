import { getReportById, updateReportAnalysis, logActivity } from '@/lib/db'
import { analyzeReport } from '@/lib/openai'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { reportId } = await request.json()

    if (!reportId) {
      return Response.json({ error: 'reportId is required' }, { status: 400 })
    }

    const report = await getReportById(reportId)
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 })
    }

    if (report.analysis) {
      logActivity(ip, 'analyze', `reportId: ${reportId} (cached)`)
      return Response.json({ report })
    }

    const analysis = await analyzeReport(report.report_text)
    const updated = await updateReportAnalysis(reportId, analysis)

    logActivity(ip, 'analyze', `reportId: ${reportId}, file: ${report.file_name}`)
    return Response.json({ report: updated, analysis })
  } catch (error) {
    console.error('Analyze error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
