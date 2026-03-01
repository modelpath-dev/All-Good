import { getReportById, updateReportAnalysis } from '@/lib/db'
import { analyzeReport } from '@/lib/openai'

export async function POST(request) {
  try {
    const { reportId } = await request.json()

    if (!reportId) {
      return Response.json({ error: 'reportId is required' }, { status: 400 })
    }

    const report = await getReportById(reportId)
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 })
    }

    if (report.analysis) {
      return Response.json({ report })
    }

    const analysis = await analyzeReport(report.report_text)
    const updated = await updateReportAnalysis(reportId, analysis)

    return Response.json({ report: updated, analysis })
  } catch (error) {
    console.error('Analyze error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
