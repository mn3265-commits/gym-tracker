import { useEffect, useState } from 'react'
import type { ViewModel } from '../store/viewModel'

/** A text field that commits on blur, so typing never round-trips through the store. */
function TextField({
  value,
  onCommit,
  placeholder,
  suffix,
  inputMode,
  ariaLabel,
}: {
  value: string
  onCommit: (v: string) => void
  placeholder: string
  suffix?: string
  inputMode?: 'text' | 'decimal'
  ariaLabel: string
}) {
  const [text, setText] = useState(value)
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!editing) setText(value)
  }, [value, editing])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f0f12', border: '1px solid #2a2a31', borderRadius: 12, padding: '0 12px' }}>
      <input
        value={text}
        aria-label={ariaLabel}
        placeholder={placeholder}
        inputMode={inputMode ?? 'text'}
        onFocus={() => setEditing(true)}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          setEditing(false)
          onCommit(text.trim())
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: '#F4F4F5', fontFamily: "'Archivo'", fontWeight: 700, fontSize: 15, padding: '13px 0' }}
      />
      {suffix && <span style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#54545c', fontWeight: 700 }}>{suffix}</span>}
    </div>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5', margin: '0 2px 4px' }}>{title}</div>
      {hint && <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#61616a', fontWeight: 500, margin: '0 2px 10px' }}>{hint}</div>}
      {children}
    </div>
  )
}

const chip = (active: boolean): React.CSSProperties => ({
  cursor: 'pointer',
  border: `1px solid ${active ? '#2f3d0a' : '#26262c'}`,
  background: active ? '#1c2408' : '#141417',
  color: active ? '#CCFF00' : '#8a8a93',
  fontFamily: "'Archivo'",
  fontWeight: 800,
  fontSize: 13,
  padding: '10px 0',
  borderRadius: 11,
  flex: 1,
})

export function Settings({ vm }: { vm: ViewModel }) {
  const s = vm.settings
  return (
    <div style={{ padding: '10px 20px 0', animation: 'fadeUp .3s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={s.back} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid #2a2a31', background: '#141417', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4F4F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontFamily: "'Anton'", fontSize: 32, color: '#F4F4F5', textTransform: 'uppercase', lineHeight: 1 }}>Settings</div>
      </div>

      <Section title="Your name" hint={`Shown on Home. Defaults to your account (${s.namePlaceholder}).`}>
        <TextField value={s.name} onCommit={s.setName} placeholder={s.namePlaceholder} ariaLabel="Your name" />
      </Section>

      <Section title="Bodyweight goal" hint="Leave empty if you're not chasing a number.">
        <TextField value={s.goalWeight} onCommit={s.setGoalWeight} placeholder="—" suffix="kg" inputMode="decimal" ariaLabel="Bodyweight goal in kilograms" />
      </Section>

      <Section title="Rest timer" hint="Starts automatically when you check off a set.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {s.restChoices.map((r) => (
            <button key={r.sec} onClick={r.onPick} style={chip(r.active)}>
              {r.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Sessions per week" hint="Drives your weekly ring and streak.">
        <div style={{ display: 'flex', gap: 7 }}>
          {s.weekGoalChoices.map((g) => (
            <button key={g.n} onClick={g.onPick} style={chip(g.active)}>
              {g.n}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Coaching tips">
        <div onClick={s.toggleTips} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: '#141417', border: '1px solid #26262c', borderRadius: 14, padding: '14px 15px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Archivo'", fontSize: 14, fontWeight: 700, color: '#F4F4F5' }}>Show "avoid these" cues</div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#7d7d86', fontWeight: 500 }}>On each exercise's detail page</div>
          </div>
          <div
            role="switch"
            aria-checked={s.showTips}
            style={{ width: 44, height: 26, borderRadius: 13, background: s.showTips ? '#CCFF00' : '#26262c', position: 'relative', flexShrink: 0, transition: 'background .15s' }}
          >
            <div style={{ position: 'absolute', top: 3, left: s.showTips ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: s.showTips ? '#0B0B0D' : '#61616a', transition: 'left .15s' }} />
          </div>
        </div>
      </Section>
    </div>
  )
}
