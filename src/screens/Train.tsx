import { BodyFigure } from '../components/BodyFigure'
import { useEffect, useState } from 'react'
import type { ViewModel } from '../store/viewModel'

export function Train({ vm }: { vm: ViewModel }) {
  return (
    <div style={{ animation: 'fadeUp .3s ease both' }}>
      {vm.trainPreview && <TrainPreview vm={vm} />}
      {vm.trainLive && vm.workout && <TrainLive vm={vm} />}
    </div>
  )
}

function TrainPreview({ vm }: { vm: ViewModel }) {
  return (
    <div style={{ padding: '12px 20px 0' }}>
      <div style={{ fontFamily: "'Archivo'", fontSize: 12, fontWeight: 700, color: vm.today.trainColor, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 2 }}>Ready · {vm.today.dayLong}</div>
      <div style={{ fontFamily: "'Anton'", fontSize: 44, color: '#F4F4F5', textTransform: 'uppercase', lineHeight: 1, marginBottom: 18 }}>{vm.today.trainType} Day</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
        {vm.today.exercises.map((e, i) => (
          <div key={i} style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: e.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Anton'", color: vm.today.color, fontSize: 16 }}>{e.num}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: "'Archivo'", fontSize: 15, fontWeight: 700, color: '#F4F4F5' }}>{e.name}</span>
                <span style={{ fontFamily: "'Archivo'", fontSize: 9, fontWeight: 800, letterSpacing: '.5px', color: e.roleColor, background: e.roleBg, border: `1px solid ${e.roleBorder}`, padding: '2px 6px', borderRadius: 6 }}>{e.roleLabel}</span>
              </div>
              <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#7d7d86', fontWeight: 500, marginTop: 2 }}>{e.scheme} · target {e.nextStr}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#54545c" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        ))}
      </div>
      <button onClick={vm.startWorkout} style={{ width: '100%', border: 'none', cursor: 'pointer', background: '#CCFF00', color: '#0B0B0D', fontFamily: "'Archivo Expanded','Archivo'", fontWeight: 800, fontSize: 16, padding: 17, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#0B0B0D"><path d="M8 5v14l11-7z" /></svg> START {vm.today.trainType.toUpperCase()} DAY
      </button>
    </div>
  )
}

function TrainLive({ vm }: { vm: ViewModel }) {
  const w = vm.workout!
  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'linear-gradient(#0B0B0D,#0B0B0Dee 80%,transparent)', padding: '8px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Archivo'", fontSize: 11, fontWeight: 700, color: vm.today.color, letterSpacing: '1.2px', textTransform: 'uppercase' }}>{vm.today.type} Day · Live</div>
          <div style={{ fontFamily: "'Anton'", fontSize: 32, color: '#F4F4F5', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#3DDC84', animation: 'pulseDot 1.4s infinite' }} />
            {w.clock}
          </div>
        </div>
        <button onClick={vm.finishWorkout} style={{ border: '1px solid #33333b', background: '#17171b', cursor: 'pointer', color: '#F4F4F5', fontFamily: "'Archivo'", fontWeight: 700, fontSize: 13, padding: '11px 18px', borderRadius: 13 }}>Finish</button>
      </div>

      {/* muscle map */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <BodyFigure zones={vm.trainBodyFront} width={52} height={107} />
          <BodyFigure zones={vm.trainBodyBack} width={52} height={107} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Archivo Expanded','Archivo'", fontSize: 14, fontWeight: 800, color: '#F4F4F5' }}>Muscles worked today</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: '#CCFF00', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Archivo'", fontSize: 11, color: '#9a9aa2', fontWeight: 600 }}>Worked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: '#1c1c2a', border: '1.4px dashed #CCFF00', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Archivo'", fontSize: 11, color: '#9a9aa2', fontWeight: 600 }}>Up next</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {w.exercises.map((ex, ei) => (
          <div key={ei} style={{ background: '#141417', border: '1px solid #26262c', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ padding: '15px 17px 13px' }}>
              {/* title on its own line, so a long name never fights the controls */}
              <div onClick={ex.onOpen} style={{ cursor: 'pointer', minWidth: 0, marginBottom: 9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: "'Archivo'", fontSize: 16, fontWeight: 800, color: '#F4F4F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.displayName}</span>
                  <span style={{ flexShrink: 0, fontFamily: "'Archivo'", fontSize: 9, fontWeight: 800, letterSpacing: '.5px', color: ex.roleColor, background: ex.roleBg, border: `1px solid ${ex.roleBorder}`, padding: '2px 6px', borderRadius: 6 }}>{ex.roleLabel}</span>
                </div>
                <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#7d7d86', fontWeight: 500, marginTop: 2 }}>{ex.doneCount}/{ex.setCount} sets · {ex.equip} · {ex.subNote}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', background: '#0f0f12', border: '1px solid #26262c', borderRadius: 9, padding: 2, flexShrink: 0 }}>
                  <button onClick={ex.setKg} style={{ cursor: 'pointer', border: 'none', background: ex.unitKgBg, color: ex.unitKgColor, fontFamily: "'Archivo'", fontWeight: 800, fontSize: 10, padding: '6px 8px', borderRadius: 7 }}>KG</button>
                  <button onClick={ex.setLb} style={{ cursor: 'pointer', border: 'none', background: ex.unitLbBg, color: ex.unitLbColor, fontFamily: "'Archivo'", fontWeight: 800, fontSize: 10, padding: '6px 8px', borderRadius: 7 }}>LB</button>
                </div>
                <button onClick={ex.onSwap} style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', border: `1px solid ${ex.swapBorder}`, background: ex.swapBg, color: ex.swapColor, fontFamily: "'Archivo'", fontWeight: 700, fontSize: 11, padding: '8px 11px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 5, letterSpacing: '.3px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" /></svg>SWAP
                </button>
                <button
                  onClick={ex.onRemoveExercise}
                  aria-label={`Remove ${ex.displayName} from this workout`}
                  title="Remove from this workout"
                  style={{ flexShrink: 0, cursor: 'pointer', border: '1px solid #2a2a31', background: '#0f0f12', color: '#7d5560', borderRadius: 10, padding: '8px 9px', display: 'flex', alignItems: 'center' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              {ex.swapOpen && (
                <div style={{ marginTop: 12, background: '#0f0f12', border: '1px solid #2a2a31', borderRadius: 14, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ex.altOptions.map((o, oi) => (
                    <div key={oi} onClick={o.onPick} style={{ cursor: 'pointer', borderRadius: 10, padding: '10px 12px', background: o.bg, border: `1px solid ${o.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Archivo'", fontSize: 13, fontWeight: 700, color: o.nameColor }}>{o.name}</div>
                        <div style={{ fontFamily: "'Archivo'", fontSize: 11, color: '#7d7d86', fontWeight: 500 }}>{o.equip} · {o.weightStr}</div>
                      </div>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${o.dotBorder}`, background: o.dotBg, flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* target banner */}
            <div style={{ margin: '0 17px', background: ex.bBg, border: `1px solid ${ex.bBorder}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ex.bAccent} strokeWidth="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Archivo'", fontSize: 11, fontWeight: 700, color: ex.bLabelColor, letterSpacing: '.4px', textTransform: 'uppercase' }}>{ex.bTitle}</div>
                <div style={{ fontFamily: "'Archivo'", fontSize: 13, color: ex.bHintColor, fontWeight: 600, marginTop: 1 }}>{ex.bHint}</div>
              </div>
              <div style={{ fontFamily: "'Anton'", fontSize: 24, color: ex.bAccent, lineHeight: 1, textAlign: 'right' }}>{ex.nextStr}</div>
            </div>

            {/* sets table */}
            <div style={{ padding: '12px 17px 15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: SET_GRID, gap: 5, alignItems: 'center', padding: '0 2px 8px', fontFamily: "'Archivo'", fontSize: 10, fontWeight: 700, color: '#61616a', letterSpacing: '.6px' }}>
                <span>#</span>
                <span>PREV</span>
                <span style={{ textAlign: 'center' }}>{ex.unitLabel}</span>
                <span style={{ textAlign: 'center' }}>REPS</span>
                <span />
                <span />
              </div>
              {ex.sets.map((s, si) => (
                <div key={si} style={{ display: 'grid', gridTemplateColumns: SET_GRID, gap: 5, alignItems: 'center', padding: '5px 2px', borderRadius: 10, background: s.rowBg, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Anton'", fontSize: 14, color: s.numColor, textAlign: 'center' }}>{s.num}</span>
                  <span style={{ fontFamily: "'Archivo'", fontSize: 10, color: '#61616a', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.prev}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <button onClick={s.dec} style={stepBtn}>–</button>
                    <NumField value={s.weight} onCommit={s.commitWeight} decimals width={38} ariaLabel={`${ex.displayName} set ${s.num} weight in ${ex.unitLabel}`} />
                    <button onClick={s.inc} style={stepBtn}>+</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <button onClick={s.repDec} style={stepBtn}>–</button>
                    <NumField value={s.reps} onCommit={s.commitReps} width={28} ariaLabel={`${ex.displayName} set ${s.num} reps`} />
                    <button onClick={s.repInc} style={stepBtn}>+</button>
                  </div>
                  <button onClick={s.toggle} style={{ width: 30, height: 30, borderRadius: 9, cursor: 'pointer', border: `1px solid ${s.checkBorder}`, background: s.checkBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.checkStroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </button>
                  <button
                    onClick={s.remove}
                    disabled={!s.canRemove}
                    title={s.canRemove ? 'Delete set' : 'An exercise needs at least one set'}
                    aria-label={`Delete ${ex.displayName} set ${s.num}`}
                    style={{ width: 22, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: s.canRemove ? 'pointer' : 'default', opacity: s.canRemove ? 1 : 0.25, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7d5560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" /></svg>
                  </button>
                  {s.resting && (
                    <div style={{ gridColumn: '1 / -1', marginTop: 5, background: '#0f0f12', border: '1px solid #2a2a31', borderRadius: 11, padding: '8px 9px', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>
                      <span style={{ fontFamily: "'Archivo'", fontSize: 10, fontWeight: 700, color: '#7d7d86', letterSpacing: '.4px', textTransform: 'uppercase', flexShrink: 0 }}>Rest</span>
                      <div style={{ flex: 1, height: 5, background: '#26262c', borderRadius: 4, overflow: 'hidden', minWidth: 20 }}>
                        <div style={{ height: '100%', width: `${s.restPct}%`, background: '#CCFF00', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontFamily: "'Anton'", fontSize: 13, color: '#CCFF00', flexShrink: 0, minWidth: 28, textAlign: 'right' }}>{s.restText}</span>
                      <button onClick={s.restLess} style={restBtn}>-15</button>
                      <button onClick={s.restMore} style={restBtn}>+15</button>
                      <button onClick={s.restSkip} style={{ flexShrink: 0, border: 'none', background: '#CCFF00', color: '#0B0B0D', cursor: 'pointer', fontFamily: "'Archivo'", fontWeight: 800, fontSize: 10, padding: '5px 8px', borderRadius: 8 }}>Skip</button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={ex.addSet} style={{ width: '100%', marginTop: 6, border: '1px dashed #33333b', background: 'transparent', cursor: 'pointer', color: '#8a8a93', fontFamily: "'Archivo'", fontWeight: 700, fontSize: 12, padding: 10, borderRadius: 11, letterSpacing: '.3px' }}>+ ADD SET</button>
            </div>
          </div>
        ))}

        {/* add a movement mid-session */}
        <div style={{ padding: '4px 3px 0' }}>
          <button
            onClick={w.addPicker.toggle}
            style={{ width: '100%', border: `1px dashed ${w.addPicker.open ? '#CCFF00' : '#33333b'}`, background: w.addPicker.open ? '#1c2408' : 'transparent', cursor: 'pointer', color: w.addPicker.open ? '#CCFF00' : '#8a8a93', fontFamily: "'Archivo'", fontWeight: 800, fontSize: 12, padding: 13, borderRadius: 14, letterSpacing: '.4px' }}
          >
            {w.addPicker.open ? '× CLOSE' : '+ ADD EXERCISE'}
          </button>

          {w.addPicker.open && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {w.addPicker.empty ? (
                <div style={{ fontFamily: "'Archivo'", fontSize: 12, color: '#61616a', fontWeight: 600, textAlign: 'center', padding: 16 }}>{w.addPicker.emptyHint}</div>
              ) : (
                w.addPicker.options.map((o) => (
                  <div key={o.id} onClick={o.onPick} style={{ cursor: 'pointer', background: '#141417', border: '1px solid #26262c', borderRadius: 13, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span style={{ width: 4, alignSelf: 'stretch', borderRadius: 3, background: o.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Archivo'", fontSize: 14, fontWeight: 700, color: '#F4F4F5' }}>{o.name}</div>
                      <div style={{ fontFamily: "'Archivo'", fontSize: 11, color: '#7d7d86', fontWeight: 500 }}>{o.group} · {o.equip} · {o.scheme}</div>
                    </div>
                    <span style={{ fontFamily: "'Anton'", fontSize: 15, color: '#CCFF00', flexShrink: 0 }}>{o.nextStr}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const SET_GRID = '20px 0.7fr 1.3fr 1.15fr 30px 22px'

/**
 * A number you can just type into. Kept as local text while focused so a
 * half-typed value ("7", "") is never fed back through the store, and committed
 * on blur or Enter. An unparseable entry snaps back instead of writing garbage.
 */
function NumField({
  value,
  onCommit,
  width,
  decimals = false,
  ariaLabel,
}: {
  value: number
  onCommit: (v: number) => void
  width: number
  decimals?: boolean
  ariaLabel: string
}) {
  const [text, setText] = useState(String(value))
  const [editing, setEditing] = useState(false)

  // follow the store while not being edited (steppers, swaps, unit changes)
  useEffect(() => {
    if (!editing) setText(String(value))
  }, [value, editing])

  const commit = () => {
    setEditing(false)
    const n = parseFloat(text.replace(',', '.'))
    if (!Number.isFinite(n) || n < 0) {
      setText(String(value))
      return
    }
    onCommit(n)
  }

  return (
    <input
      value={text}
      aria-label={ariaLabel}
      inputMode={decimals ? 'decimal' : 'numeric'}
      onFocus={(e) => {
        setEditing(true)
        e.currentTarget.select()
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') {
          setText(String(value))
          setEditing(false)
          e.currentTarget.blur()
        }
      }}
      style={{
        width,
        minWidth: 0,
        background: editing ? '#1c2408' : 'transparent',
        border: `1px solid ${editing ? '#2f3d0a' : 'transparent'}`,
        borderRadius: 7,
        outline: 'none',
        color: '#F4F4F5',
        fontFamily: "'Archivo'",
        fontWeight: 800,
        fontSize: 15,
        textAlign: 'center',
        padding: '3px 0',
        appearance: 'none',
      }}
    />
  )
}

const stepBtn: React.CSSProperties = { width: 22, height: 22, borderRadius: 7, border: '1px solid #33333b', background: '#0f0f12', color: '#9a9aa2', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0 }
const restBtn: React.CSSProperties = { flexShrink: 0, border: '1px solid #33333b', background: '#17171b', color: '#c8c8ce', cursor: 'pointer', fontFamily: "'Archivo'", fontWeight: 700, fontSize: 10, padding: '5px 7px', borderRadius: 8 }
