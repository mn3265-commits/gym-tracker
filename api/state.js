// Per-user state blob (was the Supabase / local `app_state` table).
import { userForToken } from './_lib/auth.js'
import { db, ready } from './_lib/db.js'
import { bearer, body } from './_lib/http.js'

export default async function handler(req, res) {
  const user = await userForToken(bearer(req))
  if (!user) return res.status(401).json({ error: 'Not authenticated.' })

  if (req.method === 'GET') {
    await ready()
    const result = await db.execute({ sql: 'SELECT data FROM app_state WHERE user_id = ?', args: [user.id] })
    const row = result.rows[0]
    return res.status(200).json({ data: row ? JSON.parse(row.data) : null })
  }

  if (req.method === 'PUT') {
    await ready()
    const data = JSON.stringify(body(req).data ?? {})
    await db.execute({
      sql: `INSERT INTO app_state (user_id, data, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
      args: [user.id, data, new Date().toISOString()],
    })
    return res.status(200).json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed.' })
}
