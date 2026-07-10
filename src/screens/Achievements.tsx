import type { ViewModel } from '../store/viewModel'

export function Achievements({ vm }: { vm: ViewModel }) {
  return (
    <div style={{ padding: '6px 20px 0', animation: 'fadeUp .3s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={vm.goYou} style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid #2a2a31', background: '#141417', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4F4F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontFamily: "'Anton'", fontSize: 26, color: '#F4F4F5', textTransform: 'uppercase' }}>Achievements</div>
      </div>
      <div style={{ background: 'linear-gradient(120deg,#1c2408,#101013)', border: '1px solid #2f3d0a', borderRadius: 18, padding: '16px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Archivo'", fontSize: 14, fontWeight: 700, color: '#e9f3c8' }}>{vm.achHint}</div>
        <div style={{ fontFamily: "'Anton'", fontSize: 26, color: '#CCFF00' }}>{vm.achEarned}/{vm.achTotal}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {vm.achievements.map((a, i) => (
          <div key={i} style={{ background: a.bg, border: `1px solid ${a.border}`, borderRadius: 18, padding: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#0f0f12', border: `1px solid ${a.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.d} /></svg>
            </div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 14, fontWeight: 800, color: a.nameColor }}>{a.name}</div>
            <div style={{ fontFamily: "'Archivo'", fontSize: 11, color: '#7d7d86', fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>{a.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
