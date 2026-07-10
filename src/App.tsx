import { useViewModel } from './store/viewModel'
import { BottomNav } from './components/BottomNav'
import { Flash } from './components/Flash'
import { WeeklyLogModal } from './components/WeeklyLogModal'
import { Home } from './screens/Home'
import { Train } from './screens/Train'
import { Library } from './screens/Library'
import { Detail } from './screens/Detail'
import { Progress } from './screens/Progress'
import { You } from './screens/You'
import { Program } from './screens/Program'
import { History } from './screens/History'
import { Body } from './screens/Body'
import { Summary } from './screens/Summary'
import { Setup } from './screens/Setup'
import { Achievements } from './screens/Achievements'
import { Settings } from './screens/Settings'
import { Login } from './screens/Login'
import { useAuth } from './store/auth'

export default function App() {
  const vm = useViewModel()
  const { user, loading } = useAuth()

  return (
    <div className="app-shell">
      <div className="phone">
        {/* simulated status bar — desktop mock only; hidden on real devices */}
        <div className="status-bar">
          <span style={{ fontFamily: "'Archivo'", fontWeight: 700, fontSize: 15, color: '#F4F4F5', letterSpacing: '.3px' }}>{vm.statusTime}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="18" height="12" viewBox="0 0 18 12" fill="#F4F4F5">
              <rect x="0" y="7" width="3" height="5" rx="1" />
              <rect x="5" y="4" width="3" height="8" rx="1" />
              <rect x="10" y="2" width="3" height="10" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" />
            </svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <rect x="1" y="1" width="20" height="10" rx="2.5" stroke="#F4F4F5" strokeOpacity=".5" />
              <rect x="3" y="3" width="15" height="6" rx="1" fill="#CCFF00" />
              <rect x="22" y="4" width="2" height="4" rx="1" fill="#F4F4F5" fillOpacity=".5" />
            </svg>
          </div>
        </div>

        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #26262c', borderTopColor: '#CCFF00', animation: 'ringspin .8s linear infinite' }} />
          </div>
        ) : !user ? (
          <Login />
        ) : (
          <>
            {/* scroll content */}
            <div data-scroll className="screen-scroll">
              <div style={{ minHeight: '100%', paddingBottom: 'calc(104px + env(safe-area-inset-bottom, 0px))' }}>
                {vm.isHome && <Home vm={vm} />}
                {vm.isTrain && <Train vm={vm} />}
                {vm.isLibrary && <Library vm={vm} />}
                {vm.isDetail && <Detail vm={vm} />}
                {vm.isProgress && <Progress vm={vm} />}
                {vm.isYou && <You vm={vm} />}
                {vm.isProgram && <Program vm={vm} />}
                {vm.isHistory && <History vm={vm} />}
                {vm.isBody && <Body vm={vm} />}
                {vm.isSummary && <Summary vm={vm} />}
                {vm.isSetup && <Setup vm={vm} />}
                {vm.isAchievements && <Achievements vm={vm} />}
                {vm.isSettings && <Settings vm={vm} />}
              </div>
            </div>

            <BottomNav vm={vm} />
            <WeeklyLogModal vm={vm} />
            <Flash vm={vm} />
          </>
        )}
      </div>
    </div>
  )
}
