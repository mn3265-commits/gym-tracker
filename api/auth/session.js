import { userForToken } from '../_lib/auth.js'
import { bearer } from '../_lib/http.js'

export default async function handler(req, res) {
  const user = await userForToken(bearer(req))
  res.status(200).json({ user: user || null })
}
