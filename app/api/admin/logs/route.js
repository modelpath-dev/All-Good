import { getActivityLogs } from '@/lib/db'

export async function GET(request) {
  const key = request.headers.get('x-admin-key')
  if (key !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '200')
  const logs = await getActivityLogs(limit)
  return Response.json({ logs })
}
