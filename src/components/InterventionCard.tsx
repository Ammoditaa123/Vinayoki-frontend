import { motion } from 'framer-motion'
import { ArrowRight, Bolt, Pause, Clock } from 'lucide-react'
import type { EngagementState, NormalizedLearningCard } from '../types'

interface InterventionCardProps {
  engagement: EngagementState
  activity: NormalizedLearningCard | null
  onTryChallenge: (card: NormalizedLearningCard) => void
  onKeepExploring: () => void
  onRetryFeed: () => void
}

const metricVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export function InterventionCard({
  engagement,
  activity,
  onTryChallenge,
  onKeepExploring,
  onRetryFeed,
}: InterventionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.1 }}
      aria-labelledby="intervention-title"
      aria-describedby="intervention-description"
      className="mx-auto w-full max-w-2xl rounded-[30px] border-[3px] border-black bg-[#C0F7FE] p-5 shadow-[8px_8px_0_#111] sm:p-8"
    >
      <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#4B0082]">
        <Pause size={16} aria-hidden="true" /> Feed paused
      </div>

      <h2 id="intervention-title" className="mt-3 text-center text-3xl font-black uppercase sm:text-4xl">
        Attention is only the beginning.
      </h2>
      <p id="intervention-description" className="mx-auto mt-3 max-w-lg text-center text-base font-semibold text-[#222222]">
        You’ve explored {engagement.recent_views} {engagement.recent_views === 1 ? 'activity' : 'activities'} without a meaningful action yet. Let’s turn 60 seconds into real progress.
      </p>

      <motion.div
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } } }}
        initial="hidden"
        animate="visible"
        className="mt-6 grid grid-cols-2 gap-3 sm:gap-4"
      >
        <motion.div
          variants={metricVariants}
          className="rounded-[22px] border-[3px] border-black bg-[#FFD700] p-4 text-center shadow-[4px_4px_0_#111] sm:p-5"
        >
          <p className="text-5xl font-black tabular-nums sm:text-6xl">{engagement.recent_views}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] sm:text-xs">Activities explored</p>
        </motion.div>
        <motion.div
          variants={metricVariants}
          className="rounded-[22px] border-[3px] border-black bg-[#FFB7AA] p-4 text-center shadow-[4px_4px_0_#111] sm:p-5"
        >
          <p className="text-5xl font-black tabular-nums sm:text-6xl">{engagement.meaningful_actions}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] sm:text-xs">Meaningful actions</p>
        </motion.div>
      </motion.div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.12em] sm:text-[10px]">
        {['Attention', 'Action', 'Feedback', 'Progress', 'Adaptation'].map((step, index) => (
          <span key={step} className="inline-flex items-center gap-2">
            <span className={`rounded-full border-2 border-black px-2.5 py-1 ${index === 0 ? 'bg-[#FFD700]' : index === 1 ? 'bg-[#00FF7F]' : 'bg-white'}`}>{step}</span>
            {index < 4 ? <ArrowRight size={13} aria-hidden="true" /> : null}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-[22px] border-[3px] border-black bg-[#FFF8E8] p-4 shadow-[4px_4px_0_#111]">
        {activity ? (
          <>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border-[3px] border-black bg-[#FFD700]" aria-hidden="true">
                <Bolt size={20} />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#D32F2F]">
                  <Clock size={14} /> 60-Second Challenge
                </p>
                <p className="mt-1 text-lg font-black uppercase">{activity.title}</p>
                <p className="mt-1 text-sm font-semibold text-[#333333]">{activity.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onTryChallenge(activity)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[18px] border-[3px] border-black bg-[#FF6F61] px-4 py-3 text-sm font-black uppercase shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
            >
              Take the challenge <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <p className="font-black uppercase">No challenge is available right now.</p>
            <p className="mt-1 text-sm font-semibold text-[#333333]">Try loading your recommendations again.</p>
            <button
              type="button"
              onClick={onRetryFeed}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[18px] border-[3px] border-black bg-[#FF6F61] px-4 py-3 text-sm font-black uppercase shadow-[5px_5px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
            >
              Retry recommendations <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onKeepExploring}
          className="inline-flex items-center justify-center rounded-[18px] px-4 py-3 text-sm font-black uppercase text-[#555] transition-colors hover:text-black focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
        >
          Dismiss & Keep exploring
        </button>
      </div>
    </motion.section>
  )
}

export default InterventionCard
