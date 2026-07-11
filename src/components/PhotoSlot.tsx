import { useRef, useState } from 'react'
import { downscaleImage } from '../lib/image'

/**
 * A progress-photo slot. The picked image is downscaled and handed to the store
 * (`onSet`), so it lives in the synced state and follows the user across
 * devices — unlike the old localStorage-only slot. Tap to replace, or clear.
 */
export function PhotoSlot({
  src,
  placeholder,
  onSet,
}: {
  src: string | null
  placeholder: string
  onSet: (dataUrl: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const ingest = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    setBusy(true)
    try {
      onSet(await downscaleImage(file))
    } catch {
      /* ignore a bad image */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          position: 'absolute',
          inset: 0,
          cursor: 'pointer',
          background: src ? '#0b0b0d' : '#141417',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {src ? (
          <img src={src} alt={placeholder} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, textAlign: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#54545c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.6" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ fontFamily: "'Archivo'", fontSize: 11, fontWeight: 600, color: '#61616a', lineHeight: 1.4 }}>{busy ? 'Processing…' : placeholder}</span>
          </div>
        )}
      </div>
      {src && (
        <button
          onClick={() => onSet(null)}
          aria-label={`Remove ${placeholder}`}
          style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 8, border: '1px solid #2a2a31', background: '#0b0b0dcc', color: '#c8c8ce', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => void ingest(e.target.files?.[0])} style={{ display: 'none' }} />
    </div>
  )
}
