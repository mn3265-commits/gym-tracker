// Small helpers shared by the serverless handlers.
export const bearer = (req) => (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || null

/** Body is auto-parsed by Vercel for JSON requests; tolerate string bodies too. */
export function body(req) {
  if (req.body && typeof req.body === 'object') return req.body
  try {
    return JSON.parse(req.body || '{}')
  } catch {
    return {}
  }
}
