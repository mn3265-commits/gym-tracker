import { signup } from '../_lib/auth.js'
import { body } from '../_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
  const { email, password } = body(req)
  const result = await signup(email, password)
  if (result.error) return res.status(400).json(result)
  res.status(200).json(result) // { user, token }
}
