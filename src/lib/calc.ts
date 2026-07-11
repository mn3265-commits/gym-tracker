import { RANKS, SEED_EXERCISES, TAILOR_RATIOS } from '../data/exercises'
import type { Exercise, Group, LiftProgress, MuscleState, Rank, ResolvedAlt, Unit, Zone } from '../data/types'
import { VOLT } from '../data/tokens'

/**
 * Which movements make up a given training day. The library is organized by
 * Push/Pull/Legs, so Lower reuses the leg movements and Upper combines push+pull.
 */
export function exercisesForType(ex: Exercise[], type: Group): Exercise[] {
  if (type === 'Upper') return ex.filter((e) => e.group === 'Push' || e.group === 'Pull')
  if (type === 'Lower') return ex.filter((e) => e.group === 'Legs')
  return ex.filter((e) => e.group === type)
}

// ── Units ──────────────────────────────────────────────────────────────────
export const toLb = (n: number): number => Math.round(n * 2.20462)

/** Format a kg value in the chosen unit, e.g. "105 kg" / "231 lb". */
export function fmtWeight(n: number, unit: Unit): string {
  return unit === 'lb' ? `${toLb(n)} lb` : `${n} kg`
}

/** Numeric weight in the chosen unit (no label). */
export function toNum(n: number, unit: Unit): number {
  return unit === 'lb' ? toLb(n) : n
}

// ── Plate maths ──────────────────────────────────────────────────────────────
/** Standard loadable plates, heaviest first, in each unit. */
const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25]
const PLATES_LB = [45, 35, 25, 10, 5, 2.5]
/** An Olympic bar. */
export const BAR_KG = 20
export const BAR_LB = 45

export interface PlatePlan {
  /** the bar, in the chosen unit */
  bar: number
  /** plates for ONE side, heaviest first */
  perSide: number[]
  /** the plan loads exactly to the target; false if a fraction is left over */
  exact: boolean
  /** unloadable remainder per side, in the chosen unit (0 when exact) */
  leftover: number
  /** target could not even be reached with the bar (weight < bar) */
  belowBar: boolean
}

/**
 * How to load a barbell to `totalKg`, expressed in the lifter's unit.
 * Greedy from the heaviest plate — which is optimal for a canonical plate set —
 * and honest about anything that can't be loaded exactly (leftover), instead of
 * silently rounding the target the way a naive calculator would.
 */
export function platesFor(totalKg: number, unit: Unit): PlatePlan {
  const bar = unit === 'lb' ? BAR_LB : BAR_KG
  const plates = unit === 'lb' ? PLATES_LB : PLATES_KG
  const total = toNum(totalKg, unit)
  if (total < bar) return { bar, perSide: [], exact: total === bar, leftover: 0, belowBar: true }

  let perSideWeight = (total - bar) / 2
  const perSide: number[] = []
  for (const p of plates) {
    while (perSideWeight >= p - 1e-9) {
      perSide.push(p)
      perSideWeight -= p
    }
  }
  const leftover = Math.round(perSideWeight * 100) / 100
  return { bar, perSide, exact: leftover === 0, leftover, belowBar: false }
}

/** "20 · 20 · 2.5" — plates per side, for a compact label. */
export function platesLabel(plan: PlatePlan): string {
  if (plan.belowBar) return 'bar only'
  if (!plan.perSide.length) return 'empty bar'
  return plan.perSide.map((p) => (Number.isInteger(p) ? String(p) : String(p))).join(' · ')
}

// ── Warm-up ramp ─────────────────────────────────────────────────────────────
export interface WarmupSet {
  weight: number
  reps: number
}

/**
 * A sensible warm-up ramp toward a working weight: the empty bar, then a few
 * ascending sets at ~50/70/85%, reps tapering as the load climbs. Only worth
 * showing for a barbell — a machine or a light dumbbell needs no ramp — and
 * only when the working weight is heavy enough to have rungs beneath it.
 *
 * Weights round to the increment; duplicate rungs (a light lift where 50% and
 * 70% collapse onto the bar) are dropped. These never count toward progression.
 */
export function warmupRamp(workingKg: number, inc: number, isBarbell: boolean): WarmupSet[] {
  if (!isBarbell || workingKg <= BAR_KG) return []
  const steps: [number, number][] = [
    [BAR_KG, 8],
    [Math.max(BAR_KG, roundInc(workingKg * 0.5, inc)), 5],
    [roundInc(workingKg * 0.7, inc), 3],
    [roundInc(workingKg * 0.85, inc), 2],
  ]
  const out: WarmupSet[] = []
  for (const [weight, reps] of steps) {
    if (weight >= workingKg) continue // never warm up at or above the work set
    if (out.some((w) => w.weight === weight)) continue
    out.push({ weight, reps })
  }
  return out
}

// ── Scheme / target math ─────────────────────────────────────────────────────
/** Top of the rep range from a scheme like "4 × 6–8" → 8. */
export function repTop(e: Pick<Exercise, 'scheme'>): number {
  const p = e.scheme.split('×')[1] || '8'
  const nums = p.match(/\d+/g) || ['8']
  return parseInt(nums[nums.length - 1]!, 10)
}

/** Planned set count from a scheme like "4 × 6" → 4. */
export function setCount(e: Pick<Exercise, 'scheme'>): number {
  return parseInt(e.scheme, 10) || 4
}

/** The next target weight: one increment up, capped at the goal. */
export function nextWeight(e: Pick<Exercise, 'current' | 'inc' | 'goal'>): number {
  return Math.min(e.current + e.inc, e.goal)
}

/** Percent progress from start → goal, clamped to [0, 100]. */
export function pctVal(e: Pick<Exercise, 'current' | 'start' | 'goal'>): number {
  return Math.max(0, Math.min(100, Math.round(((e.current - e.start) / (e.goal - e.start)) * 100)))
}

// ── Clock ────────────────────────────────────────────────────────────────────
export function fmtClock(s: number): string {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${String(ss).padStart(2, '0')}`
}

// ── Rank ─────────────────────────────────────────────────────────────────────
export interface RankInfo {
  name: string
  idx: number
  next: string | null
  into: number
  need: number
  span: number
  pct: number
  xp: number
}

export function rankInfo(xp: number): RankInfo {
  const rs: Rank[] = RANKS
  let cur = rs[0]!
  let idx = 0
  for (let i = 0; i < rs.length; i++) {
    if (xp >= rs[i]!.min) {
      cur = rs[i]!
      idx = i
    }
  }
  const next = rs[idx + 1] || null
  const pct = next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100
  return {
    name: cur.name,
    idx,
    next: next ? next.name : null,
    into: xp - cur.min,
    need: next ? next.min - cur.min : 0,
    span: next ? next.min : cur.min,
    pct,
    xp,
  }
}

// ── Body map ─────────────────────────────────────────────────────────────────
/** Merge exercise muscle-state entries into a muscle → state map ('done' wins). */
export function buildMuscleMap(entries: { muscles: string[]; state: MuscleState }[]): Record<string, MuscleState> {
  const map: Record<string, MuscleState> = {}
  entries.forEach((e) => {
    e.muscles.forEach((m) => {
      if (map[m] !== 'done') map[m] = e.state
    })
  })
  return map
}

export interface RenderedZone {
  x: number
  y: number
  w: number
  h: number
  rx: number
  fill: string
  stroke: string
  strokeWidth: number
  dash: string
}

/** Resolve each zone to concrete fill/stroke based on the muscle map. */
export function renderBody(zones: Zone[], map: Record<string, MuscleState>): RenderedZone[] {
  return zones.map((z) => {
    if (!z.m) return { x: z.x, y: z.y, w: z.w, h: z.h, rx: z.rx, fill: '#1c1c20', stroke: '#2a2a31', strokeWidth: 1, dash: '0' }
    let state: MuscleState | null = null
    z.m.forEach((k) => {
      const s = map[k]
      if (s === 'done') state = 'done'
      else if (s === 'todo' && state !== 'done') state = 'todo'
    })
    if (state === 'done') return { x: z.x, y: z.y, w: z.w, h: z.h, rx: z.rx, fill: VOLT, stroke: 'none', strokeWidth: 0, dash: '0' }
    if (state === 'todo') return { x: z.x, y: z.y, w: z.w, h: z.h, rx: z.rx, fill: '#1c1c2a', stroke: VOLT, strokeWidth: 1.4, dash: '3,3' }
    return { x: z.x, y: z.y, w: z.w, h: z.h, rx: z.rx, fill: '#1c1c20', stroke: '#2a2a31', strokeWidth: 1, dash: '0' }
  })
}

// ── BMI / protein ────────────────────────────────────────────────────────────
export interface Bmi {
  value: string
  cat: string
  color: string
}

export function bmiFor(weightKg: number, heightCm: number | null): Bmi | null {
  if (!heightCm || heightCm <= 80) return null
  const val = weightKg / Math.pow(heightCm / 100, 2)
  const cat =
    val < 18.5
      ? { t: 'Underweight', c: '#4EA8FF' }
      : val < 25
        ? { t: 'Healthy', c: '#3DDC84' }
        : val < 30
          ? { t: 'Overweight', c: '#FFCE3D' }
          : { t: 'High', c: '#FF6A2C' }
  return { value: val.toFixed(1), cat: cat.t, color: cat.c }
}

export interface Protein {
  low: number
  high: number
  target: number
}

export function proteinFor(weightKg: number): Protein {
  return {
    low: Math.round(weightKg * 1.6),
    high: Math.round(weightKg * 2.2),
    target: Math.round(weightKg * 2.0),
  }
}

// ── Tailoring ────────────────────────────────────────────────────────────────
export const roundInc = (v: number, inc: number): number => Math.max(inc, Math.round(v / inc) * inc)

/** Goal is never a ceiling you can get stuck against: clearing it pushes it out. */
const GOAL_STRETCH = 1.15

/**
 * Derive the seeded/tailored baseline catalog from the profile alone.
 * This is what a lift is worth *before* you have trained it. Pure in
 * (profile, tailoredDone) — no hidden mutation, no fabricated history.
 */
export function tailoredExercises(bwStr: string, tailoredDone: boolean): Exercise[] {
  const seed = SEED_EXERCISES.map((e) => ({ ...e, alts: e.alts.map((a) => ({ ...a })) }))
  const bw = parseFloat(bwStr)
  if (!tailoredDone || !bw || bw < 25) return seed

  seed.forEach((e) => {
    const r = TAILOR_RATIOS[e.id] ?? 0.5
    const cur = roundInc(bw * r, e.inc)
    e.current = cur
    e.goal = Math.max(roundInc(cur * 1.3, e.inc), cur + e.inc)
    e.start = Math.min(Math.max(0, roundInc(cur * 0.72, e.inc)), cur)
  })
  return seed
}

// ── Earned progression ───────────────────────────────────────────────────────
/** Epley estimated 1RM. Comparable across rep counts, so the chart is honest. */
export function e1rm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

/** Push the goal out once it's been reached, so progression never stalls. */
export function stretchGoal(current: number, goal: number, inc: number): number {
  if (current < goal) return goal
  return Math.max(roundInc(current * GOAL_STRETCH, inc), current + inc)
}

/**
 * Overlay real, earned progress on top of the baseline. A movement the user has
 * actually trained is described by `lifts[name]`; everything else falls back to
 * the seeded/tailored numbers.
 */
export function effectiveExercises(bwStr: string, tailoredDone: boolean, lifts: Record<string, LiftProgress>): Exercise[] {
  return tailoredExercises(bwStr, tailoredDone).map((e) => {
    const p = lifts[e.name]
    return p ? { ...e, start: p.start, current: p.current, goal: p.goal } : e
  })
}

/**
 * Resolve a lift's alternatives to concrete weights. An untrained alt is scaled
 * off its parent (`ratio`); once trained it carries its own earned progress.
 */
export function resolveAlts(e: Exercise, lifts: Record<string, LiftProgress>): ResolvedAlt[] {
  return e.alts.map((a) => {
    const p = lifts[a.n]
    if (p) return { ...a, start: p.start, current: p.current, goal: p.goal }
    const current = roundInc(e.current * a.ratio, a.inc)
    return {
      ...a,
      current,
      goal: Math.max(roundInc(e.goal * a.ratio, a.inc), current + a.inc),
      start: Math.min(Math.max(0, roundInc(e.start * a.ratio, a.inc)), current),
    }
  })
}

/**
 * Has this movement actually been trained? Seed/tailored weights are a starting
 * recommendation, not an achievement: an untrained lift must not claim progress.
 */
export function isTrained(name: string, lifts: Record<string, LiftProgress>): boolean {
  return (lifts[name]?.history.length ?? 0) > 0
}

/** Percent start -> goal, but zero until the lift has actually been trained. */
export function earnedPct(e: Pick<Exercise, 'name' | 'current' | 'start' | 'goal'>, lifts: Record<string, LiftProgress>): number {
  return isTrained(e.name, lifts) ? pctVal(e) : 0
}

/** The movement actually performed for a slot — the swapped-in alt, or the lift itself. */
export function performedName(e: Exercise, swaps: Record<number, string>): string {
  return swaps[e.id] || e.name
}

/** Baseline stats + increment for whatever movement is actually being performed. */
export function performedStats(
  e: Exercise,
  swaps: Record<number, string>,
  lifts: Record<string, LiftProgress>,
): { name: string; start: number; current: number; goal: number; inc: number } {
  const name = performedName(e, swaps)
  if (name === e.name) return { name, start: e.start, current: e.current, goal: e.goal, inc: e.inc }
  const alt = resolveAlts(e, lifts).find((a) => a.n === name)
  if (!alt) return { name: e.name, start: e.start, current: e.current, goal: e.goal, inc: e.inc }
  return { name, start: alt.start, current: alt.current, goal: alt.goal, inc: alt.inc }
}

export interface SetResult {
  weight: number
  reps: number
  goalReps: number
  target: number
  done: boolean
}

/**
 * Fold one finished exercise's sets into its earned progression.
 *
 * Double progression: the working weight only moves up when every planned set
 * was completed at or above the target weight *and* the top of the rep range.
 * A bad session never drags the weight back down — it just doesn't advance —
 * because auto-deloading on a single off day would fight the user, not help.
 */
export function progressLift(prev: LiftProgress, sets: SetResult[], inc: number, date: string): LiftProgress {
  const done = sets.filter((s) => s.done)
  if (!done.length) return prev

  const top = done.reduce((best, s) => (e1rm(s.weight, s.reps) > e1rm(best.weight, best.reps) ? s : best), done[0]!)
  const allPlannedDone = sets.length > 0 && sets.every((s) => s.done)
  const allMet = allPlannedDone && sets.every((s) => s.weight >= s.target && s.reps >= s.goalReps)

  // The weight he carried across *every* set is what he owns — not his best single.
  const carried = Math.min(...done.map((s) => s.weight))
  const current = allMet ? Math.max(prev.current, carried) : prev.current
  const goal = stretchGoal(current, prev.goal, inc)

  return {
    start: prev.start,
    current,
    goal,
    history: [...prev.history, { date, weight: top.weight, reps: top.reps, e1rm: e1rm(top.weight, top.reps) }].slice(-120),
  }
}
