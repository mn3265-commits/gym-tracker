// ── Design tokens ────────────────────────────────────────────────────────────
// Dark, bold, athletic palette pulled 1:1 from the Claude Design prototype.

import type { Group } from './types'

/** Per-split accent colors. */
export const C: Record<Group, string> = {
  Push: '#FF6A2C',
  Pull: '#4EA8FF',
  Legs: '#B388FF',
  Upper: '#FFCE3D',
  Lower: '#3DDC84',
  Rest: '#5A5A62',
}

/** Volt green — the primary brand accent. */
export const VOLT = '#CCFF00'

