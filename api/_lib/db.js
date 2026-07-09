// Turso (hosted libSQL / SQLite) client for Vercel serverless functions.
// Credentials come from env — set in Vercel + a local .env.local for `vercel dev`.
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  // Thrown at import time so a misconfigured deploy fails loudly, not silently.
  throw new Error('TURSO_DATABASE_URL is not set')
}

export const db = createClient({ url, authToken })

// Create tables once per warm instance (cheap, idempotent).
let schemaReady = null
export function ready() {
  if (!schemaReady) {
    schemaReady = db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at    TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token      TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS app_state (
        user_id    TEXT PRIMARY KEY,
        data       TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `)
  }
  return schemaReady
}
