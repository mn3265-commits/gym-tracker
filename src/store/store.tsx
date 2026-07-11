import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { reducer, type Action } from './reducer'
import { initialState, loadPersisted, savePersisted, STORAGE_KEY, type AppState } from './state'
import type { Group, Screen, Unit, MeasureEntry } from '../data/types'
import { useAuth } from './auth'
import { loadRemote, pickPersisted, saveRemote } from './sync'

/** Scroll the phone's content area back to the top (mirrors the prototype). */
function scrollTop() {
  const sc = document.querySelector('[data-scroll]')
  if (sc) sc.scrollTop = 0
}

export interface Actions {
  go: (screen: Screen) => void
  openEx: (id: number) => void
  setProg: (id: number) => void
  setFilter: (filter: string) => void
  setProfileField: (k: 'bw' | 'height' | 'name' | 'goalWeight', v: string) => void
  setLogInput: (v: string) => void
  openLog: () => void
  closeLog: () => void
  addWeight: () => void
  generateTargets: () => void
  toggleSwap: (id: number) => void
  chooseSwap: (id: number, name: string | null) => void
  setUnit: (name: string, unit: Unit) => void
  startWorkout: (type: Group) => void
  toggleSet: (ei: number, si: number) => void
  bump: (ei: number, si: number, d: number) => void
  bumpReps: (ei: number, si: number, d: number) => void
  addSet: (ei: number) => void
  toggleWarmup: (ei: number) => void
  setWeightKg: (ei: number, si: number, kg: number) => void
  setReps: (ei: number, si: number, reps: number) => void
  deleteSet: (ei: number, si: number) => void
  toggleAddEx: () => void
  addExercise: (id: number) => void
  removeExercise: (ei: number) => void
  setSetting: (k: 'restSeconds' | 'weekGoal' | 'showTips', v: number | boolean) => void
  addMeasurement: (entry: MeasureEntry) => void
  addRest: (sec: number) => void
  skipRest: () => void
  finishWorkout: () => void
  closeSummary: () => void
  setSharing: (v: boolean) => void
  cycleDay: (i: number) => void
}

const StateCtx = createContext<AppState | null>(null)
const ActionsCtx = createContext<Actions | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (base) => ({ ...base, ...loadPersisted() }))
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch

  // Persist personalized data locally as a fast-paint cache.
  useEffect(() => {
    savePersisted(state)
  }, [state])

  // ── cloud sync (per account) ──
  const { user, loading: authLoading } = useAuth()
  const hydratedRef = useRef<string | null>(null)

  // On login, load this account's cloud data; a brand-new account (or logout) starts clean.
  useEffect(() => {
    if (authLoading) return // wait for the auth session to resolve before touching state
    if (!user) {
      hydratedRef.current = null
      dispatchRef.current({ type: 'RESET' })
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      return
    }
    let cancelled = false
    hydratedRef.current = null
    loadRemote(user.id).then(({ status, data }) => {
      if (cancelled) return
      if (status === 'ok' && data) {
        dispatchRef.current({ type: 'HYDRATE', data })
        hydratedRef.current = user.id // safe to sync
      } else if (status === 'empty') {
        dispatchRef.current({ type: 'RESET' }) // brand-new account starts clean
        hydratedRef.current = user.id // first save creates the row
      }
      // status === 'error': keep local cache, leave hydratedRef null so we never
      // overwrite the cloud copy with a half-loaded/empty state this session.
    })
    return () => {
      cancelled = true
    }
  }, [user?.id, authLoading])

  // Debounced push to the cloud, only after this account's initial hydrate.
  useEffect(() => {
    if (!user || hydratedRef.current !== user.id) return
    const t = setTimeout(() => {
      void saveRemote(user.id, pickPersisted(state))
    }, 800)
    return () => clearTimeout(t)
  }, [state, user])

  // Workout elapsed clock.
  useEffect(() => {
    if (!state.workout) return
    const t = setInterval(() => dispatchRef.current({ type: 'TICK_ELAPSED' }), 1000)
    return () => clearInterval(t)
  }, [state.workout])

  // Rest countdown — re-syncs when a new set starts resting.
  useEffect(() => {
    if (!state.restActive) return
    const t = setInterval(() => dispatchRef.current({ type: 'TICK_REST' }), 1000)
    return () => clearInterval(t)
  }, [state.restActive, state.restOwner])

  // Auto-dismiss the target success/miss flash.
  useEffect(() => {
    if (!state.flash) return
    const t = setTimeout(() => dispatchRef.current({ type: 'CLEAR_FLASH' }), 2600)
    return () => clearTimeout(t)
  }, [state.flash])

  const actions = useMemo<Actions>(() => {
    const d = (a: Action) => dispatchRef.current(a)
    const nav = (screen: Screen) => {
      d({ type: 'NAV', screen })
      scrollTop()
    }
    return {
      go: nav,
      openEx: (id) => {
        d({ type: 'OPEN_EX', id })
        scrollTop()
      },
      setProg: (id) => d({ type: 'SET_PROG', id }),
      setFilter: (filter) => d({ type: 'SET_FILTER', filter }),
      setProfileField: (k, v) => d({ type: 'SET_PROFILE_FIELD', k, v }),
      setLogInput: (v) => d({ type: 'SET_LOG_INPUT', v }),
      openLog: () => d({ type: 'OPEN_LOG' }),
      closeLog: () => d({ type: 'CLOSE_LOG' }),
      addWeight: () => d({ type: 'ADD_WEIGHT' }),
      generateTargets: () => {
        d({ type: 'GENERATE_TARGETS' })
        scrollTop()
      },
      toggleSwap: (id) => d({ type: 'TOGGLE_SWAP', id }),
      chooseSwap: (id, name) => d({ type: 'CHOOSE_SWAP', id, name }),
      setUnit: (name, unit) => d({ type: 'SET_UNIT', name, unit }),
      startWorkout: (type) => {
        d({ type: 'START_WORKOUT', trainType: type })
        scrollTop()
      },
      toggleSet: (ei, si) => d({ type: 'TOGGLE_SET', ei, si }),
      bump: (ei, si, dd) => d({ type: 'BUMP', ei, si, d: dd }),
      bumpReps: (ei, si, dd) => d({ type: 'BUMP_REPS', ei, si, d: dd }),
      addSet: (ei) => d({ type: 'ADD_SET', ei }),
      toggleWarmup: (ei) => d({ type: 'TOGGLE_WARMUP', ei }),
      setWeightKg: (ei, si, kg) => d({ type: 'SET_WEIGHT', ei, si, kg }),
      setReps: (ei, si, reps) => d({ type: 'SET_REPS', ei, si, reps }),
      deleteSet: (ei, si) => d({ type: 'DELETE_SET', ei, si }),
      toggleAddEx: () => d({ type: 'TOGGLE_ADD_EX' }),
      addExercise: (id) => d({ type: 'ADD_EXERCISE', id }),
      removeExercise: (ei) => d({ type: 'REMOVE_EXERCISE', ei }),
      setSetting: (k, v) => d({ type: 'SET_SETTING', k, v }),
      addMeasurement: (entry) => d({ type: 'ADD_MEASUREMENT', entry }),
      addRest: (sec) => d({ type: 'ADD_REST', sec }),
      skipRest: () => d({ type: 'SKIP_REST' }),
      finishWorkout: () => {
        d({ type: 'FINISH_WORKOUT' })
        scrollTop()
      },
      closeSummary: () => {
        d({ type: 'CLOSE_SUMMARY' })
        scrollTop()
      },
      setSharing: (v) => d({ type: 'SET_SHARING', v }),
      cycleDay: (i) => d({ type: 'CYCLE_DAY', i }),
    }
  }, [])

  return (
    <StateCtx.Provider value={state}>
      <ActionsCtx.Provider value={actions}>{children}</ActionsCtx.Provider>
    </StateCtx.Provider>
  )
}

export function useAppState(): AppState {
  const s = useContext(StateCtx)
  if (!s) throw new Error('useAppState must be used within StoreProvider')
  return s
}

export function useActions(): Actions {
  const a = useContext(ActionsCtx)
  if (!a) throw new Error('useActions must be used within StoreProvider')
  return a
}
