import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import LoadingState from '../components/LoadingState'
import BuildStep from '../components/BuildStep'
import SolveStep from '../components/SolveStep'
import WatchStep from '../components/WatchStep'
import { useAppContext } from '../context/AppContext'
import { getLearningCardDetail, submitStepInteraction } from '../services/cardService'
import type { NormalizedCardDetail, NormalizedStep, CardProgress, LegacyActivity } from '../types'
import { sendInteraction } from '../services/interactionApi'

export default function Activity() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const recruiterReturn = (location.state as { recruiterReturn?: unknown } | null)?.recruiterReturn
  const { userId, backendMode, currentCard, currentActivity } = useAppContext()

  const [cardDetail, setCardDetail] = useState<NormalizedCardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Legacy fallback state
  const isLegacy = backendMode === 'activities' || (!cardDetail && currentActivity)
  const [legacyActionDone, setLegacyActionDone] = useState(false)
  const legacyActivity = currentActivity as LegacyActivity | null

  useEffect(() => {
    if (!userId) {
      navigate('/onboarding')
      return
    }

    const loadCard = async () => {
      setLoading(true)
      try {
        const detail = await getLearningCardDetail(Number(id), userId)
        if (detail) {
          setCardDetail(detail)
          setCurrentStepIndex(detail.resumeFromStep)
        } else if (backendMode === 'cards') {
          setError('Could not load card details.')
        }
      } catch (err) {
        setError('Failed to fetch card.')
      } finally {
        setLoading(false)
      }
    }

    // Only load if not purely in legacy mode where we just rely on currentActivity
    if (backendMode !== 'activities') {
      void loadCard()
    } else {
      setLoading(false)
    }
  }, [id, userId, backendMode, navigate])

  const handleStepComplete = async (payload: { correct?: boolean; buildScore?: number; timeSpent: number }) => {
    if (!userId || !cardDetail) return
    
    setIsSubmitting(true)
    const step = cardDetail.steps[currentStepIndex]

    try {
      const result = await submitStepInteraction({
        user_id: userId,
        card_id: cardDetail.card.id,
        step_id: step.id,
        action: step.type,
        time_spent: payload.timeSpent,
        correct: payload.correct,
        build_score: payload.buildScore,
      })

      // Check if this was the last step
      if (currentStepIndex >= cardDetail.steps.length - 1) {
        navigate('/result', { state: { cardProgress: result.progress, recruiterReturn } })
      } else {
        // Move to next step
        setCurrentStepIndex((prev) => prev + 1)
      }
    } catch (err) {
      toast.error('Could not save your progress.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLegacyComplete = async (payload: { action: 'view' | 'answer' | 'build', correct?: boolean, buildScore?: number }) => {
    if (!userId || !legacyActivity) return
    setIsSubmitting(true)
    try {
      const result = await sendInteraction({
        user_id: userId,
        content_id: legacyActivity.id,
        action: payload.action === 'view' ? 'complete' : payload.action,
        time_spent: 30, // Mock time for legacy
        completed: true,
        correct: payload.correct,
        idempotency_key: `vinayoki-${legacyActivity.id}-${payload.action}-${Date.now()}`
      })
      navigate('/result', { state: { legacyResult: result, legacyActivity } })
    } catch {
      toast.error('Could not save your progress.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
        <LoadingState label="Loading your challenge..." />
      </main>
    )
  }

  if (error || (!cardDetail && !isLegacy)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-[28px] border-[3px] border-black bg-[#FFE1DC] p-6 shadow-[6px_6px_0_#111]">
          <h1 className="text-2xl font-black uppercase">Oops!</h1>
          <p className="mt-2 text-lg font-bold">Could not load this challenge.</p>
          <button
            onClick={() => navigate(recruiterReturn ? '/recruiter' : '/feed', recruiterReturn ? { state: { recruiterReturn } } : undefined)}
            className="mt-4 rounded-[16px] border-[3px] border-black bg-[#FFD700] px-6 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#111]"
          >
            Back to feed
          </button>
        </div>
      </main>
    )
  }

  // LEGACY FALLBACK
  if (isLegacy && legacyActivity) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => navigate(recruiterReturn ? '/recruiter' : '/feed', recruiterReturn ? { state: { recruiterReturn } } : undefined)}
          className="mb-6 flex items-center gap-2 text-sm font-black uppercase text-[#333] transition-colors hover:text-black"
        >
          <ArrowLeft size={16} /> Back
        </button>
        
        <div className="rounded-[32px] border-[3px] border-black bg-[#FFF8E8] p-6 shadow-[8px_8px_0_#111] sm:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-black bg-[#C0F7FE] px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] shadow-[3px_3px_0_#111]">
            {legacyActivity.type.replace(/_/g, ' ')}
          </span>
          <h1 className="mt-4 text-3xl font-black uppercase leading-tight sm:text-4xl">{legacyActivity.title}</h1>
          <p className="mt-4 text-lg font-bold leading-relaxed text-[#222]">
            {legacyActivity.description}
          </p>

          {!legacyActionDone ? (
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  setLegacyActionDone(true)
                  if (!legacyActivity.question && legacyActivity.type !== 'build') {
                    handleLegacyComplete({ action: 'view' })
                  }
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FFD700] px-8 py-4 text-lg font-black uppercase shadow-[5px_5px_0_#111] disabled:opacity-50"
              >
                Got it
              </button>
            </div>
          ) : (
            <div className="mt-8">
              {legacyActivity.question && (
                <div className="rounded-[24px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0_#111]">
                  <p className="text-xl font-bold">{legacyActivity.question}</p>
                  <div className="mt-6 flex flex-col gap-4">
                    {(() => {
                       let opts: string[] = []
                       try { opts = JSON.parse(legacyActivity.options as string) } catch { opts = [] }
                       return opts.map(opt => (
                         <button
                           key={opt}
                           onClick={() => handleLegacyComplete({ action: 'answer', correct: opt === legacyActivity.answer })}
                           disabled={isSubmitting}
                           className="w-full rounded-[16px] border-2 border-black bg-gray-50 p-4 text-left font-bold transition-all hover:-translate-y-1 hover:bg-[#C0F7FE] hover:shadow-[4px_4px_0_#111]"
                         >
                           {opt}
                         </button>
                       ))
                    })()}
                  </div>
                </div>
              )}
              {legacyActivity.type === 'build' && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleLegacyComplete({ action: 'build', buildScore: 1.0 })}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#00FF7F] px-8 py-4 text-lg font-black uppercase shadow-[5px_5px_0_#111]"
                  >
                    Finish Build
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    )
  }

  // NEW MULTI-STEP FLOW
  if (!cardDetail) return null
  const currentStep = cardDetail.steps[currentStepIndex]
  const progressPct = ((currentStepIndex) / cardDetail.steps.length) * 100

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(recruiterReturn ? '/recruiter' : '/feed', recruiterReturn ? { state: { recruiterReturn } } : undefined)}
          className="flex items-center gap-2 text-sm font-black uppercase text-[#333] transition-colors hover:text-black"
        >
          <ArrowLeft size={16} /> Quit
        </button>
        <span className="text-xs font-black uppercase tracking-wider text-[#555]">
          Step {currentStepIndex + 1} / {cardDetail.steps.length}
        </span>
      </div>

      <div className="mb-8 overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[3px_3px_0_#111]">
        <motion.div
          className="h-3 rounded-full bg-[#00FF7F]"
          animate={{ width: `${Math.max(10, progressPct)}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      <div className="relative flex-1 rounded-[32px] border-[3px] border-black bg-[#FFF8E8] p-6 shadow-[8px_8px_0_#111] sm:p-8">
        {isSubmitting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[29px] bg-white/50 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {currentStep.type === 'watch' && (
            <WatchStep
              key={currentStep.id}
              step={currentStep}
              onComplete={(timeSpent) => handleStepComplete({ timeSpent })}
            />
          )}
          {currentStep.type === 'solve' && (
            <SolveStep
              key={currentStep.id}
              step={currentStep}
              onComplete={(correct, timeSpent) => handleStepComplete({ correct, timeSpent })}
            />
          )}
          {currentStep.type === 'build' && (
            <BuildStep
              key={currentStep.id}
              step={currentStep}
              onComplete={(buildScore, timeSpent) => handleStepComplete({ buildScore, timeSpent })}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
