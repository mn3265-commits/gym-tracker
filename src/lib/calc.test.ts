import { describe, expect, it } from 'vitest'
import { e1rm, earnedPct, effectiveExercises, isTrained, pctVal, performedStats, progressLift, resolveAlts, stretchGoal, type SetResult } from './calc'
import { SEED_EXERCISES } from '../data/exercises'
import type { LiftProgress } from '../data/types'

const bench = () => SEED_EXERCISES.find((e) => e.name === 'Bench Press')!

const set = (o: Partial<SetResult> = {}): SetResult => ({ weight: 72.5, reps: 8, goalReps: 8, target: 72.5, done: true, ...o })
const base = (o: Partial<LiftProgress> = {}): LiftProgress => ({ start: 50, current: 70, goal: 90, history: [], ...o })

describe('e1rm (Epley)', () => {
  it('returns the weight itself for a single', () => {
    expect(e1rm(100, 1)).toBe(100)
  })
  it('scales with reps: 100kg x 5 ~ 116.7kg', () => {
    expect(e1rm(100, 5)).toBeCloseTo(116.7, 1)
  })
  it('is zero for a set that never happened', () => {
    expect(e1rm(0, 8)).toBe(0)
    expect(e1rm(80, 0)).toBe(0)
  })
})

describe('stretchGoal', () => {
  it('leaves an unreached goal alone', () => {
    expect(stretchGoal(70, 90, 2.5)).toBe(90)
  })
  it('pushes the goal out once it is reached, so progression cannot stall', () => {
    const g = stretchGoal(90, 90, 2.5)
    expect(g).toBeGreaterThan(90)
    expect(g % 2.5).toBe(0)
  })
  it('always clears the current weight by at least one increment', () => {
    // a tiny current with a big inc must not produce goal <= current
    expect(stretchGoal(5, 5, 10)).toBeGreaterThanOrEqual(15)
  })
})

describe('progressLift — double progression', () => {
  const date = '2026-07-09'

  it('bumps the working weight only when every planned set met target AND reps', () => {
    const next = progressLift(base(), [set(), set(), set(), set()], 2.5, date)
    expect(next.current).toBe(72.5)
    expect(next.history).toHaveLength(1)
  })

  it('does NOT bump when one set is short on reps', () => {
    const next = progressLift(base(), [set(), set(), set(), set({ reps: 5 })], 2.5, date)
    expect(next.current).toBe(70) // unchanged
    expect(next.history).toHaveLength(1) // but the session is still recorded
  })

  it('does NOT bump when a planned set was never completed', () => {
    const next = progressLift(base(), [set(), set(), set(), set({ done: false })], 2.5, date)
    expect(next.current).toBe(70)
  })

  it('never drags the weight down after a bad session', () => {
    const next = progressLift(base({ current: 80 }), [set({ weight: 60, target: 82.5, reps: 3 })], 2.5, date)
    expect(next.current).toBe(80)
  })

  it('credits the weight carried across every set, not the best single', () => {
    const sets = [set({ weight: 75 }), set({ weight: 75 }), set({ weight: 75 }), set({ weight: 100 })]
    const next = progressLift(base(), sets, 2.5, date)
    expect(next.current).toBe(75)
  })

  it('records the top set by estimated 1RM, not by raw weight', () => {
    // 70kg x 12 (e1RM 98) beats 80kg x 1 (e1RM 80)
    const sets = [set({ weight: 80, reps: 1, goalReps: 1, target: 80 }), set({ weight: 70, reps: 12, goalReps: 1, target: 80 })]
    const next = progressLift(base(), sets, 2.5, date)
    expect(next.history[0]!.weight).toBe(70)
    expect(next.history[0]!.reps).toBe(12)
  })

  it('is a no-op (identity) when nothing was completed', () => {
    const prev = base()
    expect(progressLift(prev, [set({ done: false })], 2.5, date)).toBe(prev)
  })

  it('stretches the goal when the session takes you to it', () => {
    const next = progressLift(base({ current: 87.5, goal: 90 }), [set({ weight: 90, target: 90 }), set({ weight: 90, target: 90 })], 2.5, date)
    expect(next.current).toBe(90)
    expect(next.goal).toBeGreaterThan(90)
  })

  it('caps stored history so it cannot grow without bound', () => {
    let lift = base()
    for (let i = 0; i < 130; i++) lift = progressLift(lift, [set()], 2.5, date)
    expect(lift.history.length).toBeLessThanOrEqual(120)
  })
})

describe('resolveAlts — swap weights are derived, not hardcoded', () => {
  it('scales an untrained alt off its parent lift', () => {
    const e = bench() // current 70
    const alts = resolveAlts(e, {})
    const db = alts.find((a) => a.n === 'Dumbbell Bench Press')!
    expect(db.ratio).toBeCloseTo(0.4, 2)
    expect(db.current).toBe(28) // 70 * 0.4, rounded to its 2kg increment
    expect(db.goal).toBeGreaterThan(db.current)
    expect(db.start).toBeLessThanOrEqual(db.current)
  })

  it('tracks the parent as the parent gets stronger', () => {
    const weak = resolveAlts({ ...bench(), current: 70 }, {}).find((a) => a.n === 'Dumbbell Bench Press')!
    const strong = resolveAlts({ ...bench(), current: 100 }, {}).find((a) => a.n === 'Dumbbell Bench Press')!
    expect(strong.current).toBeGreaterThan(weak.current)
  })

  it("prefers the alt's OWN earned progress once it has been trained", () => {
    const lifts = { 'Dumbbell Bench Press': base({ start: 20, current: 44, goal: 60 }) }
    const db = resolveAlts(bench(), lifts).find((a) => a.n === 'Dumbbell Bench Press')!
    expect(db.current).toBe(44) // earned, not 28 derived
    expect(db.goal).toBe(60)
  })
})

describe('effectiveExercises — earned progress overlays the baseline', () => {
  it('uses seed values for an untrained lift', () => {
    const e = effectiveExercises('', false, {}).find((x) => x.name === 'Bench Press')!
    expect(e.current).toBe(70)
  })
  it('uses logged progress for a trained lift', () => {
    const e = effectiveExercises('', false, { 'Bench Press': base({ current: 85, goal: 95 }) }).find((x) => x.name === 'Bench Press')!
    expect(e.current).toBe(85)
    expect(e.goal).toBe(95)
  })
})

describe('performedStats — what you actually train', () => {
  it('returns the parent lift when nothing is swapped', () => {
    expect(performedStats(bench(), {}, {}).name).toBe('Bench Press')
  })
  it('returns the swapped-in alt, at the alt increment', () => {
    const st = performedStats(bench(), { 1: 'Dumbbell Bench Press' }, {})
    expect(st.name).toBe('Dumbbell Bench Press')
    expect(st.inc).toBe(2)
    expect(st.current).toBe(28)
  })
  it('falls back to the parent if the swap names an unknown movement', () => {
    expect(performedStats(bench(), { 1: 'Nonexistent Lift' }, {}).name).toBe('Bench Press')
  })
})

describe('an untrained lift claims no progress', () => {
  const untrained = {}
  const trained = { 'Bench Press': base({ start: 50, current: 80, goal: 100, history: [{ date: '2026-07-09', weight: 80, reps: 8, e1rm: 101.3 }] }) }

  it('isTrained is false until a session is actually logged', () => {
    expect(isTrained('Bench Press', untrained)).toBe(false)
    // a lifts entry with empty history still isn't training
    expect(isTrained('Bench Press', { 'Bench Press': base() })).toBe(false)
    expect(isTrained('Bench Press', trained)).toBe(true)
  })

  it('earnedPct is 0 for a seed lift — the bar must not look half full', () => {
    const e = bench() // seed 50/70/90 => pctVal would be 50%
    expect(pctVal(e)).toBe(50)
    expect(earnedPct(e, untrained)).toBe(0)
  })

  it('earnedPct reports the real percentage once trained', () => {
    const e = { ...bench(), start: 50, current: 80, goal: 100 }
    expect(earnedPct(e, trained)).toBe(60)
  })
})
