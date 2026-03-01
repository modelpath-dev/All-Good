import { getUsers, createUser, logActivity } from '@/lib/db'

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    logActivity(ip, 'app_open', 'loaded users')
    const users = await getUsers()
    return Response.json({ users })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { name } = await request.json()
    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    const user = await createUser(name.trim())
    logActivity(ip, 'add_patient', `name: ${name.trim()}`)
    return Response.json({ user })
  } catch (error) {
    if (error.message?.includes('unique')) {
      return Response.json({ error: 'User already exists' }, { status: 409 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }
}
