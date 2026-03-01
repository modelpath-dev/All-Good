import { getReportById, logActivity } from '@/lib/db'
import { compareReports } from '@/lib/openai'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { reportIdA, reportIdB } = await request.json()

    if (!reportIdA || !reportIdB) {
      return Response.json({ error: 'Two report IDs are required' }, { status: 400 })
    }

    const [reportA, reportB] = await Promise.all([
      getReportById(reportIdA),
      getReportById(reportIdB)
    ])

    if (!reportA || !reportB) {
      return Response.json({ error: 'One or both reports not found' }, { status: 404 })
    }

    if (!reportA.analysis || !reportB.analysis) {
      return Response.json({ error: 'Both reports must be analyzed first' }, { status: 400 })
    }

    const comparison = await compareReports(reportA.analysis, reportB.analysis)

    logActivity(ip, 'compare', `reports: ${reportA.file_name} vs ${reportB.file_name}`)
    return Response.json({ comparison, reportA, reportB })
  } catch (error) {
    console.error('Compare error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
