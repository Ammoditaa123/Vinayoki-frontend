import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppContextValue,
  BackendMode,
  LegacyActivity,
  NormalizedLearningCard,
  OnboardingData,
  User,
} from '../types'

const STORAGE_KEY = 'vinayoki-user-id'
const USER_STORAGE_KEY = 'vinayoki-user-profile'
const CARD_STORAGE_KEY = 'vinayoki-current-card'

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

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

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = window.localStorage.getItem(USER_STORAGE_KEY)
    if (!saved) return null
    const parsed: unknown = JSON.parse(saved)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      typeof (parsed as { id: unknown }).id === 'number' &&
      'name' in parsed &&
      typeof (parsed as { name: unknown }).name === 'string' &&
      getStoredUserId() === (parsed as { id: number }).id
    ) {
      return parsed as User
    }
  } catch {
    // Ignore corrupt storage
  }
  return null
}

function getStoredCard(): NormalizedLearningCard | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = window.sessionStorage.getItem(CARD_STORAGE_KEY)
    if (!saved) return null
    const parsed: unknown = JSON.parse(saved)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      typeof (parsed as { id: unknown }).id === 'number' &&
      'title' in parsed
    ) {
      return parsed as NormalizedLearningCard
    }
  } catch {
    return null
  }
  return null
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultOnboarding: OnboardingData = {
  name: '',
  goal: 'Explore tech careers',
  skillLevel: 'Beginner',
  learningStyle: 'Explore',
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [userId, setUserId] = useState<number | null>(getStoredUserId)
  const [onboarding, setOnboarding] = useState<OnboardingData>(defaultOnboarding)
  const [currentCard, setCurrentCard] = useState<NormalizedLearningCard | null>(getStoredCard)
  const [currentActivity, setCurrentActivity] = useState<LegacyActivity | null>(null)
  const [backendMode, setBackendMode] = useState<BackendMode | null>(null)

  // Persist userId
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (userId !== null && Number.isInteger(userId) && userId > 0) {
        window.localStorage.setItem(STORAGE_KEY, String(userId))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Memory fallback
    }
  }, [userId])

  // Persist user profile
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY)
      }
    } catch {
      // Memory fallback
    }
  }, [user])

  // Persist current card to session storage (clears on tab close)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (currentCard) {
        window.sessionStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(currentCard))
      } else {
        window.sessionStorage.removeItem(CARD_STORAGE_KEY)
      }
    } catch {
      // Memory fallback
    }
  }, [currentCard])

  const handleSetOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboarding((prev) => ({ ...prev, ...data }))
  }

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      userId,
      onboarding,
      currentCard,
      currentActivity,
      backendMode,
      setUser,
      setUserId,
      setOnboardingData: handleSetOnboardingData,
      setCurrentCard,
      setCurrentActivity,
      setBackendMode,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, userId, onboarding, currentCard, currentActivity, backendMode],
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
