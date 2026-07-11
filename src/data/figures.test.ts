import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FIGURES, figureFor } from './figures'
import { SEED_EXERCISES } from './exercises'

const PUBLIC = new URL('../../public/exercise/', import.meta.url).pathname

/** Every movement the app can show: the 15 lifts plus all their swap alternatives. */
function allMovementNames(): string[] {
  const names = new Set<string>()
  for (const e of SEED_EXERCISES) {
    names.add(e.name)
    for (const a of e.alts) names.add(a.n)
  }
  return [...names]
}

describe('exercise figures', () => {
  it('every movement — lift or swap alternative — is in the figure map', () => {
    const missing = allMovementNames().filter((n) => !(n in FIGURES))
    expect(missing).toEqual([])
  })

  it('only Nordic Curl has no illustration (nothing honest to show)', () => {
    const nulls = Object.entries(FIGURES).filter(([, v]) => v === null).map(([k]) => k)
    expect(nulls).toEqual(['Nordic Curl'])
  })

  it('both frames exist on disk for every mapped figure', () => {
    const missing: string[] = []
    for (const fig of Object.values(FIGURES)) {
      if (!fig) continue
      for (const phase of ['start', 'end']) {
        if (!existsSync(`${PUBLIC}${fig.slug}-${phase}.svg`)) missing.push(`${fig.slug}-${phase}.svg`)
      }
    }
    expect(missing).toEqual([])
  })

  it('the frames are real SVGs, not an error page', () => {
    for (const fig of Object.values(FIGURES)) {
      if (!fig) continue
      const svg = readFileSync(`${PUBLIC}${fig.slug}-start.svg`, 'utf8')
      expect(svg.startsWith('<svg')).toBe(true)
      expect(svg.length).toBeGreaterThan(500)
    }
  })

  it('start and end are actually different drawings', () => {
    for (const fig of Object.values(FIGURES)) {
      if (!fig) continue
      const a = readFileSync(`${PUBLIC}${fig.slug}-start.svg`, 'utf8')
      const b = readFileSync(`${PUBLIC}${fig.slug}-end.svg`, 'utf8')
      expect(a).not.toBe(b)
    }
  })

  it('no two movements share a slug (each gets its own file pair)', () => {
    const slugs = Object.values(FIGURES).filter(Boolean).map((f) => f!.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('figureFor resolves a main lift, a swap alt, and the one null', () => {
    expect(figureFor('Bench Press')).not.toBeNull()
    expect(figureFor('Machine Chest Press')).not.toBeNull()
    expect(figureFor('Front Squat')).not.toBeNull()
    expect(figureFor('Nordic Curl')).toBeNull()
    expect(figureFor('Not A Real Movement')).toBeNull()
  })

  it('ships the licence file the CC BY-SA attribution requires', () => {
    expect(existsSync(`${PUBLIC}LICENSE.txt`)).toBe(true)
  })
})
