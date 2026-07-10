import { describe, expect, it } from 'vitest'
import { weekLabel } from './day'

// Mondays: 2026-07-06 is the week containing Thu 2026-07-09
const NOW = new Date(2026, 6, 9)

describe('weekLabel — weigh-ins used to all say "This week"', () => {
  it('labels the current week', () => {
    expect(weekLabel('2026-07-09', NOW)).toBe('This week')
    expect(weekLabel('2026-07-06', NOW)).toBe('This week')
  })
  it('labels the previous week', () => {
    expect(weekLabel('2026-07-02', NOW)).toBe('Last week')
  })
  it('counts weeks back', () => {
    expect(weekLabel('2026-06-18', NOW)).toBe('3 weeks ago')
  })
  it('falls back to a date once relative stops helping', () => {
    expect(weekLabel('2026-04-09', NOW)).toMatch(/April/)
  })
  it('never reports a negative age for a future entry', () => {
    expect(weekLabel('2026-07-20', NOW)).toBe('This week')
  })
})
