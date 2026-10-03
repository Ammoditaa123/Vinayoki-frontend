import { motion } from 'framer-motion'
import { ArrowRight, Check, CircleHelp, Sparkles, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ActivityBadge from '../components/ActivityBadge'
import { useAppContext } from '../context/AppContext'
import { getFeed } from '../services/feedApi'
import ActivityCardBadge from '../components/ActivityBadge'
import type { ActivityType, FeedResponse, InteractionResult } from '../types'

interface ResultNavigationState {
  selected?: string | null
  answer?: string
  topic?: string
  activityTitle?: string
  activityType?: ActivityType
  interaction?: InteractionResult
}

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const { userId, setUser, setUserId } = useAppContext()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [refreshedFeed, setRefreshedFeed] = useState<FeedResponse | null>(null)
  const refreshLock = useRef(false)
  const state = location.state as ResultNavigationState | null
  const interaction = state?.interaction

  const handleKeepGoing = async () => {
    if (refreshLock.current || !userId) {
      if (!userId) setFeedError('Your learner session is unavailable. Return to onboarding to continue.')
      return
    }

    refreshLock.current = true
    if (refreshedFeed) {
      navigate('/feed', {
        state: { adaptiveRefresh: true, refreshedFeed },
      })
      refreshLock.current = false
      return
    }

    setIsRefreshing(true)
    setFeedError(null)

    try {
      const nextFeed: FeedResponse = await getFeed(userId)
      if (!Array.isArray(nextFeed.activities)) {
        throw new Error('The learning engine returned an invalid feed.')
      }

      setRefreshedFeed(nextFeed)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load your next recommendations.'
      if (message.toLowerCase().includes('user not found')) {
        setUser(null)
        setUserId(null)
        navigate('/onboarding', { replace: true })
      } else {
        setFeedError(message)
      }
    } finally {
      refreshLock.current = false
      setIsRefreshing(false)
    }
  }

  if (!interaction) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <section className="rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-6 shadow-[8px_8px_0_#111]" aria-labelledby="missing-result-title">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#4B0082]">No saved result</p>
          <h1 id="missing-result-title" className="mt-2 text-2xl font-black uppercase">We couldn’t find an interaction result.</h1>
          <p className="mt-3 font-semibold text-[#333333]">Try a challenge from your feed to record an interaction.</p>
          <Link
            to="/feed"
            className="mt-6 inline-flex items-center gap-2 rounded-[18px] border-[3px] border-black bg-[#FFD700] px-5 py-3 text-sm font-black uppercase shadow-[5px_5px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            Back to feed <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    )
  }

  const { action, correct, completed, progress_earned: progressEarned, timestamp } = interaction
  const topic = state.topic ?? 'Your activity'
  const activityTitle = state.activityTitle ?? topic
  const selected = state.selected
  const isAnswerAction = action === 'answer'
  const isSkip = action === 'skip'
  const hasRecommendationSignal = action === 'answer' || action === 'complete' || action === 'skip'
  const headline = isSkip
    ? 'Skipped for now'
    : correct === true
      ? 'Nice work. ✓'
      : correct === false
        ? 'Not quite.'
        : completed
          ? 'Action recorded. ✓'
          : 'Interaction recorded.'
  const headlineTone = isSkip ? 'bg-[#FFD700]' : correct === false ? 'bg-[#FFE1DC]' : 'bg-[#00FF7F]'
  const savedAt = Number.isNaN(Date.parse(timestamp))
    ? null
    : new Date(timestamp).toLocaleString()
  const nextActivity = refreshedFeed?.activities[0] ?? null

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <motion.section
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-5 shadow-[8px_8px_0_#111] sm:p-7"
        aria-labelledby="result-title"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-4 top-20 rotate-12 text-[#FFD700] opacity-60">
          <Sparkles size={92} strokeWidth={1.5} />
        </div>
        <div className="relative">
          <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#4B0082]">
            {isSkip
              ? 'Choice recorded'
              : action === 'answer'
                ? 'Answer checked'
                : action === 'build'
                  ? 'Build recorded'
                  : action === 'complete'
                    ? 'Lesson complete'
                    : 'Activity complete'}
          </p>
          <div className={`rounded-[22px] border-[3px] border-black p-5 text-center shadow-[4px_4px_0_#111] ${headlineTone}`}>
            <h1 id="result-title" className="text-3xl font-black uppercase sm:text-4xl">{headline}</h1>
            {correct === false ? <p className="mt-2 font-bold">That’s useful signal.</p> : null}
            {isSkip ? <p className="mt-2 font-bold">Skipping is a preference signal, too.</p> : null}
          </div>
        </div>

        <div className="relative my-6 text-center">
          <motion.p
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18, delay: 0.08 }}
            className="text-7xl font-black tabular-nums tracking-[-0.08em] sm:text-8xl"
            aria-label={`${progressEarned} progress earned`}
          >
            {progressEarned > 0 ? '+' : ''}{progressEarned}
          </motion.p>
          <p className="mt-1 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#FFD700] px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_#111]">
            <Sparkles size={14} aria-hidden="true" /> Progress earned
          </p>
        </div>

        <div className="relative rounded-[20px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#111]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#4B0082]">{topic}</p>
            {correct === true ? <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#00FF7F] px-2.5 py-1 text-[10px] font-black uppercase"><Check size={13} /> Correct</span> : null}
            {correct === false ? <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#FFE1DC] px-2.5 py-1 text-[10px] font-black uppercase"><X size={13} /> Not quite</span> : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="min-w-0 flex-1 text-xl font-black uppercase leading-tight">{activityTitle}</h2>
            {state.activityType ? <ActivityBadge type={state.activityType} /> : null}
          </div>
          {selected ? <p className="mt-2 font-bold">Your response: <span className="font-black">{selected}</span></p> : null}
          {isAnswerAction && correct === false && state.answer ? (
            <p className="mt-2 font-semibold text-[#333333]">
              Correct answer: <span className="font-black">{state.answer}</span>
            </p>
          ) : null}
          {savedAt ? <p className="mt-3 text-xs font-semibold text-[#333333]">Saved {savedAt}</p> : null}
        </div>

        <ol className="relative mt-6 grid gap-3 sm:grid-cols-3" aria-label="What happens next">
          <li className="rounded-[18px] border-[3px] border-black bg-[#C0F7FE] p-3 text-center shadow-[3px_3px_0_#111]">
            <Check className="mx-auto" aria-hidden="true" />
            <p className="mt-2 text-xs font-black uppercase">You took action</p>
          </li>
          <li className="rounded-[18px] border-[3px] border-black bg-[#FFD700] p-3 text-center shadow-[3px_3px_0_#111]">
            <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 border-black text-xs font-black" aria-hidden="true">{interaction.id}</span>
            <p className="mt-2 text-xs font-black uppercase">Interaction saved</p>
          </li>
          <li className="rounded-[18px] border-[3px] border-black bg-white p-3 text-center shadow-[3px_3px_0_#111]">
            <CircleHelp className="mx-auto" aria-hidden="true" />
            <p className="mt-2 text-xs font-black uppercase">Fresh feed next</p>
          </li>
        </ol>

        <div className="relative mt-6 rounded-[22px] border-[3px] border-black bg-[#C0F7FE] p-5 shadow-[5px_5px_0_#111]">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#4B0082]">
            <ArrowRight size={13} aria-hidden="true" /> Your next move
          </p>
          <h2 className="mt-3 text-xl font-black uppercase">The next few minutes are yours.</h2>
          {correct === false ? (
            <p className="mt-2 text-base font-bold">Your next recommendation can adapt from this interaction.</p>
          ) : hasRecommendationSignal ? (
            <p className="mt-2 text-base font-bold">Your recent interaction is now part of the recommendation signal.</p>
          ) : (
            <p className="mt-2 text-base font-bold">Your completed build was saved and added to the signals used for future recommendations.</p>
          )}
          <p className="mt-2 text-sm text-[#333333]">{correct === false ? 'That’s useful signal. See what the learning engine suggests next.' : 'See what the learning engine suggests next.'}</p>
        </div>

        {nextActivity ? (
          <section className="relative mt-6 rounded-[22px] border-[3px] border-black bg-white p-4 shadow-[5px_5px_0_#111] sm:p-5" aria-labelledby="next-activity-title">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFD700] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">
                <ArrowRight size={13} aria-hidden="true" /> Next up · from your fresh feed
              </p>
              <ActivityCardBadge type={nextActivity.type} />
            </div>
            <h2 id="next-activity-title" className="mt-3 text-xl font-black uppercase leading-tight">{nextActivity.title}</h2>
            <p className="mt-2 text-sm font-semibold text-[#333333]">{nextActivity.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase">
              <span className="rounded-full border-2 border-black bg-[#C0F7FE] px-3 py-1">{nextActivity.duration} min</span>
              <span className="rounded-full border-2 border-black bg-[#FFF8E8] px-3 py-1">Difficulty {nextActivity.difficulty}</span>
              <span className="rounded-full border-2 border-black bg-[#00FF7F] px-3 py-1">
                {['build', 'micro_lesson'].includes(nextActivity.type) ? `+${nextActivity.progress_value}` : '3–5'} progress
              </span>
            </div>
            {nextActivity.why_this?.length ? (
              <div className="mt-4 rounded-[16px] border-2 border-black bg-[#C0F7FE] p-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em]">Why this?</p>
                <ul className="flex flex-wrap gap-2 text-xs font-bold">
                  {nextActivity.why_this.map((reason) => <li key={reason} className="rounded-full border-2 border-black bg-white px-3 py-1">{reason}</li>)}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="relative mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => void handleKeepGoing()}
            disabled={isRefreshing}
            aria-live="polite"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border-[3px] border-black bg-[#FF6F61] px-6 py-3 text-sm font-black uppercase shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1 disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] sm:w-auto"
          >
            {isRefreshing ? 'Finding your next move...' : feedError ? 'Try again' : nextActivity ? 'Open my fresh feed' : 'Find my next move'}
            <ArrowRight size={18} />
          </button>
        </div>
        {feedError ? (
          <p role="alert" className="mt-4 rounded-[16px] border-[3px] border-black bg-[#FFE1DC] p-3 text-sm font-bold">
            We saved your interaction, but couldn’t load the next feed. {feedError}
          </p>
        ) : null}
      </motion.section>
    </main>
  )
}