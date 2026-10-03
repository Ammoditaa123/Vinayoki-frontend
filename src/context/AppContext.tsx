import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Activity,
  AppContextValue,
  OnboardingData,
  ProgressState,
  User,
} from '../types'

const STORAGE_KEY = 'vinayoki-user-id'
const USER_STORAGE_KEY = 'vinayoki-user-profile'
const ACTIVITY_STORAGE_KEY = 'vinayoki-current-activity'
const activityTypes = ['micro_lesson', 'quiz', 'simulation', 'coding', 'build', 'career']

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null

  try {
    const saved = window.localStorage.getItem(USER_STORAGE_KEY)
    if (!saved) return null

    const parsed: unknown = JSON.parse(saved)
    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'id' in parsed
      && typeof parsed.id === 'number'
      && Number.isInteger(parsed.id)
      && 'name' in parsed
      && typeof parsed.name === 'string'
      && 'goal' in parsed
      && typeof parsed.goal === 'string'
      && getStoredUserId() === parsed.id
    ) {
      return parsed as User
    }
  } catch {
    // Ignore invalid or unavailable local storage and continue without saved profile details.
  }

  return null
}

function getStoredUserId(): number | null {
  if (typeof window === 'undefined') return null

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return null

    const userId = Number(saved)
    return Number.isInteger(userId) && userId > 0 ? userId : null
  } catch {
    return null
  }
}

function getStoredActivity(): Activity | null {
  if (typeof window === 'undefined') return null

  try {
    const saved = window.sessionStorage.getItem(ACTIVITY_STORAGE_KEY)
    if (!saved) return null

    const parsed: unknown = JSON.parse(saved)
    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'id' in parsed
      && typeof parsed.id === 'number'
      && Number.isInteger(parsed.id)
      && parsed.id > 0
      && 'title' in parsed
      && typeof parsed.title === 'string'
      && 'topic' in parsed
      && typeof parsed.topic === 'string'
      && 'skill' in parsed
      && typeof parsed.skill === 'string'
      && 'type' in parsed
      && typeof parsed.type === 'string'
      && activityTypes.includes(parsed.type)
    ) {
      return parsed as Activity
    }
  } catch {
    // Ignore invalid or unavailable session storage and resolve the activity from the API.
    return null
  }

  return null
}

const defaultOnboarding: OnboardingData = {
  goal: 'Explore',
  skillLevel: 'Beginner',
  learningStyle: 'Solve',
}

const defaultProgress: ProgressState = {
  progress: 0,
  meaningfulActions: 0,
  activitiesCompleted: 0,
  skillsImproved: 0,
  artifacts: 0,
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [userId, setUserId] = useState<number | null>(getStoredUserId)
  const [onboarding, setOnboarding] = useState<OnboardingData>(defaultOnboarding)
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(getStoredActivity)
  const [progressState, setProgressState] = useState<ProgressState>(defaultProgress)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (userId !== null && Number.isInteger(userId) && userId > 0) {
        window.localStorage.setItem(STORAGE_KEY, String(userId))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Keep the in-memory learner session even if local storage is unavailable.
    }
  }, [userId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY)
      }
    } catch {
      // Keep profile details in memory if local storage is unavailable.
    }
  }, [user])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (currentActivity) {
        window.sessionStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(currentActivity))
      } else {
        window.sessionStorage.removeItem(ACTIVITY_STORAGE_KEY)
      }
    } catch {
      // Activity state remains available in memory when session storage is unavailable.
    }
  }, [currentActivity])

  const handleSetOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboarding((prev) => ({ ...prev, ...data }))
  }

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      userId,
      onboarding,
      currentActivity,
      progressState,
      setUser,
      setUserId,
      setOnboardingData: handleSetOnboardingData,
      setCurrentActivity,
      setProgressState,
    }),
    [user, userId, onboarding, currentActivity, progressState],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }

  return context
}
