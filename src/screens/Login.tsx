import { useState } from 'react'
import { useAuth } from '../store/auth'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canSubmit = /\S+@\S+\.\S+/.test(email) && password.length >= 6 && !busy

  async function submit() {
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      if (mode === 'in') {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      } else {
        const { error, needsConfirmation } = await signUp(email, password)
        if (error) setError(error.message)
        else if (needsConfirmation) setNotice('Account created — check your email to confirm, then log in.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px', overflowY: 'auto' }}>
      {/* On signup the headline reads BUILD, NOT BOUGHT — it is the wordmark, so don't repeat it. */}
      {mode === 'in' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12h16M6.5 8v8M4 9.5v5M17.5 8v8M20 9.5v5" />
          </svg>
          <span style={{ fontFamily: "'Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5', letterSpacing: '1.5px' }}>BUILDNOTBOUGHT</span>
        </div>
      )}
      <div style={{ fontFamily: "'Anton'", fontSize: 44, color: '#F4F4F5', textTransform: 'uppercase', lineHeight: 0.98, marginBottom: 6 }}>
        {mode === 'in' ? 'Welcome back' : (
          <>
            Build,<br />not bought
          </>
        )}
      </div>
      <div style={{ fontFamily: "'Archivo'", fontSize: 14, color: '#8a8a93', fontWeight: 500, marginBottom: 26 }}>
        {mode === 'in' ? 'Log in to sync your training across devices.' : 'Create an account — your data follows you everywhere.'}
      </div>

      <label style={{ fontFamily: "'Archivo'", fontSize: 11, fontWeight: 700, color: '#7d7d86', letterSpacing: '.4px', textTransform: 'uppercase' }}>Email</label>
      <input
        type="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        style={inputStyle}
      />

      <label style={{ fontFamily: "'Archivo'", fontSize: 11, fontWeight: 700, color: '#7d7d86', letterSpacing: '.4px', textTransform: 'uppercase', marginTop: 14, display: 'block' }}>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
        placeholder="At least 6 characters"
        style={inputStyle}
      />

      {error && (
        <div style={{ marginTop: 14, background: '#241408', border: '1px solid #3d2a0a', borderRadius: 12, padding: '11px 14px', fontFamily: "'Archivo'", fontSize: 13, color: '#f0b088', fontWeight: 600 }}>{error}</div>
      )}
      {notice && (
        <div style={{ marginTop: 14, background: '#0f2417', border: '1px solid #1e4a2f', borderRadius: 12, padding: '11px 14px', fontFamily: "'Archivo'", fontSize: 13, color: '#8fe3b3', fontWeight: 600 }}>{notice}</div>
      )}

      <button
        onClick={submit}
        disabled={!canSubmit}
        style={{
          marginTop: 22,
          width: '100%',
          border: 'none',
          cursor: canSubmit ? 'pointer' : 'default',
          background: canSubmit ? '#CCFF00' : '#1f2410',
          color: canSubmit ? '#0B0B0D' : '#5c6633',
          fontFamily: "'Archivo Expanded','Archivo'",
          fontWeight: 800,
          fontSize: 16,
          padding: 17,
          borderRadius: 16,
        }}
      >
        {busy ? 'Please wait…' : mode === 'in' ? 'LOG IN' : 'CREATE ACCOUNT'}
      </button>

      <div style={{ marginTop: 18, textAlign: 'center', fontFamily: "'Archivo'", fontSize: 13, color: '#8a8a93', fontWeight: 500 }}>
        {mode === 'in' ? "Don't have an account? " : 'Already have an account? '}
        <span
          onClick={() => {
            setMode(mode === 'in' ? 'up' : 'in')
            setError(null)
            setNotice(null)
          }}
          style={{ cursor: 'pointer', color: '#CCFF00', fontWeight: 800 }}
        >
          {mode === 'in' ? 'Sign up' : 'Log in'}
        </span>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 8,
  background: '#0f0f12',
  border: '1px solid #33333b',
  borderRadius: 12,
  padding: '14px 16px',
  color: '#F4F4F5',
  fontFamily: "'Archivo'",
  fontSize: 16,
  fontWeight: 600,
  outline: 'none',
}
