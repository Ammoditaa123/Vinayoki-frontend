import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Timer,
  Star,
  Eye,
  TestTube2,
  Hammer
} from 'lucide-react'
import type { NormalizedLearningCard } from '../types'
import RecommendationReason from './RecommendationReason'

interface ActivityCardProps {
  card: NormalizedLearningCard
  index: number
  onOpen: (card: NormalizedLearningCard) => void
}

export function ActivityCard({ card, index, onOpen }: ActivityCardProps) {
  const progressLabel = card.stepTypes?.includes('build') || card.stepTypes?.includes('watch') 
    ? `+${card.progressValue}`
    : '3–5'

  const difficultyStars = Array.from({ length: 3 }).map((_, i) => (
    <Star 
      key={i} 
      size={12} 
      className={i < card.difficulty ? "fill-black text-black" : "text-gray-300"} 
    />
  ))

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-5 shadow-[6px_6px_0_#111] sm:p-6"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-5 rotate-12 text-[#FFD700] opacity-70">
        <Sparkles size={76} strokeWidth={1.5} />
      </div>

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border-[3px] border-black bg-[#C0F7FE] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">
            {card.topic.replace(/_/g, ' ')}
          </span>
          {card.stepTypes && (
            <div className="flex items-center gap-1 rounded-full border-2 border-black bg-white px-2 py-1 text-[10px] shadow-[2px_2px_0_#111]">
              {card.stepTypes.map((type, i) => (
                <span key={i} title={type}>
                  {type === 'watch' ? <Eye size={12} /> : 
                   type === 'solve' ? <TestTube2 size={12} /> : 
                   <Hammer size={12} />}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-black bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] sm:text-xs">
          <Timer size={14} aria-hidden="true" /> {Math.ceil(card.estimatedTime / 60)} min
        </span>
      </div>

      <div className="relative">
        <h2 className="text-2xl font-black uppercase leading-[1.05] sm:text-[1.7rem]">{card.title}</h2>
      </div>
      <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-[#333333]">{card.description}</p>

      <div className="mt-5 rounded-[18px] border-[3px] border-black bg-[#C0F7FE] p-3 sm:p-4">
        <RecommendationReason card={card} />
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-[15px] border-[3px] border-black bg-[#FFD700] px-3 py-2 text-sm font-black uppercase shadow-[3px_3px_0_#111]">
            <Sparkles size={15} aria-hidden="true" /> {progressLabel} progress
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]">
            {difficultyStars}
          </span>
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <button
            type="button"
            onClick={() => onOpen(card)}
            className="inline-flex items-center gap-2 rounded-[16px] border-[3px] border-black bg-[#FF6F61] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            Try challenge <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default ActivityCard
