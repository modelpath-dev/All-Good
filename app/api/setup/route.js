import { setupDatabase } from '@/lib/db'

export async function POST() {
  try {
    await setupDatabase()
    return Response.json({ success: true })
  } catch (error) {
    console.error('Setup error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
