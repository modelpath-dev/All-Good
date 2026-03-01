import { getUsers, createUser } from '@/lib/db'

export async function GET() {
  try {
    const users = await getUsers()
    return Response.json({ users })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json()
    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    const user = await createUser(name.trim())
    return Response.json({ user })
  } catch (error) {
    if (error.message?.includes('unique')) {
      return Response.json({ error: 'User already exists' }, { status: 409 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }
}
