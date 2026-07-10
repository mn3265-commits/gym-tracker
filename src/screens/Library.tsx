import type { ViewModel } from '../store/viewModel'

export function Library({ vm }: { vm: ViewModel }) {
  return (
    <div style={{ padding: '10px 20px 0', animation: 'fadeUp .3s ease both' }}>
      <div style={{ fontFamily: "'Anton'", fontSize: 34, color: '#F4F4F5', textTransform: 'uppercase', lineHeight: 1, marginBottom: 16 }}>Exercises</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 14, margin: '0 -4px' }}>
        {vm.filters.map((f, i) => (
          <button key={i} onClick={f.onTap} style={{ flexShrink: 0, cursor: 'pointer', border: `1px solid ${f.border}`, background: f.bg, color: f.color, fontFamily: "'Archivo'", fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 12, letterSpacing: '.2px' }}>{f.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {vm.libList.map((e, i) => (
          <div key={i} onClick={e.onTap} style={{ cursor: 'pointer', background: '#141417', border: '1px solid #26262c', borderRadius: 16, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: e.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={e.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M6.5 8v8M4 9.5v5M17.5 8v8M20 9.5v5" /></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Archivo'", fontSize: 15, fontWeight: 700, color: '#F4F4F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
                <span style={{ fontFamily: "'Archivo'", fontSize: 9, fontWeight: 800, letterSpacing: '.5px', color: e.roleColor, background: e.roleBg, border: `1px solid ${e.roleBorder}`, padding: '2px 6px', borderRadius: 6 }}>{e.roleLabel}</span>
                <span style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#7d7d86', fontWeight: 500 }}>{e.group} · {e.primary} · {e.equip}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: "'Anton'", fontSize: 17, color: '#F4F4F5', lineHeight: 1 }}>{e.currentNum}</div>
              <div style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#61616a', fontWeight: 700, letterSpacing: '.3px' }}>{e.weightLabel} {e.unitLabel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
