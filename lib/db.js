import { neon } from '@neondatabase/serverless'

function getSQL() {
  return neon(process.env.DATABASE_URL)
}

export async function setupDatabase() {
  const sql = getSQL()

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      file_name VARCHAR(255),
      report_text TEXT,
      analysis TEXT,
      comparison TEXT,
      status VARCHAR(20) DEFAULT 'stored',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `

  // Add status column if table already existed without it
  await sql`
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'stored'
  `

  // Backfill: existing reports with analysis should be marked analyzed
  await sql`
    UPDATE reports SET status = 'analyzed' WHERE analysis IS NOT NULL AND (status IS NULL OR status = 'stored')
  `

  await sql`
    INSERT INTO users (name) VALUES ('RAM NARESH UTTAM')
    ON CONFLICT (name) DO NOTHING
  `
}

export async function getUsers() {
  const sql = getSQL()
  const rows = await sql`SELECT * FROM users ORDER BY name`
  return rows
}

export async function createUser(name) {
  const sql = getSQL()
  const rows = await sql`
    INSERT INTO users (name) VALUES (${name})
    RETURNING *
  `
  return rows[0]
}

export async function getReports(userId) {
  const sql = getSQL()
  const rows = await sql`
    SELECT * FROM reports
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return rows
}

export async function getReportById(reportId) {
  const sql = getSQL()
  const rows = await sql`
    SELECT * FROM reports WHERE id = ${reportId}
  `
  return rows[0] || null
}

export async function storeReport({ userId, fileName, reportText }) {
  const sql = getSQL()
  const rows = await sql`
    INSERT INTO reports (user_id, file_name, report_text, status)
    VALUES (${userId}, ${fileName}, ${reportText}, 'stored')
    RETURNING *
  `
  return rows[0]
}

export async function updateReportAnalysis(reportId, analysis) {
  const sql = getSQL()
  const rows = await sql`
    UPDATE reports
    SET analysis = ${analysis}, status = 'analyzed'
    WHERE id = ${reportId}
    RETURNING *
  `
  return rows[0]
}

export async function deleteReport(reportId) {
  const sql = getSQL()
  await sql`DELETE FROM reports WHERE id = ${reportId}`
}

export async function renameReport(reportId, newName) {
  const sql = getSQL()
  const rows = await sql`
    UPDATE reports
    SET file_name = ${newName}
    WHERE id = ${reportId}
    RETURNING *
  `
  return rows[0]
}
