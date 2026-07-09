// One-time: create the tables in your Turso database and verify connectivity.
// Reads TURSO_DATABASE_URL / TURSO_AUTH_TOKEN from the environment or .env.local.
import { createClient } from '@libsql/client'
import { readFileSync } from 'node:fs'

// Minimal .env.local loader (no dependency) so `npm run db:init` just works locally.
try {
  for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  /* no .env.local — rely on real env */
}

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
if (!url) {
  console.error('✗ TURSO_DATABASE_URL not set. Set it in .env.local or your shell first.')
  process.exit(1)
}

const db = createClient({ url, authToken })
await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS app_state (
    user_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL
  );
`)
const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
console.log('✓ Connected to Turso and ensured schema. Tables:', tables.rows.map((r) => r.name).join(', '))
