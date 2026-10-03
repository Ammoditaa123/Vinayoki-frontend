import { motion } from 'framer-motion'
import {
  ArrowRight,
  BriefcaseBusiness,
  BookOpen,
  Code2,
  Hammer,
  MessageCircleQuestion,
  Route,
  Sparkles,
  Timer,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { createIdempotencyKey } from '../hooks/useInteraction'
import type { Activity } from '../types'
import ActivityBadge from './ActivityBadge'
import RecommendationReason from './RecommendationReason'

interface ActivityCardProps {
  activity: Activity
  onOpen: (activity: Activity) => void
  onSkip: (activity: Activity, idempotencyKey: string) => Promise<boolean>
}

export function ActivityCard({ activity, onOpen, onSkip }: ActivityCardProps) {
  const [isSkipping, setIsSkipping] = useState(false)
  const skipLock = useRef(false)
  const skipKey = useRef<string | null>(null)
  const options = Array.isArray(activity.options) ? activity.options : []
  const progressLabel = activity.type === 'build' || activity.type === 'micro_lesson'
    ? `+${activity.progress_value}`
    : '3–5'
  const activityVisuals = {
    micro_lesson: { label: 'Learn', icon: BookOpen, tone: 'bg-[#C0F7FE]' },
    quiz: { label: 'Quick question', icon: MessageCircleQuestion, tone: 'bg-[#FFD700]' },
    simulation: { label: 'Make a decision', icon: Route, tone: 'bg-[#00FF7F]' },
    coding: { label: 'Concept challenge', icon: Code2, tone: 'bg-[#FF6F61]' },
    build: { label: 'Create an artifact', icon: Hammer, tone: 'bg-[#FF4081] text-white' },
    career: { label: 'Career move', icon: BriefcaseBusiness, tone: 'bg-[#4B0082] text-white' },
  } as const
  const visual = activityVisuals[activity.type]
  const VisualIcon = visual.icon

  const handleSkip = async () => {
    if (skipLock.current) return

    skipLock.current = true
    setIsSkipping(true)
    skipKey.current ??= createIdempotencyKey('momentum', activity.id, 'skip')

    try {
      const saved = await onSkip(activity, skipKey.current)
      if (!saved) {
        skipLock.current = false
        setIsSkipping(false)
      } else {
        skipLock.current = false
        setIsSkipping(false)
        skipKey.current = null
      }
    } catch {
      skipLock.current = false
      setIsSkipping(false)
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-5 shadow-[6px_6px_0_#111] sm:p-6"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-5 rotate-12 text-[#FFD700] opacity-70">
        <Sparkles size={76} strokeWidth={1.5} />
      </div>

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border-[3px] border-black bg-[#C0F7FE] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">
            {activity.topic}
          </span>
          <ActivityBadge type={activity.type} />
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-black bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] sm:text-xs">
          <Timer size={14} aria-hidden="true" /> {activity.duration} min
        </span>
      </div>

      <div className="relative flex items-start gap-3">
        <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border-[3px] border-black shadow-[3px_3px_0_#111] ${visual.tone}`} aria-hidden="true">
          <VisualIcon size={20} strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#4B0082]">{visual.label}</p>
          <h2 className="mt-1 text-2xl font-black uppercase leading-[1.05] sm:text-[1.7rem]">{activity.title}</h2>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-[#333333]">{activity.description}</p>

      <div className="mt-5 rounded-[18px] border-[3px] border-black bg-[#C0F7FE] p-3 sm:p-4">
        <RecommendationReason reasons={activity.why_this ?? ['Action-based activity']} />
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-[15px] border-[3px] border-black bg-[#FFD700] px-3 py-2 text-sm font-black uppercase shadow-[3px_3px_0_#111]">
            <Sparkles size={15} aria-hidden="true" /> {progressLabel} progress
          </span>
          <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]">Difficulty {activity.difficulty}</span>
          {options.length > 0 ? <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]">{options.length} choices</span> : null}
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <button
            type="button"
            onClick={() => void handleSkip()}
            disabled={isSkipping}
            className="rounded-[14px] border-[3px] border-black bg-white px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            {isSkipping ? 'Saving...' : 'Skip'}
          </button>
          <button
            type="button"
            onClick={() => onOpen(activity)}
            disabled={isSkipping}
            className="inline-flex items-center gap-2 rounded-[16px] border-[3px] border-black bg-[#FF6F61] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] disabled:cursor-wait disabled:opacity-60"
          >
            Try challenge <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default ActivityCard
