import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import BottomNav from './components/BottomNav'
import TopBar from './components/TopBar'
import { AppProvider, useAppContext } from './context/AppContext'
import Activity from './pages/Activity'
import Feed from './pages/Feed'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import ProgressPage from './pages/Progress'
import Result from './pages/Result'
import SkillDetail from './pages/SkillDetail'
import Welcome from './pages/Welcome'

function RequireLearner({ children }: { children: ReactNode }) {
  const { userId } = useAppContext()
  return userId && Number.isInteger(userId) && userId > 0
    ? children
    : <Navigate to="/onboarding" replace />
}

function AppShell() {
  const location = useLocation()
  const shouldShowShell = !['/welcome', '/onboarding'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-[#FFF8E8] text-[#111111]">
      <Toaster position="top-right" closeButton richColors />
      {shouldShowShell ? <TopBar /> : null}

      <div className={shouldShowShell ? 'pb-24' : ''}>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/feed" element={<RequireLearner><Feed /></RequireLearner>} />
          <Route path="/activity/:id" element={<RequireLearner><Activity /></RequireLearner>} />
          <Route path="/activity" element={<Navigate to="/feed" replace />} />
          <Route path="/result" element={<RequireLearner><Result /></RequireLearner>} />
          <Route path="/progress" element={<RequireLearner><ProgressPage /></RequireLearner>} />
          <Route path="/skill/:id" element={<RequireLearner><SkillDetail /></RequireLearner>} />
          <Route path="/profile" element={<RequireLearner><Profile /></RequireLearner>} />
        </Routes>
      </div>

      {shouldShowShell ? <BottomNav /> : null}
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}

export default App
