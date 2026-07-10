import type { Settings } from '../data/types'

/**
 * Starting values only. The live values are `state.settings`, which the user
 * edits on the Settings screen and which persists/syncs like everything else.
 * 120s suits compound lifts; 5 sessions matches the seeded Push/Pull/Legs week.
 */
export const DEFAULT_SETTINGS: Settings = {
  restSeconds: 120,
  weekGoal: 5,
  showTips: true,
}

/** Rest-timer choices offered in the UI, in seconds. */
export const REST_CHOICES = [60, 90, 120, 150, 180, 240] as const
