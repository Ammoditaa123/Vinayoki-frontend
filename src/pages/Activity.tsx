import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, BriefcaseBusiness, Check, Clock3, Code2, Hammer, MessageCircleQuestion, Route, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ActivityBadge from '../components/ActivityBadge'
import LoadingState from '../components/LoadingState'
import { useAppContext } from '../context/AppContext'
import { createIdempotencyKey, useInteraction } from '../hooks/useInteraction'
import { getActivityCatalog, getFeed } from '../services/feedApi'
import type { Activity, ActivityType, InteractionAction } from '../types'

const parseOptions = (value: string[] | string | undefined): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value

  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) && parsed.every((option) => typeof option === 'string')
      ? parsed
      : []
  } catch {
    return []
  }
}

const getSubmitAction = (type: ActivityType): InteractionAction => {
  if (type === 'micro_lesson') return 'complete'
  if (type === 'build') return 'build'
  return 'answer'
}

const activityTreatment: Record<ActivityType, { label: string; icon: typeof BookOpen }> = {
  micro_lesson: { label: 'Learn', icon: BookOpen },
  quiz: { label: 'Quick question', icon: MessageCircleQuestion },
  simulation: { label: 'Decision scenario', icon: Route },
  coding: { label: 'Concept challenge', icon: Code2 },
  build: { label: 'Build challenge', icon: Hammer },
  career: { label: 'Career move', icon: BriefcaseBusiness },
}

interface ActivityResolution {
  activityId: number
  retry: number
  activity: Activity | null
  error: string | null
}

export default function Activity() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentActivity: selectedActivity, userId, setUser, setUserId } = useAppContext()
  const requestedActivityId = Number(id)
  const validActivityId = Number.isInteger(requestedActivityId) && requestedActivityId > 0
  const selectedForRoute = selectedActivity?.id === requestedActivityId ? selectedActivity : null
  const [activityResolution, setActivityResolution] = useState<ActivityResolution | null>(null)
  const [resolutionRetry, setResolutionRetry] = useState(0)
  const resolutionMatchesRoute = activityResolution?.activityId === requestedActivityId
    && activityResolution.retry === resolutionRetry
  const currentActivity = selectedForRoute
    ?? (resolutionMatchesRoute ? activityResolution.activity : null)
  const isResolvingActivity = Boolean(userId && validActivityId && !selectedForRoute && !resolutionMatchesRoute)
  const activityLoadError = resolutionMatchesRoute ? activityResolution.error : null
  const { logInteraction } = useInteraction()
  const [selected, setSelected] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)
  const attemptKey = useRef<{ fingerprint: string; key: string } | null>(null)
  const viewedActivityId = useRef<number | null>(null)
  const activityStartedAt = useRef<number | null>(null)

  useEffect(() => {
    if (!userId || !validActivityId || selectedForRoute) return

    let cancelled = false

    getFeed(userId)
      .then((feed) => {
        const recommendedActivity = feed.activities.find((item) => item.id === requestedActivityId)
        return recommendedActivity
          ? recommendedActivity
          : getActivityCatalog().then((activities) => activities.find((item) => item.id === requestedActivityId) ?? null)
      })
      .then((activity) => {
        if (!cancelled) setActivityResolution({ activityId: requestedActivityId, retry: resolutionRetry, activity, error: null })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          if (error instanceof Error && error.message.toLowerCase().includes('user not found')) {
            setUser(null)
            setUserId(null)
            navigate('/onboarding', { replace: true })
            return
          }

          setActivityResolution({
            activityId: requestedActivityId,
            retry: resolutionRetry,
            activity: null,
            error: error instanceof Error ? error.message : 'Could not load this challenge.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [navigate, requestedActivityId, resolutionRetry, selectedForRoute, setUser, setUserId, userId, validActivityId])

  useEffect(() => {
    if (!currentActivity) {
      activityStartedAt.current = null
      return
    }

    activityStartedAt.current = Date.now()
  }, [currentActivity])

  useEffect(() => {
    if (!currentActivity || !userId || viewedActivityId.current === currentActivity.id) {
      return
    }

    const idempotencyKey = createIdempotencyKey('momentum', currentActivity.id, 'view')
    viewedActivityId.current = currentActivity.id
    void logInteraction(
      userId,
      currentActivity,
      'view',
      { completed: false, time_spent: 0 },
      idempotencyKey,
    )
  }, [currentActivity, logInteraction, userId])

  const options = parseOptions(currentActivity?.options)

  if (!userId) {
    return null
  }

  if (isResolvingActivity) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <LoadingState label="Loading your challenge..." />
      </main>
    )
  }

  if (!currentActivity) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div role="alert" className="rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-6 shadow-[8px_8px_0_#111]">
          {activityLoadError ? (
            <>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#4B0082]">Challenge unavailable</p>
              <h1 className="mt-2 text-2xl font-black uppercase">We couldn’t load this challenge.</h1>
              <p className="mt-2 text-sm font-semibold">{activityLoadError}</p>
              <button
                type="button"
                onClick={() => setResolutionRetry((retry) => retry + 1)}
                className="mt-4 rounded-[16px] border-[3px] border-black bg-[#FFD700] px-4 py-2 font-black uppercase shadow-[4px_4px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
              >
                Try again
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#4B0082]">Activity not found</p>
              <h1 className="mt-2 text-2xl font-black uppercase">This challenge is no longer available.</h1>
            </>
          )}
          <Link to="/feed" className="mt-4 inline-block rounded-[16px] border-[3px] border-black bg-white px-4 py-2 font-black uppercase shadow-[4px_4px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]">
            Back to feed
          </Link>
        </div>
      </main>
    )
  }

  const submitAction = getSubmitAction(currentActivity.type)
  const treatment = activityTreatment[currentActivity.type]
  const TreatmentIcon = treatment.icon
  const requiresChoice = ['quiz', 'simulation', 'coding', 'career'].includes(currentActivity.type)
  const earnedProgressLabel = submitAction === 'answer'
    ? '3–5'
    : `+${currentActivity.progress_value}`
  const getTimeSpent = () => {
    const startedAt = activityStartedAt.current
    if (startedAt === null) return 0

    return Math.min(3600, Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
  }

  const handleSubmit = async () => {
    if ((requiresChoice && !selected) || !currentActivity || submitLock.current) {
      return
    }

    const fingerprint = `${currentActivity.id}:${submitAction}:${selected ?? ''}`
    if (attemptKey.current?.fingerprint !== fingerprint) {
      attemptKey.current = {
        fingerprint,
        key: createIdempotencyKey('momentum', currentActivity.id, submitAction),
      }
    }

    const correct = submitAction === 'answer' && currentActivity.answer !== undefined
      ? selected === currentActivity.answer
      : undefined

    submitLock.current = true
    setIsSubmitting(true)
    try {
      const interaction = await logInteraction(
        userId,
        currentActivity,
        submitAction,
        {
          ...(correct === undefined ? {} : { correct }),
          completed: true,
          time_spent: getTimeSpent(),
        },
        attemptKey.current.key,
      )

      if (!interaction) return

      navigate('/result', {
        state: {
          correct,
          selected,
          answer: currentActivity.answer,
          topic: currentActivity.topic,
          activityTitle: currentActivity.title,
          activityType: currentActivity.type,
          action: submitAction,
          interaction,
        },
      })
    } finally {
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-5 shadow-[8px_8px_0_#111] sm:p-7"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-3 top-14 rotate-12 text-[#FFD700] opacity-60">
          <Sparkles size={72} strokeWidth={1.5} />
        </div>
        <div className="relative mb-5 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border-[3px] border-black bg-[#C0F7FE] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">
            {currentActivity.topic}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-2.5 py-1 text-[10px] font-black uppercase"><Clock3 size={13} /> {currentActivity.duration} min</span>
            <ActivityBadge type={currentActivity.type} />
          </div>
        </div>

        <p className="relative mb-2 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] shadow-[2px_2px_0_#111]">
          <TreatmentIcon size={14} aria-hidden="true" /> {treatment.label}
        </p>
        <h1 className="relative text-3xl font-black uppercase leading-[1.05] sm:text-4xl">{currentActivity.title}</h1>
        {!['micro_lesson', 'simulation', 'build'].includes(currentActivity.type) ? (
          <p className="mt-3 text-base font-semibold text-[#333333]">{currentActivity.description}</p>
        ) : null}

        {currentActivity.type === 'micro_lesson' ? (
          <section className="mt-6 rounded-[22px] border-[3px] border-black bg-[#C0F7FE] p-5 shadow-[4px_4px_0_#111]" aria-labelledby="lesson-takeaway">
            <p id="lesson-takeaway" className="text-xs font-black uppercase tracking-[0.16em] text-[#4B0082]">Key takeaway</p>
            <p className="mt-3 text-lg font-bold">{currentActivity.description}</p>
          </section>
        ) : null}

        {currentActivity.type === 'build' ? (
          <section className="mt-6 space-y-4" aria-labelledby="build-objective">
            <div className="rounded-[22px] border-[3px] border-black bg-white p-5 shadow-[4px_4px_0_#111]">
              <p id="build-objective" className="text-xs font-black uppercase tracking-[0.16em] text-[#4B0082]">Objective</p>
              <p className="mt-3 text-lg font-black">{currentActivity.description}</p>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#4B0082]">Expected artifact</p>
              <p className="mt-3 text-sm font-semibold text-[#333333]">
                Create a small artifact related to this objective, such as a code sample, diagram, or project note. This is a self-reported completion; nothing is executed or uploaded here.
              </p>
            </div>
          </section>
        ) : null}

        {requiresChoice ? (
          <section className="mt-6" aria-labelledby="activity-question">
            {currentActivity.type === 'coding' ? (
              <p className="mb-4 rounded-[16px] border-[3px] border-black bg-[#FFE1DC] p-3 text-sm font-bold">
                Concept challenge — this screen does not execute code.
              </p>
            ) : null}
            {currentActivity.type === 'simulation' ? (
              <p className="mb-4 rounded-[18px] border-[3px] border-black bg-[#C0F7FE] p-4 font-semibold">
                Scenario: {currentActivity.description}
              </p>
            ) : null}
            <h2 id="activity-question" className="text-2xl font-black uppercase">
              {currentActivity.question ?? 'Choose the best response'}
            </h2>
            <div role="group" aria-labelledby="activity-question" className="mt-5 space-y-3">
              {options.map((option) => {
                const active = selected === option

                return (
                  <motion.button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    disabled={isSubmitting}
                    onClick={() => setSelected(option)}
                    whileTap={{ scale: 0.98, y: 2 }}
                    className={`flex w-full items-center justify-between rounded-[20px] border-[3px] border-black px-4 py-4 text-left text-base font-bold shadow-[4px_4px_0_#111] transition-colors hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] ${
                      active ? 'bg-[#00FF7F]' : 'bg-white'
                    }`}
                  >
                    <span>{option}</span>
                    <span className="inline-flex items-center gap-2 text-sm font-black" aria-hidden="true">
                      {active ? <><Check size={18} /> Selected</> : '○'}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </section>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3 rounded-[18px] border-[3px] border-black bg-[#FFD700] px-4 py-3 shadow-[4px_4px_0_#111]">
          <span className="text-xs font-black uppercase tracking-[0.14em]">Worth</span>
          <span className="inline-flex items-center gap-1.5 text-lg font-black uppercase"><Sparkles size={18} /> {earnedProgressLabel} progress</span>
        </div>

        <div className="mt-8 flex justify-end">
          <motion.button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || (requiresChoice && !selected)}
            whileTap={{ scale: 0.97, y: 2 }}
            className="inline-flex items-center gap-2 rounded-[18px] border-[3px] border-black bg-[#FFD700] px-5 py-3 text-sm font-black uppercase shadow-[5px_5px_0_#111] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            {isSubmitting
              ? 'Saving...'
              : currentActivity.type === 'micro_lesson'
                ? 'Got it'
                : currentActivity.type === 'build'
                  ? 'Mark as built'
                  : currentActivity.type === 'simulation'
                    ? 'Check decision'
                    : 'Check answer'}
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </main>
  )
}
