import { useEffect, useMemo } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ActivityCard from '../components/ActivityCard'
import LoadingState from '../components/LoadingState'
import { useAppContext } from '../context/AppContext'
import { useFeed } from '../hooks/useFeed'
import type { NormalizedLearningCard } from '../types'

const normalizeSkill = (value: string) => value.toLowerCase().replace(/[-_]/g, ' ').trim()
const prettifySkill = (value: string) => value.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

export default function SkillDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user, userId, setCurrentCard, setUser, setUserId } = useAppContext()
  const { cards, loading, error, refetch } = useFeed(userId)
  
  const skillActivities = useMemo(
    () => cards.filter((card) => normalizeSkill(card.skill) === normalizeSkill(id)),
    [cards, id],
  )
  const skillName = prettifySkill(skillActivities[0]?.skill ?? id)
  const learnerLevel = user?.skillLevel ?? user?.level ?? 'Not available'
  const averageDifficulty = skillActivities.length
    ? Math.round(skillActivities.reduce((total, card) => total + card.difficulty, 0) / skillActivities.length)
    : null
  const estimatedMinutes = Math.ceil(skillActivities.reduce((total, card) => total + card.estimatedTime, 0) / 60)

  useEffect(() => {
    if (!error?.toLowerCase().includes('user not found')) return
    setUser(null)
    setUserId(null)
    navigate('/onboarding', { replace: true })
  }, [error, navigate, setUser, setUserId])

  const openActivity = (card: NormalizedLearningCard) => {
    setCurrentCard(card)
    navigate(`/activity/${card.id}`)
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/progress" className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase underline decoration-[3px] underline-offset-4">
        <ArrowLeft size={16} /> Back to progress
      </Link>

      <div className="rounded-[32px] border-[3px] border-black bg-[#C0F7FE] p-5 shadow-[8px_8px_0_#111] sm:p-7">
        <p className="inline-flex rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4B0082]">Your current path</p>
        <h1 className="mt-3 break-words text-4xl font-black uppercase leading-none sm:text-5xl">{skillName || 'Skill'}<span className="text-[#FF6F61]">.</span></h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-[#333333]">
          A set of real activities the learning engine currently recommends for this focus. No mastery score—just your next useful move.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['Recommended challenges', String(skillActivities.length)],
            ['Average difficulty', averageDifficulty === null ? '—' : String(averageDifficulty)],
            ['Estimated minutes', String(estimatedMinutes)],
            ['Learner level', learnerLevel],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[20px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#111]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#333333]">{label}</p>
              <p className="mt-3 text-lg font-black uppercase">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[24px] border-[3px] border-black bg-[#FFF8E8] p-5 shadow-[5px_5px_0_#111]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black uppercase">Challenges in your feed</h2>
              <p className="mt-1 text-sm font-semibold text-[#333333]">These recommendations are selected by the learning engine.</p>
            </div>
            <Link to="/feed" className="shrink-0 inline-flex items-center gap-1 text-xs font-black uppercase underline">
              Feed <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? <div className="mt-4"><LoadingState label="Loading recommended challenges..." /></div> : null}
          {error ? (
            <div role="alert" className="mt-4 rounded-[18px] border-[3px] border-black bg-[#FFE1DC] p-4 font-semibold">
              <p>Could not load challenges: {error}</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-3 rounded-[14px] border-[3px] border-black bg-[#FFD700] px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
              >
                Try again
              </button>
            </div>
          ) : null}
          {!loading && !error && skillActivities.length === 0 ? (
            <p className="mt-4 rounded-[18px] border-[3px] border-black bg-white p-4 font-bold">
              This skill is not in your current recommendations. Check your feed for the latest focus areas.
            </p>
          ) : null}
          <div className="mt-4 space-y-6">
            {skillActivities.map((card, index) => (
              <ActivityCard
                key={card.id}
                card={card}
                index={index}
                onOpen={openActivity}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
