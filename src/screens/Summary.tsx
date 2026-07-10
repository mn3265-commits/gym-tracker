import { BodyFigure } from '../components/BodyFigure'
import type { ViewModel } from '../store/viewModel'

export function Summary({ vm }: { vm: ViewModel }) {
  const s = vm.summary
  if (!s) return null
  return (
    <div style={{ padding: '10px 20px 0', animation: 'fadeUp .3s ease both' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 0 18px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${s.color}22`, border: `1px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <div style={{ fontFamily: "'Archivo'", fontSize: 12, fontWeight: 700, color: s.color, letterSpacing: '1.2px', textTransform: 'uppercase' }}>{s.type} Day · Complete</div>
        <div style={{ fontFamily: "'Anton'", fontSize: 30, color: '#F4F4F5', textTransform: 'uppercase', lineHeight: 1.1, marginTop: 6, maxWidth: 300 }}>{s.headline}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Anton'", fontSize: 22, color: '#F4F4F5' }}>{s.durationStr}</div>
          <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#7d7d86', fontWeight: 700, marginTop: 4, letterSpacing: '.3px' }}>DURATION</div>
        </div>
        <div style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Anton'", fontSize: 22, color: '#F4F4F5' }}>{s.volumeStr}</div>
          <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#7d7d86', fontWeight: 700, marginTop: 4, letterSpacing: '.3px' }}>VOLUME</div>
        </div>
        <div style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Anton'", fontSize: 22, color: '#CCFF00' }}>{s.hitCount}/{s.exerciseCount}</div>
          <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#7d7d86', fontWeight: 700, marginTop: 4, letterSpacing: '.3px' }}>TARGETS HIT</div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(120deg,#1c2408,#101013)', border: '1px solid #2f3d0a', borderRadius: 18, padding: '16px 18px', marginBottom: 16 }}>
        {s.leveledUp && (
          <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', background: '#CCFF00', color: '#0B0B0D', fontFamily: "'Anton'", fontSize: 14, padding: '4px 11px', borderRadius: 8, letterSpacing: '1px', marginBottom: 12 }}>⚡ RANK UP → {s.newRank}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 11, fontWeight: 700, color: '#a9c93f', letterSpacing: '.5px', textTransform: 'uppercase' }}>XP earned</div>
            <div style={{ fontFamily: "'Anton'", fontSize: 40, color: '#CCFF00', lineHeight: 1, marginTop: 2 }}>+{s.xpGained}</div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: "'Archivo'", fontSize: 12, color: '#8a8a93', fontWeight: 600 }}>Next: {s.rankNext}</div>
        </div>
        <div style={{ height: 7, borderRadius: 5, background: '#26262c', overflow: 'hidden' }}><div style={{ height: '100%', width: s.rankPct, background: 'linear-gradient(90deg,#a9c93f,#CCFF00)', borderRadius: 5 }} /></div>
      </div>

      <div style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <BodyFigure zones={s.bodyFront} width={58} height={119} />
        <BodyFigure zones={s.bodyBack} width={58} height={119} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5' }}>Muscles trained</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: '#CCFF00', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Archivo'", fontSize: 11, color: '#9a9aa2', fontWeight: 600 }}>Trained this session</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: '#1c1c20', border: '1px solid #2a2a31', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Archivo'", fontSize: 11, color: '#9a9aa2', fontWeight: 600 }}>Not reached</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5', margin: '6px 2px 12px' }}>{s.setsDone}/{s.setsPlanned} sets logged</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
        {s.exercises.map((e, i) => (
          <div key={i} style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 15, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Archivo'", fontSize: 14, fontWeight: 700, color: '#F4F4F5' }}>{e.name}</div>
              <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#7d7d86', fontWeight: 500, marginTop: 1 }}>{e.equip} · {e.setsStr}</div>
            </div>
            <span style={{ fontFamily: "'Archivo'", fontSize: 10, fontWeight: 800, letterSpacing: '.5px', color: e.color, background: e.bg, border: `1px solid ${e.border}`, padding: '5px 9px', borderRadius: 8, flexShrink: 0 }}>{e.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <button onClick={vm.saveSummaryImage} style={{ flex: 1, border: '1px solid #33333b', cursor: 'pointer', background: '#17171b', color: '#F4F4F5', fontFamily: "'Archivo Expanded','Archivo'", fontWeight: 800, fontSize: 15, padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3M8 7l4-4 4 4M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></svg>
          {vm.sharing ? 'Saving…' : 'Save image'}
        </button>
        <button onClick={vm.closeSummary} style={{ flex: 1, border: 'none', cursor: 'pointer', background: '#CCFF00', color: '#0B0B0D', fontFamily: "'Archivo Expanded','Archivo'", fontWeight: 800, fontSize: 15, padding: 16, borderRadius: 16 }}>DONE</button>
      </div>
      <div style={{ fontFamily: "'Archivo'", fontSize: 11, color: '#54545c', fontWeight: 500, textAlign: 'center', marginBottom: 10 }}>Saves a transparent PNG — drop it straight onto your Instagram story.</div>

      {/* hidden share card (transparent PNG export target) */}
      <div style={{ position: 'absolute', left: -9999, top: 0 }}>
        <div id="share-card" style={{ position: 'relative', width: 440, background: 'linear-gradient(165deg,#191920,#0a0a0c)', border: `2px solid ${s.color}`, borderRadius: 36, boxSizing: 'border-box', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -90, right: -70, width: 300, height: 300, borderRadius: '50%', background: s.color, filter: 'blur(72px)', opacity: 0.22 }} />
          <div style={{ position: 'absolute', bottom: -70, left: -60, width: 220, height: 220, borderRadius: '50%', background: '#CCFF00', filter: 'blur(70px)', opacity: 0.1 }} />
          <div style={{ position: 'relative', padding: '34px 32px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M6.5 8v8M4 9.5v5M17.5 8v8M20 9.5v5" /></svg>
                <span style={{ fontFamily: "'Archivo'", fontSize: 13, fontWeight: 800, color: '#F4F4F5', letterSpacing: '1.5px' }}>BUILDNOTBOUGHT</span>
              </div>
              <span style={{ display: 'inline-block', transform: 'rotate(-3deg)', transformOrigin: 'center', marginRight: 3, background: s.color, color: '#0B0B0D', fontFamily: "'Anton'", fontSize: 12, padding: '5px 10px', borderRadius: 8, letterSpacing: '1px' }}>COMPLETE</span>
            </div>

            <div style={{ fontFamily: "'Archivo'", fontSize: 12, fontWeight: 700, color: s.color, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 2 }}>{s.dateStr}</div>
            <div style={{ fontFamily: "'Anton'", fontSize: 64, lineHeight: 0.86, color: '#F4F4F5', textTransform: 'uppercase' }}>{s.type} <span style={{ color: s.color }}>Day</span></div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 14, fontWeight: 600, color: '#a9c93f', marginTop: 8 }}>{s.headline}</div>

            <div style={{ margin: '26px 0 22px' }}>
              <div style={{ fontFamily: "'Anton'", fontSize: 82, lineHeight: 0.82, color: '#CCFF00' }}>{s.volumeStr}</div>
              <div style={{ fontFamily: "'Archivo'", fontSize: 12, fontWeight: 800, letterSpacing: '2.5px', color: '#7d7d86', marginTop: 4 }}>TOTAL VOLUME MOVED</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
              <div style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 16, padding: '15px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Anton'", fontSize: 26, color: '#F4F4F5' }}>{s.durationStr}</div>
                <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#7d7d86', fontWeight: 800, marginTop: 4, letterSpacing: '.5px' }}>TIME</div>
              </div>
              <div style={{ background: '#141417', border: '1px solid #2f3d0a', borderRadius: 16, padding: '15px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Anton'", fontSize: 26, color: '#CCFF00' }}>{s.hitCount}/{s.exerciseCount}</div>
                <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#a9c93f', fontWeight: 800, marginTop: 4, letterSpacing: '.5px' }}>TARGETS</div>
              </div>
              <div style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 16, padding: '15px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Anton'", fontSize: 26, color: '#F4F4F5' }}>{s.setsDone}</div>
                <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#7d7d86', fontWeight: 800, marginTop: 4, letterSpacing: '.5px' }}>SETS</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#101013', border: '1px solid #26262c', borderRadius: 20, padding: '18px 22px' }}>
              <BodyFigure zones={s.bodyFront} width={64} height={132} />
              <BodyFigure zones={s.bodyBack} width={64} height={132} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Anton'", fontSize: 20, color: '#F4F4F5', textTransform: 'uppercase', lineHeight: 1 }}>Muscles<br />Hit</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 3, background: '#CCFF00' }} />
                  <span style={{ fontFamily: "'Archivo'", fontSize: 11, color: '#9a9aa2', fontWeight: 600 }}>Trained</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #26262c', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Anton'", fontSize: 18, color: '#F4F4F5', letterSpacing: '.5px' }}>BUILT, NOT BOUGHT</span>
              <span style={{ fontFamily: "'Anton'", fontSize: 18, color: s.color }}>↗</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
