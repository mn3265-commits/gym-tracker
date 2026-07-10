import { useMemo } from 'react'
import { useActions, useAppState, type Actions } from './store'
import { SETTINGS } from './settings'
import { C, VOLT } from '../data/tokens'
import { BACK_ZONES, EQUIP, FRONT_ZONES } from '../data/exercises'
import type { AppState } from './state'
import type { Group, Role } from '../data/types'
import { MONTHS, dayKey, parseDay, resolveToday, weekDateObjects, weekStartKey } from '../lib/day'
import {
  bmiFor,
  buildMuscleMap,
  exercisesForType,
  fmtClock,
  fmtWeight,
  nextWeight,
  pctVal,
  proteinFor,
  rankInfo,
  renderBody,
  repTop,
  effectiveExercises,
  performedStats,
  resolveAlts,
  toNum,
} from '../lib/calc'

const roleInfo = (r: Role) =>
  r === 'key'
    ? { label: 'KEY LIFT', color: VOLT, bg: '#1c2408', border: '#2f3d0a' }
    : r === 'main'
      ? { label: 'CORE', color: '#dfe6c9', bg: '#1a1a1e', border: '#2a2a31' }
      : { label: 'EXTRA', color: '#7d7d86', bg: 'transparent', border: '#26262c' }

const equipOf = (name: string) => EQUIP[name] || 'Other'

function build(S: AppState, A: Actions) {
  const ex = effectiveExercises(S.profile.bw, S.tailoredDone, S.lifts)
  const unitOf = (name: string) => S.units[name] || 'kg'
  const kg = (n: number, name: string) => fmtWeight(n, unitOf(name))
  const num = (n: number, name: string) => toNum(n, unitOf(name))

  const showTips = SETTINGS.showTips
  const weekGoal = SETTINGS.weekGoal
  const now = new Date()
  const hr = now.getHours()
  const greeting = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'
  const statusTime = `${((hr + 11) % 12) + 1}:${String(now.getMinutes()).padStart(2, '0')}`

  const screen = S.screen
  const flags = {
    isHome: screen === 'home',
    isTrain: screen === 'train',
    isLibrary: screen === 'library',
    isDetail: screen === 'detail',
    isProgress: screen === 'progress',
    isYou: screen === 'you',
    isProgram: screen === 'program',
    isHistory: screen === 'history',
    isBody: screen === 'body',
    isSummary: screen === 'summary',
    isSetup: screen === 'setup',
    isAchievements: screen === 'achievements',
  }

  // ── nav ──
  const navDefs = [
    { key: 'home' as const, label: 'Home', d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { key: 'train' as const, label: 'Train', d: 'M4 12h16M6.5 8v8M4 9.5v5M17.5 8v8M20 9.5v5' },
    { key: 'library' as const, label: 'Library', d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' },
    { key: 'progress' as const, label: 'Progress', d: 'M3 3v18h18M7 14l3-3 4 4 5-6' },
    { key: 'you' as const, label: 'You', d: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ]
  const activeKey = ['detail', 'library'].includes(screen)
    ? 'library'
    : ['program', 'history', 'body', 'you', 'achievements', 'setup', 'summary'].includes(screen)
      ? 'you'
      : screen === 'progress'
        ? 'progress'
        : screen === 'train'
          ? 'train'
          : 'home'
  const nav = navDefs.map((n) => ({ ...n, color: n.key === activeKey ? VOLT : '#54545c', onTap: () => A.go(n.key) }))

  // ── today (real date) ──
  const tinfo = resolveToday(S.program, now)
  const TODAY_IDX = tinfo.idx
  const trainType = tinfo.trainType
  const tColor = C[tinfo.type]
  const trainColor = C[trainType]
  const todayEx = exercisesForType(ex, trainType)
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const focusByType: Record<Group, string> = {
    Push: 'Chest · Shoulders · Triceps',
    Pull: 'Back · Biceps · Rear delts',
    Legs: 'Quads · Hamstrings · Glutes',
    Upper: 'Full upper body',
    Lower: 'Full lower body',
    Rest: 'Recovery',
  }
  const today = {
    type: tinfo.type,
    color: tColor,
    glow: tColor,
    isRest: tinfo.isRest,
    trainType,
    trainColor,
    dayLong: dayNames[TODAY_IDX]!,
    count: todayEx.length,
    est: todayEx.length * 11,
    focusText: focusByType[trainType],
    subtitle: tinfo.isRest
      ? `Rest day · start ${trainType} when you're ready`
      : `${todayEx.length} exercises · ~${todayEx.length * 11} min · ${focusByType[trainType]}`,
    startLabel: tinfo.isRest ? `START ${trainType.toUpperCase()} DAY` : 'START WORKOUT',
    exercises: todayEx.map((e, i) => {
      const ri = roleInfo(e.role)
      return {
        num: i + 1,
        name: e.name,
        scheme: e.scheme,
        nextStr: kg(nextWeight(e), e.name),
        tint: `${trainColor}22`,
        roleLabel: ri.label,
        roleColor: ri.color,
        roleBg: ri.bg,
        roleBorder: ri.border,
      }
    }),
  }

  // ── sessions index ──
  const sessionDays = new Set(S.sessions.map((s) => s.date))
  const wDateObjs = weekDateObjects(now)

  // ── week strip ──
  const dayShort = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const codeMap: Record<Group, string> = { Push: 'PS', Pull: 'PL', Legs: 'LG', Upper: 'UP', Lower: 'LO', Rest: '—' }
  const week = S.program.map((t, i) => {
    const isToday = i === TODAY_IDX
    const isDone = sessionDays.has(dayKey(wDateObjs[i]!))
    const isRest = t === 'Rest'
    const col = C[t] || '#5A5A62'
    return {
      day: dayShort[i]!,
      code: codeMap[t],
      onTap: () => A.go('program'),
      bg: isToday ? `${col}1f` : '#141417',
      border: isToday ? col : '#26262c',
      dayColor: isToday ? col : '#61616a',
      codeColor: isRest ? '#4a4a52' : isToday ? col : '#c8c8ce',
      dot: isDone ? '#3DDC84' : isToday ? col : 'transparent',
    }
  })

  // ── stats (real) ──
  const weekKeys = new Set(wDateObjs.map(dayKey))
  const weekSessions = S.sessions.filter((s) => weekKeys.has(s.date))
  const weekDoneCount = new Set(weekSessions.map((s) => s.date)).size
  const weekVolumeKg = weekSessions.reduce((a, s) => a + s.volumeKg, 0)
  const sessionWeekKeys = new Set(S.sessions.map((s) => weekStartKey(parseDay(s.date))))
  let streakN = 0
  const cursor = new Date(now)
  while (sessionWeekKeys.has(weekStartKey(cursor))) {
    streakN++
    cursor.setDate(cursor.getDate() - 7)
  }
  const stats = { streak: streakN, weekDone: weekDoneCount, weekGoal, volume: (weekVolumeKg / 1000).toFixed(1) }

  // ── rank / momentum ──
  const rk = rankInfo(S.xp)
  const rank = {
    name: rk.name,
    next: rk.next,
    pct: `${rk.pct}%`,
    xpStr: rk.next ? `${rk.into.toLocaleString()} / ${rk.need.toLocaleString()} XP` : `${S.xp.toLocaleString()} XP · MAX`,
    totalXp: S.xp.toLocaleString(),
    streak: stats.streak,
    weekDone: stats.weekDone,
    weekGoal,
  }

  // ── achievements ──
  const anyHeavy = ex.some((e) => e.current >= 100)
  const achDefs = [
    { name: 'First Rep', desc: 'Finish your first workout', d: 'M5 13l4 4L19 7', earned: S.sessionsCompleted >= 1 },
    { name: 'Personalized', desc: 'Tailor your starting weights', d: 'M12 20v-8M6 20h12M12 8V4', earned: S.tailoredDone },
    { name: 'Sharpshooter', desc: 'Hit 25 target lifts', d: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0', earned: S.targetsHitTotal >= 25 },
    { name: 'Century', desc: 'Work a lift at 100 kg+', d: 'M4 12h16M6.5 8v8M17.5 8v8', earned: anyHeavy },
    { name: 'Consistent', desc: 'Hold a 6-week streak', d: 'M13 2L3 14h7l-1 8 10-12h-7z', earned: stats.streak >= 6 },
    { name: 'Tracker', desc: 'Log 7 weekly weigh-ins', d: 'M3 3v18h18M7 14l3-3 4 4 5-6', earned: S.weightLog.length >= 7 },
    { name: 'Grinder', desc: 'Complete 10 sessions', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 6v6l4 2', earned: S.sessionsCompleted >= 10 },
    { name: 'Beast Mode', desc: 'Reach BEAST rank', d: 'M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.5 5.7 21l2.3-7.1-6-4.5h7.6z', earned: S.xp >= 5000 },
  ]
  const achievements = achDefs.map((a) => ({
    name: a.name,
    desc: a.desc,
    d: a.d,
    earned: a.earned,
    color: a.earned ? VOLT : '#54545c',
    bg: a.earned ? '#1c2408' : '#141417',
    border: a.earned ? '#2f3d0a' : '#26262c',
    nameColor: a.earned ? '#F4F4F5' : '#7d7d86',
  }))
  const achEarned = achDefs.filter((a) => a.earned).length

  // ── top targets ──
  // What he should care about today: the lifts he is about to train, heaviest
  // roles first, then whichever is closest to its goal. On a rest day, fall
  // back to the key lifts across the whole program.
  const roleRank: Record<Role, number> = { key: 0, main: 1, accessory: 2 }
  const targetPool = todayEx.length ? todayEx : ex
  const topTargets = [...targetPool]
    .sort((a, b) => roleRank[a.role] - roleRank[b.role] || pctVal(b) - pctVal(a))
    .slice(0, 4)
    .map((e) => ({
      name: e.name,
      currentStr: kg(e.current, e.name),
      nextStr: kg(nextWeight(e), e.name),
      pct: `${pctVal(e)}%`,
      color: C[e.group],
      onTap: () => {
        A.setProg(e.id)
        A.go('progress')
      },
    }))

  // ── train ──
  const trainPreview = !S.workout
  const trainLive = !!S.workout
  let trainBodyFront = renderBody(FRONT_ZONES, {})
  let trainBodyBack = renderBody(BACK_ZONES, {})
  let workout: ReturnType<typeof buildWorkoutVm> | null = null

  function buildWorkoutVm() {
    const W = S.workout!
    const muscleEntries = W.exercises.map((exi) => {
      const src = ex.find((x) => x.id === exi.id)!
      const doneCount = exi.sets.filter((s) => s.done).length
      return { muscles: src.muscles, state: (doneCount > 0 ? 'done' : 'todo') as 'done' | 'todo' }
    })
    const muscleMap = buildMuscleMap(muscleEntries)
    trainBodyFront = renderBody(FRONT_ZONES, muscleMap)
    trainBodyBack = renderBody(BACK_ZONES, muscleMap)
    return {
      clock: fmtClock(S.elapsed),
      exercises: W.exercises.map((exi, ei) => {
        const src = ex.find((x) => x.id === exi.id)!
        const done = exi.sets.filter((s) => s.done).length
        const ri = roleInfo(src.role)
        const display = S.swaps[exi.id] || src.name
        const swapped = display !== src.name
        const opts = [{ name: src.name, note: 'Original movement', orig: true }].concat(
          src.alts.map((a) => ({ name: a.n, note: a.w, orig: false })),
        )
        const resolvedAlts = resolveAlts(src, S.lifts)
        const stats2 = performedStats(src, S.swaps, S.lifts)
        const gr = repTop(src)
        const allDone = exi.sets.length > 0 && exi.sets.every((s) => s.done)
        const allMet = allDone && exi.sets.every((s) => s.weight >= exi.next && s.reps >= gr)
        const nextJump = kg(Math.min(exi.next + stats2.inc, stats2.goal), display)
        let bTitle: string, bHint: string, bBg: string, bBorder: string, bAccent: string, bLabelColor: string, bHintColor: string
        if (allMet) {
          bTitle = 'TARGET SMASHED'
          bHint = `All sets cleared — bump to ${nextJump} next ${src.group.toLowerCase()} day`
          bBg = 'linear-gradient(100deg,#0f2417,#141417)'
          bBorder = '#1e4a2f'
          bAccent = '#3DDC84'
          bLabelColor = '#5fe39a'
          bHintColor = '#c8f0d8'
        } else if (allDone) {
          bTitle = 'ALMOST THERE'
          bHint = `Hit ${gr} clean reps on every set at ${kg(exi.next, display)} to unlock the jump`
          bBg = 'linear-gradient(100deg,#241408,#141417)'
          bBorder = '#3d2a0a'
          bAccent = '#FF6A2C'
          bLabelColor = '#e0964f'
          bHintColor = '#f0d8c8'
        } else {
          bTitle = 'TARGET TO GROW'
          bHint = `Do all ${exi.sets.length} sets × ${gr} reps at ${kg(exi.next, display)}`
          bBg = 'linear-gradient(100deg,#1c2408,#141417)'
          bBorder = '#2f3d0a'
          bAccent = VOLT
          bLabelColor = '#a9c93f'
          bHintColor = '#e9f3c8'
        }
        const exUnit = unitOf(display)
        return {
          name: exi.name,
          displayName: display,
          muscle: exi.muscle,
          equip: equipOf(display),
          nextStr: kg(exi.next, display),
          unitLabel: exUnit.toUpperCase(),
          doneCount: done,
          setCount: exi.sets.length,
          subNote: swapped ? `swapped · ${exi.muscle}` : exi.muscle,
          roleLabel: ri.label,
          roleColor: ri.color,
          roleBg: ri.bg,
          roleBorder: ri.border,
          swapOpen: S.openSwap === exi.id,
          swapBg: swapped ? '#1c2408' : '#0f0f12',
          swapBorder: swapped ? '#2f3d0a' : '#33333b',
          swapColor: swapped ? VOLT : '#8a8a93',
          onSwap: () => A.toggleSwap(exi.id),
          altOptions: opts.map((o) => {
            const cur = display === o.name
            const os = o.orig ? src : resolvedAlts.find((a) => a.n === o.name)!
            return {
              name: o.name,
              note: o.note,
              equip: equipOf(o.name),
              weightStr: `${kg(os.current, o.name)} → ${kg(os.goal, o.name)}`,
              onPick: () => A.chooseSwap(exi.id, o.orig ? null : o.name),
              bg: cur ? '#1c2408' : 'transparent',
              border: cur ? '#2f3d0a' : '#26262c',
              nameColor: cur ? VOLT : '#F4F4F5',
              dotBorder: cur ? VOLT : '#33333b',
              dotBg: cur ? VOLT : 'transparent',
            }
          }),
          bTitle,
          bHint,
          bBg,
          bBorder,
          bAccent,
          bLabelColor,
          bHintColor,
          unitKgBg: exUnit === 'kg' ? VOLT : 'transparent',
          unitKgColor: exUnit === 'kg' ? '#0B0B0D' : '#8a8a93',
          unitLbBg: exUnit === 'lb' ? VOLT : 'transparent',
          unitLbColor: exUnit === 'lb' ? '#0B0B0D' : '#8a8a93',
          setKg: () => A.setUnit(display, 'kg'),
          setLb: () => A.setUnit(display, 'lb'),
          onOpen: () => A.openEx(exi.id),
          addSet: () => A.addSet(ei),
          sets: exi.sets.map((s, si) => {
            const met = s.done && s.weight >= s.target && s.reps >= s.goalReps
            const missed = s.done && !met
            const resting = S.restActive && S.restOwner != null && S.restOwner.ei === ei && S.restOwner.si === si
            const restDur = S.restDur || SETTINGS.restSeconds
            return {
              num: si + 1,
              prev: s.prev,
              weight: num(s.weight, display),
              reps: s.reps,
              rowBg: met ? '#12240f' : missed ? '#241408' : 'transparent',
              numColor: s.done ? (met ? '#3DDC84' : '#FF6A2C') : '#61616a',
              checkBg: s.done ? (met ? '#3DDC84' : '#FF6A2C') : '#0f0f12',
              checkBorder: s.done ? (met ? '#3DDC84' : '#FF6A2C') : '#33333b',
              checkStroke: s.done ? '#0B0B0D' : '#3a3a42',
              toggle: () => A.toggleSet(ei, si),
              inc: () => A.bump(ei, si, stats2.inc),
              dec: () => A.bump(ei, si, -stats2.inc),
              repInc: () => A.bumpReps(ei, si, 1),
              repDec: () => A.bumpReps(ei, si, -1),
              resting,
              restText: fmtClock(S.rest),
              restPct: Math.max(0, Math.min(100, Math.round((S.rest / restDur) * 100))),
              restLess: () => A.addRest(-15),
              restMore: () => A.addRest(15),
              restSkip: () => A.skipRest(),
            }
          }),
        }
      }),
    }
  }
  if (S.workout) workout = buildWorkoutVm()

  // ── library ──
  const filters = ['All', 'Push', 'Pull', 'Legs'].map((f) => ({
    label: f,
    onTap: () => A.setFilter(f),
    bg: S.filter === f ? VOLT : '#141417',
    border: S.filter === f ? VOLT : '#26262c',
    color: S.filter === f ? '#0B0B0D' : '#c8c8ce',
  }))
  const libList = ex
    .filter((e) => S.filter === 'All' || e.group === S.filter)
    .map((e) => {
      const ri = roleInfo(e.role)
      return {
        name: e.name,
        group: e.group,
        primary: e.primary,
        equip: equipOf(e.name),
        currentNum: num(e.current, e.name),
        unitLabel: unitOf(e.name).toUpperCase(),
        color: C[e.group],
        tint: `${C[e.group]}22`,
        roleLabel: ri.label,
        roleColor: ri.color,
        roleBg: ri.bg,
        roleBorder: ri.border,
        onTap: () => A.openEx(e.id),
      }
    })

  // ── detail ──
  const de = ex.find((x) => x.id === S.exId) || ex[0]!
  const dri = roleInfo(de.role)
  const dUnit = unitOf(de.name)
  const dPerformed = S.swaps[de.id] || de.name
  const detail = {
    name: de.name,
    group: de.group,
    color: C[de.group],
    roleLabel: dri.label,
    roleColor: dri.color,
    roleBg: dri.bg,
    roleBorder: dri.border,
    equip: equipOf(de.name),
    swapped: dPerformed !== de.name,
    performedName: dPerformed,
    // Tapping a row actually performs the swap. The original lift is the first
    // row, so a swap can always be undone from here.
    alts: [
      { n: de.name, w: 'Original movement', orig: true, current: de.current, goal: de.goal },
      ...resolveAlts(de, S.lifts).map((a) => ({ n: a.n, w: a.w, orig: false, current: a.current, goal: a.goal })),
    ].map((a) => {
      const active = dPerformed === a.n
      return {
        name: a.n,
        note: a.w,
        equip: equipOf(a.n),
        weightStr: `${kg(a.current, a.n)} → ${kg(a.goal, a.n)}`,
        active,
        onPick: () => A.chooseSwap(de.id, a.orig ? null : a.n),
        bg: active ? '#1c2408' : '#141417',
        border: active ? '#2f3d0a' : '#26262c',
        nameColor: active ? VOLT : '#F4F4F5',
        dotBorder: active ? VOLT : '#33333b',
        dotBg: active ? VOLT : 'transparent',
      }
    }),
    unitLabel: dUnit.toUpperCase(),
    unitKgBg: dUnit === 'kg' ? VOLT : 'transparent',
    unitKgColor: dUnit === 'kg' ? '#0B0B0D' : '#8a8a93',
    unitLbBg: dUnit === 'lb' ? VOLT : 'transparent',
    unitLbColor: dUnit === 'lb' ? '#0B0B0D' : '#8a8a93',
    setKg: () => A.setUnit(de.name, 'kg'),
    setLb: () => A.setUnit(de.name, 'lb'),
    currentStr: kg(de.current, de.name),
    goalStr: kg(de.goal, de.name),
    nextStr: kg(nextWeight(de), de.name),
    tempo: de.tempo,
    tempoParts: [
      { label: 'DOWN', sec: de.tempo[0], color: '#F4F4F5' },
      { label: 'HOLD', sec: de.tempo[1], color: '#8a8a93' },
      { label: 'UP', sec: de.tempo[2], color: VOLT },
    ],
    tempoStr: de.tempo.join('-'),
    targetHint: `Add ${kg(de.inc, de.name)} once you clear the top of your rep range for all sets with good form.`,
    muscles: de.muscles.map((m, i) => ({
      name: m,
      color: i === 0 ? VOLT : '#c8c8ce',
      bg: i === 0 ? '#1c2408' : '#1a1a1e',
      border: i === 0 ? '#2f3d0a' : '#2a2a31',
    })),
    cues: de.cues.map((c, i) => ({ n: i + 1, text: c })),
    mistakes: de.mistakes.map((m) => ({ text: m })),
  }

  // ── progress ──
  // The curve is real logged top sets. Before there are two of them there is
  // nothing honest to draw, so the screen says so rather than inventing a line.
  const pe = ex.find((x) => x.id === S.progId) || ex[0]!
  const entries = S.lifts[pe.name]?.history ?? []
  const h = entries.map((e) => e.weight)
  const hasCurve = h.length >= 2
  const Wd = 300
  const Hd = 130
  const pad = 8
  const vmin = Math.min(pe.start, ...h) * 0.96
  const vmax = Math.max(pe.goal, ...h) * 1.02
  const span = vmax - vmin || 1
  const px = (i: number) => (h.length < 2 ? Wd / 2 : pad + (i * (Wd - 2 * pad)) / (h.length - 1))
  const py = (v: number) => Hd - pad - ((v - vmin) / span) * (Hd - 2 * pad)
  const dots = h.map((v, i) => ({ x: px(i).toFixed(1), y: py(v).toFixed(1) }))
  const linePts = dots.map((d) => `${d.x},${d.y}`).join(' ')
  const areaPts = hasCurve ? `${px(0).toFixed(1)},${Hd - pad} ${linePts} ${px(h.length - 1).toFixed(1)},${Hd - pad}` : ''
  const bestE1rm = entries.reduce((b, e) => Math.max(b, e.e1rm), 0)
  const prog = {
    name: pe.name,
    group: pe.group,
    color: C[pe.group],
    pct: `${pctVal(pe)}%`,
    hasCurve,
    sessionCount: entries.length,
    emptyHint:
      entries.length === 0
        ? 'No sessions logged for this lift yet — train it once and your curve starts here.'
        : 'One session in. Log another to draw the curve.',
    bestE1rmStr: bestE1rm > 0 ? kg(Math.round(bestE1rm * 10) / 10, pe.name) : '—',
    linePts,
    areaPts,
    goalY: py(pe.goal).toFixed(1),
    dots,
    startStr: kg(pe.start, pe.name),
    goalStr: kg(pe.goal, pe.name),
    currentStr: kg(pe.current, pe.name),
    nextStr: kg(nextWeight(pe), pe.name),
    gained: pe.current - pe.start,
  }
  const progList = ex.map((e) => ({
    name: e.name,
    currentStr: kg(e.current, e.name),
    goalStr: kg(e.goal, e.name),
    pct: `${pctVal(e)}%`,
    color: C[e.group],
    cardBorder: e.id === S.progId ? C[e.group] : '#26262c',
    onTap: () => A.setProg(e.id),
  }))

  // ── program ──
  const subs: Record<Group, string> = {
    Push: 'Chest · Shoulders · Triceps',
    Pull: 'Back · Biceps · Rear delts',
    Legs: 'Quads · Hams · Glutes',
    Upper: 'Full upper body',
    Lower: 'Full lower body',
    Rest: 'Recovery day',
  }
  const programDays = S.program.map((t, i) => {
    const col = C[t] || '#5A5A62'
    const isRest = t === 'Rest'
    return {
      dayShort: dayShort[i]!,
      date: wDateObjs[i]!.getDate(),
      type: t,
      sub: subs[t],
      color: col,
      glow: col,
      textColor: isRest ? '#7d7d86' : '#F4F4F5',
      border: i === TODAY_IDX ? col : '#26262c',
      onTap: () => A.cycleDay(i),
    }
  })

  // ── history calendar (real current month) ──
  const dow = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const calYear = now.getFullYear()
  const calMonth = now.getMonth()
  const todayDate = now.getDate()
  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7 // Monday-based lead blanks
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const cells: { n: number | ''; bg: string; border: string; textColor: string; dot: string }[] = []
  for (let b = 0; b < firstDow; b++) cells.push({ n: '', bg: 'transparent', border: 'transparent', textColor: 'transparent', dot: 'transparent' })
  for (let d = 1; d <= daysInMonth; d++) {
    const keyD = dayKey(new Date(calYear, calMonth, d))
    const sess = S.sessions.find((s) => s.date === keyD)
    const isToday = d === todayDate
    const future = d > todayDate
    cells.push({
      n: d,
      bg: isToday ? `${VOLT}22` : sess ? '#141417' : 'transparent',
      border: isToday ? VOLT : sess ? '#26262c' : 'transparent',
      textColor: isToday ? VOLT : future ? '#54545c' : '#c8c8ce',
      dot: sess ? '#3DDC84' : isToday ? VOLT : d < todayDate ? '#33333b' : 'transparent',
    })
  }
  const cal = { month: `${MONTHS[calMonth]} ${calYear}`, dow, cells }
  const dowShort = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const sessions = S.sessions
    .slice()
    .reverse()
    .slice(0, 8)
    .map((s) => {
      const d = parseDay(s.date)
      return {
        date: d.getDate(),
        dow: dowShort[(d.getDay() + 6) % 7]!,
        type: s.type,
        color: C[s.type],
        exCount: s.exCount,
        duration: `${Math.round(s.durationSec / 60)} min`,
        volume: `${(s.volumeKg / 1000).toFixed(1)} t`,
      }
    })
  const hasSessions = S.sessions.length > 0

  // ── body / full profile ──
  const log = S.weightLog
  const bwArr = log.map((e) => e.w)
  const hasW = bwArr.length > 0
  const bmin = hasW ? Math.min(...bwArr) - 0.5 : 0
  const bmax = hasW ? Math.max(...bwArr) + 0.5 : 1
  const bspan = bmax - bmin || 1
  const bpts = hasW
    ? bwArr.map((v, i) => `${(8 + (i * (300 - 16)) / (bwArr.length - 1 || 1)).toFixed(1)},${(52 - ((v - bmin) / bspan) * 44).toFixed(1)}`).join(' ')
    : ''
  const profileBwNum = parseFloat(S.profile.bw)
  const latestW = hasW ? bwArr[bwArr.length - 1]! : profileBwNum || 0
  const firstW = hasW ? bwArr[0]! : latestW
  const gainNum = Math.round((latestW - firstW) * 10) / 10
  const hNum = parseFloat(S.profile.height)
  const bmi = latestW > 0 ? bmiFor(latestW, hNum || null) : null
  const protein = proteinFor(latestW)
  const proteinForW = (w: number) => Math.round(w * 2.0)
  const bmiForW = (w: number) => (hNum && hNum > 80 ? (w / Math.pow(hNum / 100, 2)).toFixed(1) : '—')
  const logRows = log
    .map((e, i) => ({
      label: e.label,
      w: e.w.toFixed(1),
      bmi: bmiForW(e.w),
      protein: proteinForW(e.w),
      delta: i > 0 ? Math.round((e.w - log[i - 1]!.w) * 10) / 10 : null,
    }))
    .map((r) => ({
      ...r,
      deltaStr: r.delta == null ? '—' : r.delta > 0 ? `+${r.delta}` : String(r.delta),
      deltaColor: r.delta == null ? '#54545c' : r.delta > 0 ? '#3DDC84' : r.delta < 0 ? '#FF6A2C' : '#8a8a93',
    }))
    .reverse()
  const hasProfile = !!parseFloat(S.profile.bw)
  const body = {
    weight: latestW > 0 ? latestW.toFixed(1).replace(/\.0$/, '') : '—',
    gain: Math.abs(gainNum).toFixed(1).replace(/\.0$/, ''),
    gainArrow: gainNum >= 0 ? '▲' : '▼',
    gainColor: gainNum >= 0 ? '#3DDC84' : '#FF6A2C',
    goal: '84',
    linePts: bpts,
    hasProfile,
    noProfile: !hasProfile,
    bmi,
    noBmi: !bmi,
    protein,
    logRows,
    measures: [
      { name: 'Chest', val: '104', delta: '+2.0' },
      { name: 'Arms', val: '38.5', delta: '+1.2' },
      { name: 'Waist', val: '82', delta: '−1.0' },
      { name: 'Thighs', val: '60', delta: '+1.5' },
    ],
  }

  // ── session summary ──
  let summary: {
    color: string
    type: Group
    durationStr: string
    dateStr: string
    bodyFront: ReturnType<typeof renderBody>
    bodyBack: ReturnType<typeof renderBody>
    volumeStr: string
    setsDone: number
    setsPlanned: number
    hitCount: number
    exerciseCount: number
    headline: string
    xpGained: number
    leveledUp: boolean
    newRank: string | null
    rankPct: string
    rankNext: string | null
    exercises: { name: string; equip: string; setsStr: string; label: string; color: string; bg: string; border: string }[]
  } | null = null
  if (S.lastSummary) {
    const ls = S.lastSummary
    const col = C[ls.type] || VOLT
    const sMap = buildMuscleMap(ls.exercises.map((e) => ({ muscles: e.muscles, state: (e.setsDone > 0 ? 'done' : 'todo') as 'done' | 'todo' })))
    summary = {
      color: col,
      type: ls.type,
      durationStr: fmtClock(ls.duration),
      dateStr: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      bodyFront: renderBody(FRONT_ZONES, sMap),
      bodyBack: renderBody(BACK_ZONES, sMap),
      volumeStr: `${Math.round(ls.totalVolume).toLocaleString()} kg`,
      setsDone: ls.setsDone,
      setsPlanned: ls.setsPlanned,
      hitCount: ls.hitCount,
      exerciseCount: ls.exercises.length,
      headline:
        ls.hitCount === ls.exercises.length
          ? 'Every target hit — great session'
          : ls.hitCount > 0
            ? 'Solid work — some targets landed'
            : 'Logged and in the books',
      xpGained: ls.xpGained || 0,
      leveledUp: !!ls.leveledUp,
      newRank: ls.newRank,
      rankPct: `${ls.rankPct || 0}%`,
      rankNext: ls.rankNext,
      exercises: ls.exercises.map((e) => {
        const st =
          e.status === 'hit'
            ? { label: 'TARGET HIT', color: '#3DDC84', bg: '#0f2417', border: '#1e4a2f' }
            : e.status === 'miss'
              ? { label: 'MISSED', color: '#FF6A2C', bg: '#241408', border: '#3d2a0a' }
              : e.status === 'partial'
                ? { label: 'PARTIAL', color: '#c8c8ce', bg: '#1a1a1e', border: '#2a2a31' }
                : { label: 'SKIPPED', color: '#54545c', bg: 'transparent', border: '#26262c' }
        return {
          name: e.name,
          equip: equipOf(e.name),
          setsStr: `${e.setsDone}/${e.setsPlanned} sets`,
          label: st.label,
          color: st.color,
          bg: st.bg,
          border: st.border,
        }
      }),
    }
  }

  // ── setup / weekly-log popup fields ──
  const logNum = parseFloat(S.logInput)
  const canGenerate = !!(parseFloat(S.profile.bw) >= 25)

  return {
    statusTime,
    greeting,
    userName: 'Athlete',
    userInitial: 'A',
    ...flags,
    nav,
    today,
    week,
    stats,
    topTargets,
    rank,
    achievements,
    achEarned,
    achTotal: achievements.length,
    goAchievements: () => A.go('achievements'),
    trainPreview,
    trainLive,
    workout,
    trainBodyFront,
    trainBodyBack,
    filters,
    libList,
    detail,
    showTips,
    prog,
    progList,
    programDays,
    cal,
    sessions,
    hasSessions,
    body,
    summary,
    closeSummary: () => A.closeSummary(),
    sharing: S.sharing,
    notSharing: !S.sharing,
    profileBw: S.profile.bw,
    profileHeight: S.profile.height,
    tailoredDone: S.tailoredDone,
    canGenerate,
    notCanGenerate: !canGenerate,
    onBw: (v: string) => A.setProfileField('bw', v),
    onHeight: (v: string) => A.setProfileField('height', v),
    generateTargets: () => A.generateTargets(),
    goSetup: () => A.go('setup'),
    notTailored: !S.tailoredDone,
    logInput: S.logInput,
    onLogInput: (v: string) => A.setLogInput(v),
    addWeight: () => A.addWeight(),
    logModalOpen: S.logModalOpen,
    openLog: () => A.openLog(),
    closeLog: () => A.closeLog(),
    logPreviewBmi: logNum >= 25 && hNum && hNum > 80 ? (logNum / Math.pow(hNum / 100, 2)).toFixed(1) : '—',
    logPreviewProtein: logNum >= 25 ? String(Math.round(logNum * 2.0)) : '—',
    logCanSave: logNum >= 25,
    logCannotSave: !(logNum >= 25),
    logNeedsHeight: !(hNum && hNum > 80),
    flash: S.flash,
    flashMsg: S.flash?.msg,
    flashGood: !!(S.flash && S.flash.good),
    flashBad: !!(S.flash && !S.flash.good),
    flashAccent: S.flash ? (S.flash.good ? '#3DDC84' : '#FF6A2C') : VOLT,
    flashBg: S.flash ? (S.flash.good ? '#0f2417' : '#241408') : '#141417',
    flashBorder: S.flash ? (S.flash.good ? '#1e4a2f' : '#3d2a0a') : '#26262c',
    startWorkout: () => A.startWorkout(trainType),
    finishWorkout: () => A.finishWorkout(),
    backToLibrary: () => A.go('library'),
    goProgram: () => A.go('program'),
    goHistory: () => A.go('history'),
    goBody: () => A.go('body'),
    goProgress: () => A.go('progress'),
    goHome: () => A.go('home'),
    goYou: () => A.go('you'),
    saveSummaryImage: () => saveSummaryImage(A),
  }
}

// PNG export handled in a helper so the view model stays pure-ish.
async function saveSummaryImage(A: Actions) {
  const node = document.getElementById('share-card')
  const htmlToImage = await import('html-to-image')
  if (!node) return
  A.setSharing(true)
  try {
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    await fontsReady
    // warm render so fonts embed, then the real export
    await htmlToImage.toPng(node, { pixelRatio: 1, cacheBust: true })
    const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 3, cacheBust: true })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'workout-summary.png'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch {
    /* ignore */
  } finally {
    A.setSharing(false)
  }
}

export type ViewModel = ReturnType<typeof build>

export function useViewModel(): ViewModel {
  const state = useAppState()
  const actions = useActions()
  return useMemo(() => build(state, actions), [state, actions])
}
