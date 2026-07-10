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

describe('direct entry — typing the number instead of tapping +/-', () => {
  const live = () => push()

  it('sets an exact weight', () => {
    const s = reducer(live(), { type: 'SET_WEIGHT', ei: 0, si: 0, kg: 82.5 })
    expect(s.workout!.exercises[0]!.sets[0]!.weight).toBe(82.5)
  })

  it('rounds to a quarter kilo so a weight typed in lb survives the round trip', () => {
    // 135 lb -> 61.2349 kg -> stored 61.25 -> displayed back as 135 lb
    const s = reducer(live(), { type: 'SET_WEIGHT', ei: 0, si: 0, kg: 135 / 2.20462 })
    const stored = s.workout!.exercises[0]!.sets[0]!.weight
    expect(stored).toBe(61.25)
    expect(Math.round(stored * 2.20462)).toBe(135)
  })

  it('ignores NaN, negatives and infinities rather than corrupting the set', () => {
    const base = live()
    const before = base.workout!.exercises[0]!.sets[0]!.weight
    for (const kg of [NaN, -5, Infinity]) {
      const s = reducer(base, { type: 'SET_WEIGHT', ei: 0, si: 0, kg })
      expect(s.workout!.exercises[0]!.sets[0]!.weight).toBe(before)
    }
  })

  it('sets exact reps, rounding a typed decimal', () => {
    const s = reducer(live(), { type: 'SET_REPS', ei: 0, si: 0, reps: 11.6 })
    expect(s.workout!.exercises[0]!.sets[0]!.reps).toBe(12)
  })

  it('is a no-op for a set that does not exist', () => {
    const base = live()
    expect(reducer(base, { type: 'SET_WEIGHT', ei: 99, si: 0, kg: 50 })).toBe(base)
    expect(reducer(base, { type: 'SET_REPS', ei: 0, si: 99, reps: 5 })).toBe(base)
  })

  it('a typed weight then counts toward progression on finish', () => {
    let s = live()
    const sets = s.workout!.exercises[0]!.sets.length
    for (let si = 0; si < sets; si++) {
      s = reducer(s, { type: 'SET_WEIGHT', ei: 0, si, kg: 80 })
      s = reducer(s, { type: 'SET_REPS', ei: 0, si, reps: 8 })
      s = reducer(s, { type: 'TOGGLE_SET', ei: 0, si })
    }
    s = reducer(s, { type: 'FINISH_WORKOUT' })
    expect(s.lifts['Bench Press']!.current).toBe(80)
  })
})

describe('DELETE_SET', () => {
  it('removes the set', () => {
    const before = push()
    const n = before.workout!.exercises[0]!.sets.length
    const s = reducer(before, { type: 'DELETE_SET', ei: 0, si: 1 })
    expect(s.workout!.exercises[0]!.sets).toHaveLength(n - 1)
  })

  it('refuses to delete the last set — ADD_SET copies the last one and would crash', () => {
    let s = push()
    while (s.workout!.exercises[0]!.sets.length > 1) s = reducer(s, { type: 'DELETE_SET', ei: 0, si: 0 })
    const one = s
    s = reducer(s, { type: 'DELETE_SET', ei: 0, si: 0 })
    expect(s).toBe(one)
    expect(s.workout!.exercises[0]!.sets).toHaveLength(1)
    // and ADD_SET still works off that single set
    expect(reducer(s, { type: 'ADD_SET', ei: 0 }).workout!.exercises[0]!.sets).toHaveLength(2)
  })

  it('cancels a rest timer that pointed at the deleted row', () => {
    let s = push()
    s = reducer(s, { type: 'TOGGLE_SET', ei: 0, si: 2 }) // starts rest, restOwner si=2
    expect(s.restActive).toBe(true)
    s = reducer(s, { type: 'DELETE_SET', ei: 0, si: 1 }) // rows shift under it
    expect(s.restActive).toBe(false)
    expect(s.restOwner).toBeNull()
  })

  it('leaves a rest timer on an earlier row alone', () => {
    let s = push()
    s = reducer(s, { type: 'TOGGLE_SET', ei: 0, si: 0 })
    s = reducer(s, { type: 'DELETE_SET', ei: 0, si: 2 })
    expect(s.restActive).toBe(true)
  })
})

describe('adding and removing exercises mid-session', () => {
  it('adds a movement that was not in today\'s split', () => {
    let s = push() // Push day
    const before = s.workout!.exercises.length
    s = reducer(s, { type: 'ADD_EXERCISE', id: 11 }) // Back Squat
    expect(s.workout!.exercises).toHaveLength(before + 1)
    const added = s.workout!.exercises[s.workout!.exercises.length - 1]!
    expect(added.name).toBe('Back Squat')
    expect(added.sets.length).toBeGreaterThan(0)
    expect(added.next).toBeGreaterThan(0)
  })

  it('programs an added movement at its earned weight, honouring a swap', () => {
    let s = push({ ...initialState, swaps: { 11: 'Front Squat' } })
    s = reducer(s, { type: 'ADD_EXERCISE', id: 11 })
    expect(s.workout!.exercises[s.workout!.exercises.length - 1]!.name).toBe('Front Squat')
  })

  it('refuses a duplicate — it would fold that lift\'s progression in twice', () => {
    let s = push()
    const before = s.workout!.exercises.length
    s = reducer(s, { type: 'ADD_EXERCISE', id: 1 }) // Bench Press already present
    expect(s.workout!.exercises).toHaveLength(before)
  })

  it('closes the picker after adding', () => {
    let s = reducer(push(), { type: 'TOGGLE_ADD_EX' })
    expect(s.addExOpen).toBe(true)
    s = reducer(s, { type: 'ADD_EXERCISE', id: 11 })
    expect(s.addExOpen).toBe(false)
  })

  it('an added exercise earns real progression when completed', () => {
    let s = reducer(push(), { type: 'ADD_EXERCISE', id: 11 })
    s = completeAll(s)
    s = reducer(s, { type: 'FINISH_WORKOUT' })
    expect(s.lifts['Back Squat']).toBeDefined()
    expect(s.lifts['Back Squat']!.history).toHaveLength(1)
  })

  it('removes an exercise, and drops a rest timer that pointed into it', () => {
    let s = push()
    s = reducer(s, { type: 'TOGGLE_SET', ei: 1, si: 0 })
    expect(s.restActive).toBe(true)
    const before = s.workout!.exercises.length
    s = reducer(s, { type: 'REMOVE_EXERCISE', ei: 0 })
    expect(s.workout!.exercises).toHaveLength(before - 1)
    expect(s.restActive).toBe(false)
  })
})

describe('settings are the user\'s, not constants', () => {
  it('rest timer uses the chosen duration', () => {
    let s: AppState = { ...initialState, settings: { ...initialState.settings, restSeconds: 90 } }
    s = reducer(s, { type: 'START_WORKOUT', trainType: 'Push' })
    s = reducer(s, { type: 'TOGGLE_SET', ei: 0, si: 0 })
    expect(s.rest).toBe(90)
    expect(s.restDur).toBe(90)
  })

  it('SET_SETTING updates one key without touching the rest', () => {
    const s = reducer(initialState, { type: 'SET_SETTING', k: 'weekGoal', v: 3 })
    expect(s.settings.weekGoal).toBe(3)
    expect(s.settings.restSeconds).toBe(initialState.settings.restSeconds)
  })
})

describe('measurements are logged, not invented', () => {
  it('starts empty', () => {
    expect(initialState.measureLog).toEqual([])
  })

  it('records a partial entry — you log what you measured', () => {
    const s = reducer(initialState, { type: 'ADD_MEASUREMENT', entry: { date: '2026-07-09', arms: 38.5 } })
    expect(s.measureLog).toHaveLength(1)
    expect(s.measureLog[0]!.arms).toBe(38.5)
    expect(s.measureLog[0]!.chest).toBeUndefined()
  })

  it('ignores an entry with no measurements at all', () => {
    const s = reducer(initialState, { type: 'ADD_MEASUREMENT', entry: { date: '2026-07-09' } })
    expect(s.measureLog).toHaveLength(0)
  })

  it('replaces the same day rather than stacking duplicates', () => {
    let s = reducer(initialState, { type: 'ADD_MEASUREMENT', entry: { date: '2026-07-09', arms: 38 } })
    s = reducer(s, { type: 'ADD_MEASUREMENT', entry: { date: '2026-07-09', arms: 39 } })
    expect(s.measureLog).toHaveLength(1)
    expect(s.measureLog[0]!.arms).toBe(39)
  })

  it('keeps entries in date order', () => {
    let s = reducer(initialState, { type: 'ADD_MEASUREMENT', entry: { date: '2026-07-09', arms: 39 } })
    s = reducer(s, { type: 'ADD_MEASUREMENT', entry: { date: '2026-07-02', arms: 38 } })
    expect(s.measureLog.map((m) => m.date)).toEqual(['2026-07-02', '2026-07-09'])
  })
})

describe('HYDRATE tolerates blobs from every earlier build', () => {
  it('fills in settings and measureLog that predate them', () => {
    const s = reducer(initialState, { type: 'HYDRATE', data: { xp: 5 } as Partial<AppState> })
    expect(s.settings.restSeconds).toBe(initialState.settings.restSeconds)
    expect(s.measureLog).toEqual([])
  })

  it('merges a partial settings object onto the defaults', () => {
    const s = reducer(initialState, { type: 'HYDRATE', data: { settings: { weekGoal: 3 } } as unknown as Partial<AppState> })
    expect(s.settings.weekGoal).toBe(3)
    expect(s.settings.restSeconds).toBe(initialState.settings.restSeconds)
    expect(s.settings.showTips).toBe(initialState.settings.showTips)
  })
})

describe('weigh-ins carry a real date', () => {
  it('ADD_WEIGHT stamps the day instead of labelling everything "This week"', () => {
    let s = reducer(initialState, { type: 'SET_LOG_INPUT', v: '78.4' })
    s = reducer(s, { type: 'ADD_WEIGHT' })
    expect(s.weightLog).toHaveLength(1)
    expect(s.weightLog[0]!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(s.weightLog[0]!.label).toBeUndefined()
    expect(s.weightLog[0]!.w).toBe(78.4)
  })

  it('rejects a bodyweight below the sanity floor', () => {
    let s = reducer(initialState, { type: 'SET_LOG_INPUT', v: '12' })
    s = reducer(s, { type: 'ADD_WEIGHT' })
    expect(s.weightLog).toHaveLength(0)
  })
})
