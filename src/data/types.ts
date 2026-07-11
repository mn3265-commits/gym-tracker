export type Group = 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Lower' | 'Rest'
export type Role = 'key' | 'main' | 'accessory'
export type Unit = 'kg' | 'lb'

/** An alternative movement you can swap in for a lift. */
export interface Alt {
  /** name */
  n: string
  /** why you'd pick it */
  w: string
  /**
   * Working weight relative to the parent lift, e.g. 0.4 means a dumbbell bench
   * is worked at ~40% of the barbell bench load. Weights are derived from the
   * parent rather than hardcoded, so an alt tracks the parent as it progresses —
   * until you actually train it, after which its own logged progress takes over.
   */
  ratio: number
  inc: number
}

/** An alt with its weights resolved against the parent lift. */
export interface ResolvedAlt extends Alt {
  start: number
  current: number
  goal: number
}

export interface Exercise {
  id: number
  group: Group
  name: string
  primary: string
  muscles: string[]
  scheme: string
  inc: number
  start: number
  current: number
  goal: number
  tempo: [number, number, number]
  cues: string[]
  mistakes: string[]
  role: Role
  alts: Alt[]
}

/** One logged top set for a movement, recorded when a workout is finished. */
export interface LiftEntry {
  /** local YYYY-MM-DD */
  date: string
  /** heaviest completed set that session, in kg */
  weight: number
  reps: number
  /** Epley estimated 1RM, in kg — comparable across rep counts */
  e1rm: number
}

/**
 * Real, earned progression for a single movement, keyed by movement name so a
 * swapped-in alternative accumulates its own history exactly like a main lift.
 */
export interface LiftProgress {
  start: number
  current: number
  goal: number
  history: LiftEntry[]
}

/** A body-map zone (viewBox 0 0 100 206). `m: null` zones are neutral filler. */
export interface Zone {
  x: number
  y: number
  w: number
  h: number
  rx: number
  m: string[] | null
}

export interface Rank {
  name: string
  min: number
}

export type MuscleState = 'done' | 'todo'

/** A single logged set inside an active workout. */
export interface WorkoutSet {
  weight: number
  reps: number
  goalReps: number
  target: number
  prev: string
  done: boolean
  /** a ramp-up set: logged for the record but excluded from all scoring */
  warmup?: boolean
}

export interface WorkoutExercise {
  id: number
  name: string
  muscle: string
  next: number
  group: Group
  sets: WorkoutSet[]
}

export interface Workout {
  type: Group
  exercises: WorkoutExercise[]
}

/** A completed training session, saved to real history. */
export interface Session {
  id: string
  /** local YYYY-MM-DD */
  date: string
  type: Group
  exCount: number
  durationSec: number
  volumeKg: number
  hitCount: number
  setsDone: number
}

export type SummaryStatus = 'hit' | 'miss' | 'partial' | 'skipped'

export interface SummaryExercise {
  name: string
  status: SummaryStatus
  setsDone: number
  setsPlanned: number
  muscles: string[]
}

export interface Summary {
  type: Group
  duration: number
  totalVolume: number
  setsDone: number
  setsPlanned: number
  hitCount: number
  missCount: number
  exercises: SummaryExercise[]
  xpGained: number
  leveledUp: boolean
  newRank: string | null
  rankPct: number
  rankNext: string | null
}

export interface WeightEntry {
  /** local YYYY-MM-DD. Optional: entries saved before dates existed only have `label`. */
  date?: string
  /** legacy label from older saves; every row used to say "This week" */
  label?: string
  w: number
}

export interface Profile {
  bw: string
  height: string
  /** what he wants to be called; falls back to the account email's local part */
  name?: string
  /** bodyweight target in kg — his, not a constant */
  goalWeight?: string
}

/** The four tape measurements, in cm. Every field optional: log what you measured. */
export interface MeasureEntry {
  /** local YYYY-MM-DD */
  date: string
  chest?: number
  arms?: number
  waist?: number
  thighs?: number
}

/** Things the user can change. Defaults live in store/settings.ts. */
export interface Settings {
  /** seconds of rest auto-started when a set is checked off */
  restSeconds: number
  /** sessions per week he's aiming for */
  weekGoal: number
  /** show the "avoid these" coaching block */
  showTips: boolean
}

export type FlashKind = { good: boolean; msg: string }

export type Screen =
  | 'home'
  | 'train'
  | 'library'
  | 'detail'
  | 'progress'
  | 'you'
  | 'program'
  | 'history'
  | 'body'
  | 'summary'
  | 'setup'
  | 'achievements'
  | 'settings'
