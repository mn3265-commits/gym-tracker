import { logout } from '../_lib/auth.js'
import { bearer } from '../_lib/http.js'

export default async function handler(req, res) {
  await logout(bearer(req))
  res.status(200).json({ ok: true })
}
