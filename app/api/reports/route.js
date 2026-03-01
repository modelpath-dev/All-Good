import { getReports, deleteReport, renameReport, logActivity } from '@/lib/db'

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return Response.json({ error: 'userId required' }, { status: 400 })
    }
    const reports = await getReports(userId)
    logActivity(ip, 'view_reports', `userId: ${userId}`)
    return Response.json({ reports })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { reportId } = await request.json()
    if (!reportId) {
      return Response.json({ error: 'reportId required' }, { status: 400 })
    }
    await deleteReport(reportId)
    logActivity(ip, 'delete_report', `reportId: ${reportId}`)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { reportId, newName } = await request.json()
    if (!reportId || !newName?.trim()) {
      return Response.json({ error: 'reportId and newName required' }, { status: 400 })
    }
    const report = await renameReport(reportId, newName.trim())
    logActivity(ip, 'rename_report', `reportId: ${reportId}, newName: ${newName.trim()}`)
    return Response.json({ report })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
