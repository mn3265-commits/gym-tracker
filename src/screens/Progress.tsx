import type { ViewModel } from '../store/viewModel'

export function Progress({ vm }: { vm: ViewModel }) {
  return (
    <div style={{ padding: '10px 20px 0', animation: 'fadeUp .3s ease both' }}>
      <div style={{ fontFamily: "'Anton'", fontSize: 34, color: '#F4F4F5', textTransform: 'uppercase', lineHeight: 1, marginBottom: 16 }}>Progress</div>

      {/* selected exercise card */}
      <div style={{ background: 'linear-gradient(150deg,#1b1b20,#101013)', border: '1px solid #2a2a31', borderRadius: 22, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 12, fontWeight: 700, color: vm.prog.color, letterSpacing: '.6px', textTransform: 'uppercase' }}>{vm.prog.group}</div>
            <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 20, fontWeight: 800, color: '#F4F4F5' }}>{vm.prog.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Anton'", fontSize: 30, color: '#CCFF00', lineHeight: 1 }}>{vm.prog.pct}</div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#7d7d86', fontWeight: 700, letterSpacing: '.3px' }}>TO GOAL</div>
          </div>
        </div>

        {/* chart — real logged top sets, or an honest empty state */}
        {vm.prog.hasCurve ? (
          <svg viewBox="0 0 300 130" preserveAspectRatio="none" style={{ width: '100%', height: 130, margin: '14px 0 6px', overflow: 'visible' }}>
            <line x1="0" y1={vm.prog.goalY} x2="300" y2={vm.prog.goalY} stroke="#CCFF00" strokeWidth="1.2" strokeDasharray="5 5" opacity=".55" />
            <polyline points={vm.prog.areaPts} fill="#CCFF0018" stroke="none" />
            <polyline points={vm.prog.linePts} fill="none" stroke="#CCFF00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            {vm.prog.dots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r="3.4" fill="#0B0B0D" stroke="#CCFF00" strokeWidth="2.2" />
            ))}
          </svg>
        ) : (
          <div
            style={{
              height: 130,
              margin: '14px 0 6px',
              borderRadius: 14,
              border: '1px dashed #2f3d0a',
              background: '#0f0f12',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '0 22px',
              textAlign: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5c6b28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l6-6 4 4 7-7" />
            </svg>
            <span style={{ fontFamily: "'Archivo'", fontSize: 12, fontWeight: 600, color: '#61616a', lineHeight: 1.45 }}>{vm.prog.emptyHint}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Archivo'", fontSize: 10, color: '#61616a', fontWeight: 600, marginTop: 2 }}>
          <span>start {vm.prog.startStr}</span>
          <span>{vm.prog.sessionCount > 0 ? `best e1RM ${vm.prog.bestE1rmStr}` : `${vm.prog.sessionCount} sessions`}</span>
          <span style={{ color: '#a9c93f' }}>goal {vm.prog.goalStr}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
          <div style={{ background: '#0f0f12', border: '1px solid #26262c', borderRadius: 13, padding: 11 }}>
            <div style={{ fontFamily: "'Anton'", fontSize: 19, color: '#F4F4F5', lineHeight: 1 }}>{vm.prog.currentStr}</div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#7d7d86', fontWeight: 700, marginTop: 4 }}>{vm.prog.currentLabel}</div>
          </div>
          <div style={{ background: '#0f0f12', border: '1px solid #2f3d0a', borderRadius: 13, padding: 11 }}>
            <div style={{ fontFamily: "'Anton'", fontSize: 19, color: '#CCFF00', lineHeight: 1 }}>{vm.prog.nextStr}</div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#a9c93f', fontWeight: 700, marginTop: 4 }}>NEXT UP</div>
          </div>
          <div style={{ background: '#0f0f12', border: '1px solid #26262c', borderRadius: 13, padding: 11 }}>
            <div style={{ fontFamily: "'Anton'", fontSize: 19, color: vm.prog.trained ? '#F4F4F5' : '#54545c', lineHeight: 1 }}>{vm.prog.gainedStr}</div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#7d7d86', fontWeight: 700, marginTop: 4 }}>GAINED KG</div>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5', margin: '20px 2px 12px' }}>All lifts</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {vm.progList.map((p, i) => (
          <div key={i} onClick={p.onTap} style={{ cursor: 'pointer', background: '#141417', border: `1px solid ${p.cardBorder}`, borderRadius: 15, padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontFamily: "'Archivo'", fontSize: 14, fontWeight: 700, color: '#F4F4F5' }}>{p.name}</span>
              <span style={{ fontFamily: "'Archivo'", fontSize: 12, fontWeight: 700, color: '#8a8a93' }}>{p.currentStr} → <span style={{ color: '#CCFF00' }}>{p.goalStr}</span></span>
            </div>
            <div style={{ height: 6, borderRadius: 5, background: '#26262c', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: p.pct, background: p.color, borderRadius: 5 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
