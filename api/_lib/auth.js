// Account + session logic (async, Turso-backed). Passwords hashed with scrypt
// from node:crypto — no external auth dependency.
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { db, ready } from './db.js'

function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored || '').split(':')
  if (!saltHex || !hashHex) return false
  const hash = Buffer.from(hashHex, 'hex')
  const test = scryptSync(password, Buffer.from(saltHex, 'hex'), 64)
  return hash.length === test.length && timingSafeEqual(hash, test)
}

const nowISO = () => new Date().toISOString()

async function issueToken(userId) {
  const token = randomBytes(32).toString('hex')
  await db.execute({
    sql: 'INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)',
    args: [token, userId, nowISO()],
  })
  return token
}

/** Create an account and start a session. Returns { user, token } or { error }. */
export async function signup(email, password) {
  await ready()
  email = String(email || '').trim().toLowerCase()
  if (!/\S+@\S+\.\S+/.test(email)) return { error: 'Enter a valid email address.' }
  if (String(password || '').length < 6) return { error: 'Password must be at least 6 characters.' }

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] })
  if (existing.rows.length) return { error: 'An account with this email already exists.' }

  const id = randomUUID()
  await db.execute({
    sql: 'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
    args: [id, email, hashPassword(password), nowISO()],
  })
  const token = await issueToken(id)
  return { user: { id, email }, token }
}

/** Verify credentials and start a session. Returns { user, token } or { error }. */
export async function login(email, password) {
  await ready()
  email = String(email || '').trim().toLowerCase()
  const res = await db.execute({ sql: 'SELECT id, email, password_hash FROM users WHERE email = ?', args: [email] })
  const row = res.rows[0]
  if (!row || !verifyPassword(password, row.password_hash)) {
    return { error: 'Invalid email or password.' }
  }
  const token = await issueToken(row.id)
  return { user: { id: row.id, email: row.email }, token }
}

/** Resolve a bearer token to { id, email } or null. */
export async function userForToken(token) {
  if (!token) return null
  await ready()
  const res = await db.execute({
    sql: 'SELECT u.id AS id, u.email AS email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?',
    args: [token],
  })
  return res.rows[0] || null
}

export async function logout(token) {
  if (!token) return
  await ready()
  await db.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] })
}
