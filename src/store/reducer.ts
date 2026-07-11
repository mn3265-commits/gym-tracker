import { initialState, type AppState } from './state'
import type { FlashKind, Group, Screen, Session, Summary, SummaryStatus, Unit, Workout, WorkoutExercise } from '../data/types'
import {
  effectiveExercises,
  exercisesForType,
  fmtWeight,
  nextWeight,
  performedStats,
  progressLift,
  rankInfo,
  repTop,
  setCount,
  warmupRamp,
} from '../lib/calc'
import { EQUIP } from '../data/exercises'
import { dayKey } from '../lib/day'
import type { LiftProgress, MeasureEntry } from '../data/types'

const isBarbell = (movementName: string) => EQUIP[movementName] === 'Barbell'

export type Action =
  | { type: 'NAV'; screen: Screen }
  | { type: 'OPEN_EX'; id: number }
  | { type: 'SET_PROG'; id: number }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'SET_PROFILE_FIELD'; k: 'bw' | 'height' | 'name' | 'goalWeight'; v: string }
  | { type: 'SET_LOG_INPUT'; v: string }
  | { type: 'OPEN_LOG' }
  | { type: 'CLOSE_LOG' }
  | { type: 'ADD_WEIGHT' }
  | { type: 'GENERATE_TARGETS' }
  | { type: 'TOGGLE_SWAP'; id: number }
  | { type: 'CHOOSE_SWAP'; id: number; name: string | null }
  | { type: 'SET_UNIT'; name: string; unit: Unit }
  | { type: 'START_WORKOUT'; trainType: Group }
  | { type: 'HYDRATE'; data: Partial<AppState> }
  | { type: 'TOGGLE_SET'; ei: number; si: number }
  | { type: 'BUMP'; ei: number; si: number; d: number }
  | { type: 'BUMP_REPS'; ei: number; si: number; d: number }
  /** direct entry — `kg` is always kilograms, the caller converts from lb */
  | { type: 'SET_WEIGHT'; ei: number; si: number; kg: number }
  | { type: 'SET_REPS'; ei: number; si: number; reps: number }
  | { type: 'DELETE_SET'; ei: number; si: number }
  | { type: 'ADD_SET'; ei: number }
  | { type: 'TOGGLE_WARMUP'; ei: number }
  | { type: 'TOGGLE_ADD_EX' }
  | { type: 'ADD_EXERCISE'; id: number }
  | { type: 'REMOVE_EXERCISE'; ei: number }
  | { type: 'SET_SETTING'; k: keyof AppState['settings']; v: number | boolean }
  | { type: 'ADD_MEASUREMENT'; entry: MeasureEntry }
  | { type: 'TICK_REST' }
  | { type: 'ADD_REST'; sec: number }
  | { type: 'SKIP_REST' }
  | { type: 'TICK_ELAPSED' }
  | { type: 'FINISH_WORKOUT' }
  | { type: 'CLOSE_SUMMARY' }
  | { type: 'SET_SHARING'; v: boolean }
  | { type: 'CLEAR_FLASH' }
  | { type: 'CYCLE_DAY'; i: number }
  | { type: 'RESET' }

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T

/** Sanity floor for a typed bodyweight — below this it's a typo, not a person. */
const MIN_BODYWEIGHT_KG = 25

/**
 * XP rules. These are game design, not user data: showing up is worth more than
 * any single set, and hitting a target is worth five sets of merely turning up.
 */
const XP = { perSet: 10, perTargetHit: 50, perSession: 100 } as const

const effEx = (s: AppState) => effectiveExercises(s.profile.bw, s.tailoredDone, s.lifts)
const unitOf = (s: AppState, name: string): Unit => s.units[name] || 'kg'

/** Program one exercise slot: honour the saved swap and the earned weight. */
function programExercise(state: AppState, e: ReturnType<typeof effEx>[number]): WorkoutExercise {
  const st = performedStats(e, state.swaps, state.lifts)
  const nx = nextWeight(st)
  const rt = repTop(e)
  return {
    id: e.id,
    name: st.name,
    muscle: e.primary,
    next: nx,
    group: e.group,
    sets: Array.from({ length: setCount(e) }, () => ({
      weight: nx,
      reps: rt,
      goalReps: rt,
      target: nx,
      prev: `${fmtWeight(st.current, unitOf(state, st.name))} × ${rt}`,
      done: false,
    })),
  }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE': {
      // Blobs saved by older builds have no `lifts` / `settings` / `measureLog`.
      // Never let a missing or malformed value reach the view model as undefined.
      const next = { ...state, ...action.data }
      if (!next.lifts || typeof next.lifts !== 'object') next.lifts = {}
      if (!Array.isArray(next.measureLog)) next.measureLog = []
      next.settings = { ...initialState.settings, ...(next.settings ?? {}) }
      if (!next.profile || typeof next.profile !== 'object') next.profile = { ...initialState.profile }
      return next
    }
    case 'RESET':
      return { ...initialState }
    case 'NAV':
      return { ...state, screen: action.screen }
    case 'OPEN_EX':
      return { ...state, exId: action.id, screen: 'detail' }
    case 'SET_PROG':
      return { ...state, progId: action.id }
    case 'SET_FILTER':
      return { ...state, filter: action.filter }

    case 'SET_PROFILE_FIELD':
      return { ...state, profile: { ...state.profile, [action.k]: action.v } }

    case 'SET_SETTING':
      return { ...state, settings: { ...state.settings, [action.k]: action.v } }

    case 'ADD_MEASUREMENT': {
      const e = action.entry
      const has = (Object.keys(e) as (keyof MeasureEntry)[]).some((k) => k !== 'date' && typeof e[k] === 'number')
      if (!has) return state
      // one entry per day: re-logging today replaces it rather than stacking
      const rest = state.measureLog.filter((m) => m.date !== e.date)
      return { ...state, measureLog: [...rest, e].sort((a, b) => a.date.localeCompare(b.date)).slice(-60) }
    }

    case 'SET_LOG_INPUT':
      return { ...state, logInput: action.v }
    case 'OPEN_LOG':
      return { ...state, logModalOpen: true, logInput: '' }
    case 'CLOSE_LOG':
      return { ...state, logModalOpen: false, logInput: '' }

    case 'ADD_WEIGHT': {
      const w = parseFloat(state.logInput)
      if (!w || w < MIN_BODYWEIGHT_KG) return state
      const rounded = Math.round(w * 10) / 10
      return {
        ...state,
        weightLog: [...state.weightLog, { date: dayKey(new Date()), w: rounded }].slice(-10),
        profile: { ...state.profile, bw: String(w) },
        logInput: '',
        logModalOpen: false,
      }
    }

    case 'GENERATE_TARGETS': {
      const bw = parseFloat(state.profile.bw)
      if (!bw || bw < MIN_BODYWEIGHT_KG) return state
      const log = state.weightLog
      const bwNum = Math.round(bw * 10) / 10
      const shouldLog = !log.length || log[log.length - 1]!.w !== bw
      return {
        ...state,
        tailoredDone: true,
        screen: 'home',
        weightLog: shouldLog ? [...log, { date: dayKey(new Date()), w: bwNum }].slice(-10) : log,
      }
    }

    case 'TOGGLE_SWAP':
      return { ...state, openSwap: state.openSwap === action.id ? null : action.id }

    case 'CHOOSE_SWAP': {
      const { id, name } = action
      const sw = { ...state.swaps }
      if (name == null) delete sw[id]
      else sw[id] = name
      const src = effEx(state).find((x) => x.id === id)
      if (!src) return { ...state, swaps: sw, openSwap: null }
      // Resolve against the *new* swap map so the alt's own earned progress wins.
      const stats = performedStats(src, sw, state.lifts)
      const dispName = stats.name
      const nx = Math.min(stats.current + stats.inc, stats.goal)
      const rt = repTop(src)
      let w = state.workout
      if (w) {
        w = clone(w)
        const wi = w.exercises.findIndex((e2) => e2.id === id)
        if (wi > -1) {
          w.exercises[wi]!.next = nx
          w.exercises[wi]!.sets = w.exercises[wi]!.sets.map(() => ({
            weight: nx,
            reps: rt,
            goalReps: rt,
            target: nx,
            prev: `${fmtWeight(stats.current, unitOf(state, dispName))} × ${rt}`,
            done: false,
          }))
        }
      }
      return { ...state, swaps: sw, openSwap: null, workout: w }
    }

    case 'SET_UNIT':
      return { ...state, units: { ...state.units, [action.name]: action.unit } }

    case 'START_WORKOUT': {
      const ex = effEx(state)
      const trainType = action.trainType
      const todayEx = exercisesForType(ex, trainType)
      const workout: Workout = {
        type: trainType,
        exercises: todayEx.map<WorkoutExercise>((e) => programExercise(state, e)),
      }
      return { ...state, workout, elapsed: 0, screen: 'train', addExOpen: false }
    }

    case 'TICK_ELAPSED':
      return state.workout ? { ...state, elapsed: state.elapsed + 1 } : state

    case 'TOGGLE_SET': {
      if (!state.workout) return state
      const { ei, si } = action
      const w = clone(state.workout)
      const set = w.exercises[ei]!.sets[si]!
      const willBeDone = !set.done
      set.done = willBeDone
      let flash: FlashKind | null = null
      if (willBeDone) {
        if (set.weight >= set.target && set.reps >= set.goalReps) {
          flash = { good: true, msg: `SET ${si + 1} · TARGET HIT` }
        } else if (set.weight < set.target) {
          flash = { good: false, msg: `SET ${si + 1} · UNDER TARGET WEIGHT` }
        } else {
          const short = set.goalReps - set.reps
          flash = { good: false, msg: `SET ${si + 1} · ${short} REP${short > 1 ? 'S' : ''} SHORT` }
        }
      }
      if (willBeDone) {
        const dur = state.settings.restSeconds
        return { ...state, workout: w, flash, rest: dur, restDur: dur, restActive: true, restOwner: { ei, si } }
      }
      return { ...state, workout: w, flash }
    }

    case 'BUMP': {
      if (!state.workout) return state
      const w = clone(state.workout)
      const cell = w.exercises[action.ei]!.sets[action.si]!
      cell.weight = Math.max(0, Math.round((cell.weight + action.d) * 2) / 2)
      return { ...state, workout: w }
    }

    case 'BUMP_REPS': {
      if (!state.workout) return state
      const w = clone(state.workout)
      const cell = w.exercises[action.ei]!.sets[action.si]!
      cell.reps = Math.max(0, cell.reps + action.d)
      return { ...state, workout: w }
    }

    case 'SET_WEIGHT': {
      if (!state.workout) return state
      const w = clone(state.workout)
      const cell = w.exercises[action.ei]?.sets[action.si]
      if (!cell) return state
      if (!Number.isFinite(action.kg) || action.kg < 0) return state
      // quarter-kilo, so a weight typed in lb survives the round trip back to lb
      cell.weight = Math.min(999, Math.round(action.kg * 4) / 4)
      return { ...state, workout: w }
    }

    case 'SET_REPS': {
      if (!state.workout) return state
      const w = clone(state.workout)
      const cell = w.exercises[action.ei]?.sets[action.si]
      if (!cell) return state
      if (!Number.isFinite(action.reps) || action.reps < 0) return state
      cell.reps = Math.min(999, Math.round(action.reps))
      return { ...state, workout: w }
    }

    case 'DELETE_SET': {
      if (!state.workout) return state
      const { ei, si } = action
      const arr = state.workout.exercises[ei]?.sets
      // an exercise with zero sets would break ADD_SET (it copies the last set)
      if (!arr || arr.length <= 1 || !arr[si]) return state
      const w = clone(state.workout)
      w.exercises[ei]!.sets.splice(si, 1)
      // a rest timer pinned to a removed (or now-shifted) row would point at the wrong set
      const stale = state.restOwner != null && state.restOwner.ei === ei && state.restOwner.si >= si
      return stale
        ? { ...state, workout: w, restActive: false, rest: 0, restOwner: null }
        : { ...state, workout: w }
    }

    case 'ADD_SET': {
      if (!state.workout) return state
      const w = clone(state.workout)
      const arr = w.exercises[action.ei]?.sets
      if (!arr) return state
      const last = arr[arr.length - 1]
      const src = last ?? { weight: w.exercises[action.ei]!.next, reps: 0, goalReps: 0, target: w.exercises[action.ei]!.next }
      arr.push({ weight: src.weight, reps: src.reps, goalReps: src.goalReps, target: src.target, prev: '—', done: false })
      return { ...state, workout: w }
    }

    case 'TOGGLE_WARMUP': {
      if (!state.workout) return state
      const exi = state.workout.exercises[action.ei]
      if (!exi) return state
      const w = clone(state.workout)
      const target = w.exercises[action.ei]!
      if (target.sets.some((s) => s.warmup)) {
        // already ramped — clear the warm-ups, leaving the work sets
        target.sets = target.sets.filter((s) => !s.warmup)
        return { ...state, workout: w }
      }
      const src = effEx(state).find((e) => e.id === exi.id)
      const st = src ? performedStats(src, state.swaps, state.lifts) : null
      const ramp = warmupRamp(target.next, st?.inc ?? 2.5, isBarbell(target.name))
      if (!ramp.length) return state // nothing to ramp (machine, or already light)
      const warmSets = ramp.map((r) => ({
        weight: r.weight,
        reps: r.reps,
        goalReps: r.reps,
        target: r.weight,
        prev: 'warm-up',
        done: false,
        warmup: true,
      }))
      target.sets = [...warmSets, ...target.sets]
      return { ...state, workout: w }
    }

    case 'TOGGLE_ADD_EX':
      return { ...state, addExOpen: !state.addExOpen }

    case 'ADD_EXERCISE': {
      if (!state.workout) return state
      // adding the same lift twice would fold its progression in twice on finish
      if (state.workout.exercises.some((e) => e.id === action.id)) return { ...state, addExOpen: false }
      const src = effEx(state).find((e) => e.id === action.id)
      if (!src) return state
      const w = clone(state.workout)
      w.exercises.push(programExercise(state, src))
      return { ...state, workout: w, addExOpen: false }
    }

    case 'REMOVE_EXERCISE': {
      if (!state.workout) return state
      const { ei } = action
      if (!state.workout.exercises[ei]) return state
      const w = clone(state.workout)
      w.exercises.splice(ei, 1)
      // the rest timer is addressed by exercise index, which just shifted
      const stale = state.restOwner != null && state.restOwner.ei >= ei
      return stale
        ? { ...state, workout: w, restActive: false, rest: 0, restOwner: null }
        : { ...state, workout: w }
    }

    case 'TICK_REST': {
      if (!state.restActive) return state
      if (state.rest <= 1) return { ...state, rest: 0, restActive: false, restOwner: null }
      return { ...state, rest: state.rest - 1 }
    }
    case 'ADD_REST':
      return { ...state, rest: Math.max(0, state.rest + action.sec) }
    case 'SKIP_REST':
      return { ...state, restActive: false, rest: 0, restOwner: null }

    case 'FINISH_WORKOUT': {
      const w = state.workout
      let summary: Summary | null = null
      let lifts = state.lifts
      if (w) {
        const ex = effEx(state)
        const today = dayKey(new Date())
        // Fold what he actually lifted back into each movement's earned progression.
        const nextLifts: Record<string, LiftProgress> = { ...state.lifts }
        w.exercises.forEach((exi) => {
          const src = ex.find((x) => x.id === exi.id)
          if (!src) return
          const st = performedStats(src, state.swaps, state.lifts)
          const prev: LiftProgress = state.lifts[st.name] ?? {
            start: st.start,
            current: st.current,
            goal: st.goal,
            history: [],
          }
          // Warm-ups are a logging aid, never progress: fold in the work sets only.
          const workSets = exi.sets.filter((s) => !s.warmup)
          const updated = progressLift(prev, workSets, st.inc, today)
          if (updated !== prev) nextLifts[st.name] = updated
        })
        lifts = nextLifts

        let totalVolume = 0
        let setsDone = 0
        let setsPlanned = 0
        let hitCount = 0
        let missCount = 0
        const exercises = w.exercises.map((exi) => {
          const src = ex.find((x) => x.id === exi.id)!
          const swapName = state.swaps[exi.id] || src.name
          // scoring counts work sets only — warm-ups don't earn XP, volume or target-hits
          const workSets = exi.sets.filter((s) => !s.warmup)
          const doneSets = workSets.filter((s) => s.done)
          setsDone += doneSets.length
          setsPlanned += workSets.length
          doneSets.forEach((s) => {
            totalVolume += s.weight * s.reps
          })
          const allDone = workSets.length > 0 && workSets.every((s) => s.done)
          const allMet = allDone && workSets.every((s) => s.weight >= s.target && s.reps >= s.goalReps)
          let status: SummaryStatus = 'skipped'
          if (allDone) status = allMet ? 'hit' : 'miss'
          else if (doneSets.length > 0) status = 'partial'
          if (status === 'hit') hitCount++
          if (status === 'miss') missCount++
          return { name: swapName, status, setsDone: doneSets.length, setsPlanned: exi.sets.length, muscles: src.muscles }
        })
        const xpGained = setsDone > 0 ? setsDone * XP.perSet + hitCount * XP.perTargetHit + XP.perSession : 0
        const before = rankInfo(state.xp)
        const after = rankInfo(state.xp + xpGained)
        summary = {
          type: w.type,
          duration: state.elapsed,
          totalVolume,
          setsDone,
          setsPlanned,
          hitCount,
          missCount,
          exercises,
          xpGained,
          leveledUp: after.idx > before.idx,
          newRank: after.name,
          rankPct: after.pct,
          rankNext: after.next,
        }
      }
      const xpGained = summary?.xpGained ?? 0
      let sessions = state.sessions
      if (summary && summary.setsDone > 0) {
        const rec: Session = {
          id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          date: dayKey(new Date()),
          type: summary.type,
          exCount: summary.exercises.length,
          durationSec: summary.duration,
          volumeKg: Math.round(summary.totalVolume),
          hitCount: summary.hitCount,
          setsDone: summary.setsDone,
        }
        sessions = [...state.sessions, rec].slice(-500)
      }
      return {
        ...state,
        workout: null,
        restActive: false,
        restOwner: null,
        rest: 0,
        flash: null,
        lastSummary: summary,
        screen: summary ? 'summary' : 'home',
        sessions,
        lifts,
        xp: state.xp + xpGained,
        sessionsCompleted: summary && summary.setsDone > 0 ? state.sessionsCompleted + 1 : state.sessionsCompleted,
        targetsHitTotal: summary && summary.setsDone > 0 ? state.targetsHitTotal + summary.hitCount : state.targetsHitTotal,
      }
    }

    case 'CLOSE_SUMMARY':
      return { ...state, screen: 'home' }
    case 'SET_SHARING':
      return { ...state, sharing: action.v }
    case 'CLEAR_FLASH':
      return { ...state, flash: null }

    case 'CYCLE_DAY': {
      const order: Group[] = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Rest']
      const p = state.program.slice()
      p[action.i] = order[(order.indexOf(p[action.i]!) + 1) % order.length]!
      return { ...state, program: p }
    }

    default:
      return state
  }
}
