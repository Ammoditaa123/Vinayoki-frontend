import { ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ActivityCard from '../components/ActivityCard'
import InterventionCard from '../components/InterventionCard'
import LoadingState from '../components/LoadingState'
import { useAppContext } from '../context/AppContext'
import { useFeed } from '../hooks/useFeed'
import { getEngagement } from '../services/interactionApi'
import { getLearningFeed } from '../services/cardService'
import type { EngagementState, NormalizedLearningCard } from '../types'

const getDismissedSessionUser = (userId: number | null) => {
  if (!userId || typeof window === 'undefined') return null

  try {
    return window.sessionStorage.getItem(`momentum-engagement-dismissed-${userId}`) === 'true'
      ? userId
      : null
  } catch {
    return null
  }
}

interface EngagementSnapshot {
  userId: number
  request: number
  data?: EngagementState
  error?: string
}

const activityPriority: Record<string, number> = {
  coding: 0,
  simulation: 1,
  build: 2,
  quiz: 3,
  career: 4,
  micro_lesson: 5,
}

interface FeedNavigationState {
  adaptiveRefresh?: boolean
  refreshedFeed?: NormalizedLearningCard[]
}

export default function Feed() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId, setCurrentCard, setUser, setUserId } = useAppContext()
  const navigationState = location.state as FeedNavigationState | null
  const { cards: activities, loading, error, replaceFeed } = useFeed(userId, navigationState?.refreshedFeed)
  
  const [engagementRequest, setEngagementRequest] = useState(0)
  const [engagementSnapshot, setEngagementSnapshot] = useState<EngagementSnapshot | null>(null)
  const [dismissedUserId, setDismissedUserId] = useState<number | null>(() => getDismissedSessionUser(userId))
  const [adaptiveRefresh, setAdaptiveRefresh] = useState(Boolean(navigationState?.adaptiveRefresh))
  const [feedRefreshError, setFeedRefreshError] = useState<string | null>(null)
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false)

  const dismissedIntervention = dismissedUserId === userId
  const engagementLoading = Boolean(
    userId && (engagementSnapshot?.userId !== userId || engagementSnapshot.request !== engagementRequest),
  )
  const engagementError = engagementSnapshot?.userId === userId
    && engagementSnapshot.request === engagementRequest
    ? engagementSnapshot.error
    : undefined
  const engagement = engagementSnapshot?.userId === userId
    && engagementSnapshot.request === engagementRequest
    ? engagementSnapshot.data
    : undefined
  const interventionActive = engagement?.intervention === true && !dismissedIntervention
  const interventionActivity = useMemo(() => {
    const preferred = activities.filter((activity) => (
      activity.stepTypes?.some(type => ['build', 'solve'].includes(type))
    ))
    const candidates = preferred.length > 0 ? preferred : activities

    return [...candidates].sort((a, b) => (
      a.estimatedTime - b.estimatedTime
    ))[0] ?? null
  }, [activities])

  useEffect(() => {
    if (!userId) {
      navigate('/onboarding')
      return
    }

    let cancelled = false

    getEngagement(userId)
      .then((data) => {
        if (!cancelled) {
          setEngagementSnapshot({ userId, request: engagementRequest, data })
        }
      })
      .catch((engagementError: unknown) => {
        if (!cancelled) {
          setEngagementSnapshot({
            userId,
            request: engagementRequest,
            error: engagementError instanceof Error ? engagementError.message : 'Unable to check engagement.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [engagementRequest, navigate, userId])

  useEffect(() => {
    if (!error?.toLowerCase().includes('user not found')) return

    setUser(null)
    setUserId(null)
    navigate('/onboarding', { replace: true })
  }, [error, navigate, setUser, setUserId])

  const handleOpenActivity = (card: NormalizedLearningCard) => {
    setCurrentCard(card)
    navigate(`/activity/${card.id}`)
  }

  const handleKeepExploring = () => {
    if (userId) {
      try {
        window.sessionStorage.setItem(`momentum-engagement-dismissed-${userId}`, 'true')
      } catch {
        // The override still applies for this mounted feed if session storage is unavailable.
      }
      setDismissedUserId(userId)
    }
  }

  const handleRetryFeed = async () => {
    if (!userId || isRefreshingFeed) return

    setIsRefreshingFeed(true)
    setFeedRefreshError(null)
    try {
      const refreshedFeed = await getLearningFeed(userId)
      replaceFeed(refreshedFeed, userId)
      setEngagementRequest((request) => request + 1)
    } catch (refreshError) {
      setFeedRefreshError(refreshError instanceof Error ? refreshError.message : 'Could not load recommendations.')
    } finally {
      setIsRefreshingFeed(false)
    }
  }

  if (!userId) {
    return null
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="relative mb-6 overflow-hidden rounded-[28px] border-[3px] border-black bg-[#FFD700] p-5 shadow-[6px_6px_0_#111] sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-3 -top-5 rotate-12 text-[#FF6F61] opacity-80">
          <Sparkles size={96} strokeWidth={1.5} />
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4B0082]">
              <Sparkles size={13} aria-hidden="true" /> Your next move
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">Your feed<span className="text-[#FF6F61]">.</span></h1>
            <p className="mt-2 max-w-lg text-sm font-semibold text-[#222222] sm:text-base">Quick ideas. Real action. Progress you can take with you.</p>
          </div>
          <Link
            to="/progress"
            className="inline-flex items-center gap-2 rounded-[16px] border-[3px] border-black bg-[#00FF7F] px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            Progress <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {adaptiveRefresh ? (
        <section className="mb-6 rounded-[24px] border-[3px] border-black bg-[#00FF7F] p-5 shadow-[5px_5px_0_#111]" aria-labelledby="fresh-feed-title">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#4B0082]">
             <Sparkles size={13} aria-hidden="true" /> The system learns from you
          </p>
          <h2 id="fresh-feed-title" className="mt-2 text-xl font-black uppercase">Fresh recommendations, just loaded</h2>
          <p className="mt-2 text-sm font-semibold text-[#111111]">
            These activities came from the learning engine after your saved interaction.
          </p>
        </section>
      ) : null}

      {feedRefreshError ? (
        <p role="alert" className="mb-5 rounded-[18px] border-[3px] border-black bg-[#FFE1DC] p-4 text-sm font-bold">
          {feedRefreshError}
        </p>
      ) : null}

      {loading || engagementLoading ? (
        <LoadingState label="Checking your momentum..." />
      ) : null}

      {error ? (
        <div className="rounded-[28px] border-[3px] border-black bg-[#FF6F61] p-6 shadow-[6px_6px_0_#111]">
          <p className="text-lg font-black uppercase">Momentum is offline</p>
          <p className="mt-2 text-sm font-semibold">We could not reach the learning engine.</p>
          <button
            type="button"
            onClick={() => void handleRetryFeed()}
            disabled={isRefreshingFeed}
            className="mt-4 inline-flex items-center gap-2 rounded-[16px] border-[3px] border-black bg-[#FFD700] px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0_#111]"
          >
            {isRefreshingFeed ? 'Loading...' : 'Try again'} <ArrowRight size={16} />
          </button>
        </div>
      ) : null}

      {engagementError ? (
        <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border-[3px] border-black bg-[#FFF8E8] p-4 text-sm font-semibold shadow-[4px_4px_0_#111]">
          <p>We couldn’t check your engagement state. Your recommendations are still available.</p>
          <button
            type="button"
            onClick={() => setEngagementRequest((request) => request + 1)}
            className="rounded-[14px] border-[3px] border-black bg-[#FFD700] px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            Retry check
          </button>
        </div>
      ) : null}

      {interventionActive && engagement && !loading ? (
        <InterventionCard
          engagement={engagement}
          activity={interventionActivity as any}
          onTryChallenge={(act) => handleOpenActivity(act as NormalizedLearningCard)}
          onKeepExploring={handleKeepExploring}
          onRetryFeed={() => void handleRetryFeed()}
        />
      ) : null}

      {!engagementLoading && !interventionActive && !loading && !error && activities.length === 0 ? (
        <div className="rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-6 shadow-[6px_6px_0_#111]">
          <p className="text-xl font-black uppercase">Nothing here yet.</p>
          <p className="mt-2 text-sm font-semibold text-[#333333]">We are looking for your next challenge.</p>
          <button
            type="button"
            onClick={() => void handleRetryFeed()}
            disabled={isRefreshingFeed}
            className="mt-4 rounded-[14px] border-[3px] border-black bg-[#FFD700] px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0_#111] disabled:opacity-60"
          >
            {isRefreshingFeed ? 'Loading...' : 'Retry recommendations'}
          </button>
        </div>
      ) : null}

      {!engagementLoading && !interventionActive && !loading && !error && activities.length > 0 ? (
        <div className="space-y-6">
          {activities.map((card, index) => (
            <ActivityCard
              key={card.id}
              card={card}
              index={index}
              onOpen={handleOpenActivity}
            />
          ))}
        </div>
      ) : null}
    </main>
  )
}
