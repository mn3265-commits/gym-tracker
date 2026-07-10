import { describe, expect, it } from 'vitest'
import { reducer, type Action } from './reducer'
import { initialState, type AppState } from './state'

const run = (s: AppState, ...actions: Action[]): AppState => actions.reduce(reducer, s)

/** Mark every set of every exercise done at the prescribed target/reps. */
const completeAll = (s: AppState): AppState => {
  let out = s
  s.workout!.exercises.forEach((e, ei) => {
    e.sets.forEach((_, si) => {
      out = reducer(out, { type: 'TOGGLE_SET', ei, si })
    })
  })
  return out
}

const push = (s = initialState) => run(s, { type: 'START_WORKOUT', trainType: 'Push' })

describe('START_WORKOUT', () => {
  it('programs the seeded working weight + one increment as the target', () => {
    const s = push()
    const bench = s.workout!.exercises.find((e) => e.name === 'Bench Press')!
    expect(bench.next).toBe(72.5) // seed current 70 + inc 2.5
    expect(bench.sets).toHaveLength(4) // scheme "4 × 6–8"
    expect(bench.sets[0]!.goalReps).toBe(8)
  })

  it('honours a saved swap instead of silently reverting to the parent lift', () => {
    const s = push({ ...initialState, swaps: { 1: 'Dumbbell Bench Press' } })
    const slot = s.workout!.exercises.find((e) => e.id === 1)!
    expect(slot.name).toBe('Dumbbell Bench Press')
    expect(slot.next).toBe(30) // derived 28 + alt inc 2
  })
})

describe('FINISH_WORKOUT — real progression write-back', () => {
  it('turns a clean session into earned progress on the lift', () => {
    const done = run(completeAll(push()), { type: 'FINISH_WORKOUT' })
    const bench = done.lifts['Bench Press']
    expect(bench).toBeDefined()
    expect(bench!.current).toBe(72.5) // bumped from 70
    expect(bench!.history).toHaveLength(1)
    expect(bench!.history[0]!.reps).toBe(8)
    expect(bench!.history[0]!.e1rm).toBeGreaterThan(72.5)
  })

  it('feeds the next workout the newly earned weight', () => {
    const after = run(completeAll(push()), { type: 'FINISH_WORKOUT' })
    const second = push(after)
    const bench = second.workout!.exercises.find((e) => e.name === 'Bench Press')!
    expect(bench.next).toBe(75) // 72.5 + 2.5, not 72.5 again
  })

  it('does not advance the weight when sets were left unfinished', () => {
    let s = push()
    // complete only the first set of the first exercise
    s = reducer(s, { type: 'TOGGLE_SET', ei: 0, si: 0 })
    const done = run(s, { type: 'FINISH_WORKOUT' })
    const bench = done.lifts['Bench Press']!
    expect(bench.current).toBe(70) // unchanged
    expect(bench.history).toHaveLength(1) // session still recorded
  })

  it('writes progress under the SWAPPED movement, leaving the parent untouched', () => {
    const s = push({ ...initialState, swaps: { 1: 'Dumbbell Bench Press' } })
    const done = run(completeAll(s), { type: 'FINISH_WORKOUT' })
    expect(done.lifts['Dumbbell Bench Press']).toBeDefined()
    expect(done.lifts['Dumbbell Bench Press']!.current).toBe(30)
    expect(done.lifts['Bench Press']).toBeUndefined()
  })

  it('records nothing for a workout where no set was completed', () => {
    const done = run(push(), { type: 'FINISH_WORKOUT' })
    expect(Object.keys(done.lifts)).toHaveLength(0)
    expect(done.sessions).toHaveLength(0)
    expect(done.xp).toBe(0)
  })

  it('still awards xp and a session record on a completed workout', () => {
    const done = run(completeAll(push()), { type: 'FINISH_WORKOUT' })
    expect(done.xp).toBeGreaterThan(0)
    expect(done.sessions).toHaveLength(1)
    expect(done.sessionsCompleted).toBe(1)
  })

  it('accumulates history across sessions rather than overwriting it', () => {
    let s = run(completeAll(push()), { type: 'FINISH_WORKOUT' })
    s = run(completeAll(push(s)), { type: 'FINISH_WORKOUT' })
    expect(s.lifts['Bench Press']!.history).toHaveLength(2)
    expect(s.lifts['Bench Press']!.current).toBe(75) // 70 -> 72.5 -> 75
  })
})

describe('CHOOSE_SWAP', () => {
  it('reprograms the live workout to the alt weights', () => {
    const s = run(push(), { type: 'CHOOSE_SWAP', id: 1, name: 'Dumbbell Bench Press' })
    const slot = s.workout!.exercises.find((e) => e.id === 1)!
    expect(slot.next).toBe(30)
    expect(slot.sets.every((x) => x.target === 30)).toBe(true)
  })

  it('reverts to the parent lift when the swap is cleared', () => {
    let s = run(push(), { type: 'CHOOSE_SWAP', id: 1, name: 'Dumbbell Bench Press' })
    s = reducer(s, { type: 'CHOOSE_SWAP', id: 1, name: null })
    expect(s.swaps[1]).toBeUndefined()
    expect(s.workout!.exercises.find((e) => e.id === 1)!.next).toBe(72.5)
  })
})

describe('HYDRATE — backward compatibility with pre-progression saves', () => {
  it('tolerates a saved blob with no lifts key (your live Turso row)', () => {
    const legacy = { program: initialState.program, xp: 120, sessions: [] }
    const s = reducer(initialState, { type: 'HYDRATE', data: legacy as Partial<AppState> })
    expect(s.lifts).toEqual({})
    expect(s.xp).toBe(120)
  })

  it('repairs a blob whose lifts is null rather than crashing the view model', () => {
    const s = reducer(initialState, { type: 'HYDRATE', data: { lifts: null } as unknown as Partial<AppState> })
    expect(s.lifts).toEqual({})
  })

  it('keeps earned progress that IS present', () => {
    const data = { lifts: { 'Bench Press': { start: 50, current: 85, goal: 95, history: [] } } }
    const s = reducer(initialState, { type: 'HYDRATE', data })
    expect(s.lifts['Bench Press']!.current).toBe(85)
  })
})

describe('CHOOSE_SWAP outside a workout (the Detail screen)', () => {
  it('records the swap even when no workout is running', () => {
    const s = reducer(initialState, { type: 'CHOOSE_SWAP', id: 1, name: 'Dumbbell Bench Press' })
    expect(s.workout).toBeNull()
    expect(s.swaps[1]).toBe('Dumbbell Bench Press')
  })

  it('clearing it from Detail restores the original lift', () => {
    let s = reducer(initialState, { type: 'CHOOSE_SWAP', id: 1, name: 'Dumbbell Bench Press' })
    s = reducer(s, { type: 'CHOOSE_SWAP', id: 1, name: null })
    expect(s.swaps[1]).toBeUndefined()
  })

  it('a swap chosen from Detail is what the next workout programs', () => {
    let s = reducer(initialState, { type: 'CHOOSE_SWAP', id: 1, name: 'Machine Chest Press' })
    s = reducer(s, { type: 'START_WORKOUT', trainType: 'Push' })
    expect(s.workout!.exercises.find((e) => e.id === 1)!.name).toBe('Machine Chest Press')
  })
})
