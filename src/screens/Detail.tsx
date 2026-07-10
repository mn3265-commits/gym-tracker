import { MovementPreview } from '../components/MovementPreview'
import type { ViewModel } from '../store/viewModel'

export function Detail({ vm }: { vm: ViewModel }) {
  const d = vm.detail
  return (
    <div style={{ animation: 'fadeUp .3s ease both' }}>
      <div style={{ padding: '6px 20px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <button onClick={vm.backToLibrary} style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid #2a2a31', background: '#141417', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4F4F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Archivo'", fontSize: 12, fontWeight: 700, color: d.color, letterSpacing: '.8px', textTransform: 'uppercase' }}>{d.group}</span>
            <span style={{ fontFamily: "'Archivo'", fontSize: 9, fontWeight: 800, letterSpacing: '.5px', color: d.roleColor, background: d.roleBg, border: `1px solid ${d.roleBorder}`, padding: '2px 6px', borderRadius: 6 }}>{d.roleLabel}</span>
            <span style={{ fontFamily: "'Archivo'", fontSize: 9, fontWeight: 800, letterSpacing: '.5px', color: '#8a8a93', background: '#1a1a1e', border: '1px solid #2a2a31', padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase' }}>{d.equip}</span>
          </div>
          <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 19, fontWeight: 800, color: '#F4F4F5', lineHeight: 1.05 }}>{d.name}</div>
        </div>
        <div style={{ display: 'flex', background: '#141417', border: '1px solid #26262c', borderRadius: 11, padding: 3, flexShrink: 0 }}>
          <button onClick={d.setKg} style={{ cursor: 'pointer', border: 'none', background: d.unitKgBg, color: d.unitKgColor, fontFamily: "'Archivo'", fontWeight: 800, fontSize: 11, padding: '7px 10px', borderRadius: 8 }}>KG</button>
          <button onClick={d.setLb} style={{ cursor: 'pointer', border: 'none', background: d.unitLbBg, color: d.unitLbColor, fontFamily: "'Archivo'", fontWeight: 800, fontSize: 11, padding: '7px 10px', borderRadius: 8 }}>LB</button>
        </div>
      </div>

      {/* movement preview — animated on this lift's real tempo */}
      <div style={{ padding: '0 20px', display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative', height: 200, borderRadius: 18, overflow: 'hidden', border: '1px solid #2a2a31', background: '#0f0f12' }}>
          <div style={{ position: 'absolute', inset: 0, padding: 10 }}>
            <MovementPreview name={d.performedName} tempo={d.tempo} />
          </div>
          <span
            style={{
              position: 'absolute',
              left: 12,
              bottom: 10,
              fontFamily: "'Archivo'",
              fontSize: 9,
              fontWeight: 700,
              color: '#54545c',
              letterSpacing: '.6px',
            }}
          >
            {d.tempoStr} TEMPO · LOOPING
          </span>
        </div>
        <div style={{ width: 78, flexShrink: 0, background: '#141417', border: '1px solid #26262c', borderRadius: 18, padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Archivo'", fontSize: 9, fontWeight: 700, color: '#7d7d86', letterSpacing: '.6px' }}>TEMPO</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0', alignItems: 'center' }}>
            {d.tempoParts.map((t) => (
              <div key={t.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Anton'", fontSize: 17, color: t.color, lineHeight: 1 }}>{t.sec}</div>
                <div style={{ fontFamily: "'Archivo'", fontSize: 8, fontWeight: 700, color: '#61616a', letterSpacing: '.4px', marginTop: 2 }}>{t.label}</div>
              </div>
            ))}
          </div>
          <span style={{ fontFamily: "'Anton'", fontSize: 13, color: '#CCFF00' }}>{d.tempoStr}</span>
        </div>
      </div>

      {/* target block */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: 'linear-gradient(100deg,#1c2408,#141417)', border: '1px solid #2f3d0a', borderRadius: 18, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'Archivo'", fontSize: 11, fontWeight: 700, color: '#a9c93f', letterSpacing: '.5px', textTransform: 'uppercase' }}>Your next target</div>
              <div style={{ fontFamily: "'Anton'", fontSize: 40, color: '#CCFF00', lineHeight: 1, marginTop: 3 }}>{d.nextStr}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#8a8a93', fontWeight: 600 }}>now {d.currentStr}</div>
              <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#8a8a93', fontWeight: 600 }}>goal {d.goalStr}</div>
            </div>
          </div>
          <div style={{ fontFamily: "'Archivo'", fontSize: 13, color: '#c9d8a0', fontWeight: 500, marginTop: 10 }}>{d.targetHint}</div>
        </div>
      </div>

      {/* swap options */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" /></svg>
          <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5' }}>Can't do it? Swap for</div>
        </div>
        <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#7d7d86', fontWeight: 500, marginBottom: 12 }}>
          {d.swapped ? `Training ${d.performedName} instead — tap to change back.` : "Same muscles, different kit — pick whatever's free."}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {d.alts.map((a, i) => (
            <div
              key={i}
              onClick={a.onPick}
              role="button"
              aria-pressed={a.active}
              style={{ cursor: 'pointer', background: a.bg, border: `1px solid ${a.border}`, borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${a.dotBorder}`, background: 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.dotBg }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Archivo'", fontSize: 14, fontWeight: 700, color: a.nameColor }}>{a.name}</div>
                <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#7d7d86', fontWeight: 500 }}>{a.equip} · {a.note} · {a.weightStr}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* muscles */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5', marginBottom: 10 }}>Muscles worked</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {d.muscles.map((m, i) => (
            <span key={i} style={{ fontFamily: "'Archivo'", fontSize: 12, fontWeight: 700, color: m.color, background: m.bg, border: `1px solid ${m.border}`, padding: '7px 13px', borderRadius: 11 }}>{m.name}</span>
          ))}
        </div>
      </div>

      {/* steps */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5', marginBottom: 12 }}>How to perform</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {d.cues.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: 9, background: '#1c2408', border: '1px solid #2f3d0a', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Anton'", fontSize: 13, color: '#CCFF00' }}>{c.n}</div>
              <div style={{ fontFamily: "'Archivo'", fontSize: 14, lineHeight: 1.5, color: '#c8c8ce', fontWeight: 500, paddingTop: 2 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* mistakes */}
      {vm.showTips && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5', marginBottom: 12 }}>Avoid these</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {d.mistakes.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: '#141417', border: '1px solid #26262c', borderRadius: 13, padding: '12px 14px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6A2C" strokeWidth="2.2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
                <span style={{ fontFamily: "'Archivo'", fontSize: 13, lineHeight: 1.45, color: '#b4b4ba', fontWeight: 500 }}>{m.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
