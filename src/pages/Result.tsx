import { ArrowRight, Sparkles, Timer, Trophy, CheckCircle, Crosshair } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ActivityCard from '../components/ActivityCard'
import LoadingState from '../components/LoadingState'
import { useAppContext } from '../context/AppContext'
import { getLearningFeed } from '../services/cardService'
import type { CardProgress, LegacyActivity, LegacyInteractionResult, NormalizedLearningCard } from '../types'
import { useFeed } from '../hooks/useFeed'

interface ResultState {
  cardProgress?: CardProgress
  legacyResult?: LegacyInteractionResult
  legacyActivity?: LegacyActivity
  recruiterReturn?: unknown
}

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId } = useAppContext()
  const { cardProgress, legacyResult, legacyActivity } = (location.state as ResultState) || {}
  const recruiterReturn = (location.state as ResultState | null)?.recruiterReturn
  
  const [freshFeed, setFreshFeed] = useState<NormalizedLearningCard[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)

  useEffect(() => {
    if (recruiterReturn) {
      setLoadingFeed(false)
      return
    }
    if (!userId || (!cardProgress && !legacyResult)) {
      navigate('/feed')
      return
    }

    let cancelled = false
    getLearningFeed(userId)
      .then((feed) => {
        if (!cancelled) {
          setFreshFeed(feed)
          setLoadingFeed(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingFeed(false)
        }
      })

    return () => { cancelled = true }
  }, [userId, cardProgress, legacyResult, navigate, recruiterReturn])

  const nextCard = freshFeed[0]

  const handleReturnToFeed = () => {
    if (recruiterReturn) {
      navigate('/recruiter', { state: { recruiterReturn } })
      return
    }
    navigate('/feed', { state: { adaptiveRefresh: true, refreshedFeed: freshFeed } })
  }

  if (!cardProgress && !legacyResult) {
    return null
  }

  // --- NEW BACKEND RENDER ---
  if (cardProgress) {
    const timeSpentMins = Math.floor(cardProgress.time_spent / 60)
    const timeSpentSecs = cardProgress.time_spent % 60
    const idealMins = Math.floor(cardProgress.ideal_time / 60)

    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border-[4px] border-black bg-[#FFD700] shadow-[6px_6px_0_#111]">
            <Trophy size={40} className="text-black" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
            You made progress<span className="text-[#FF6F61]">.</span>
          </h1>
          {cardProgress.needs_revision ? (
            <p className="mt-4 rounded-full border-2 border-black bg-[#FFE1DC] px-4 py-2 font-bold text-black">
              This concept could use a bit more review. We'll revisit it later.
            </p>
          ) : (
            <p className="mt-4 font-bold text-[#555]">Solid work. The engine has updated your profile.</p>
          )}
        </div>

        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[24px] border-[3px] border-black bg-white p-6 shadow-[5px_5px_0_#111]">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#333]">
              <Timer size={14} /> Time Spent
            </p>
            <p className="mt-2 text-3xl font-black uppercase">
              {timeSpentMins}m {timeSpentSecs}s
            </p>
            <p className="mt-1 text-sm font-bold text-[#666]">Ideal: {idealMins}m</p>
          </div>
          
          {cardProgress.total_questions > 0 && (
            <div className="rounded-[24px] border-[3px] border-black bg-white p-6 shadow-[5px_5px_0_#111]">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#333]">
                <CheckCircle size={14} /> Accuracy
              </p>
              <p className="mt-2 text-3xl font-black uppercase">
                {cardProgress.correct_answers}/{cardProgress.total_questions}
              </p>
            </div>
          )}

          <div className="rounded-[24px] border-[3px] border-black bg-[#C0F7FE] p-6 shadow-[5px_5px_0_#111]">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#333]">
              <Crosshair size={14} /> Comprehension
            </p>
            <p className="mt-2 text-3xl font-black uppercase">
              {Math.round(cardProgress.comprehension_score * 100)}%
            </p>
          </div>

          <div className="rounded-[24px] border-[3px] border-black bg-[#00FF7F] p-6 shadow-[5px_5px_0_#111]">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#333]">
              <Sparkles size={14} /> Mastery
            </p>
            <p className="mt-2 text-3xl font-black uppercase">
              {Math.round(cardProgress.mastery_score * 100)}%
            </p>
          </div>
        </div>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase">Your next move</h2>
          </div>
          {loadingFeed ? (
            <LoadingState label="Recalculating your feed..." />
          ) : nextCard ? (
            <div className="space-y-6">
              <ActivityCard
                card={nextCard}
                index={0}
                onOpen={(c) => navigate(`/activity/${c.id}`)}
              />
            </div>
          ) : (
            <p className="rounded-[24px] border-[3px] border-black bg-white p-8 text-center font-bold">
              No new recommendations right now.
            </p>
          )}
        </section>

        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={handleReturnToFeed}
            className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FFD700] px-8 py-4 text-lg font-black uppercase shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            {recruiterReturn ? 'Return to recruiter dashboard' : 'Find my next move'} <ArrowRight size={20} />
          </button>
        </div>
      </main>
    )
  }

  // --- LEGACY BACKEND RENDER (Fallback) ---
  if (legacyResult) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border-[4px] border-black bg-[#FFD700] shadow-[6px_6px_0_#111]">
            <Trophy size={40} className="text-black" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
            You made progress<span className="text-[#FF6F61]">.</span>
          </h1>
          <p className="mt-4 font-bold text-[#555]">Solid work. The engine has updated your profile.</p>
        </div>

        <div className="mb-12 flex justify-center">
           <div className="inline-block rounded-[24px] border-[3px] border-black bg-[#00FF7F] p-8 shadow-[6px_6px_0_#111]">
             <p className="text-[12px] font-black uppercase tracking-[0.16em]">Progress Earned</p>
             <p className="mt-2 text-6xl font-black">+{legacyResult.progress_earned}</p>
           </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleReturnToFeed}
            className="inline-flex items-center gap-2 rounded-[20px] border-[3px] border-black bg-[#FFD700] px-8 py-4 text-lg font-black uppercase shadow-[5px_5px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            {recruiterReturn ? 'Return to recruiter dashboard' : 'Find my next move'} <ArrowRight size={20} />
          </button>
        </div>
      </main>
    )
  }

  return null
}
