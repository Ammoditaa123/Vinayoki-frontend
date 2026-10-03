import { useEffect, useMemo } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ActivityBadge from '../components/ActivityBadge'
import LoadingState from '../components/LoadingState'
import RecommendationReason from '../components/RecommendationReason'
import { useAppContext } from '../context/AppContext'
import { useFeed } from '../hooks/useFeed'

const normalizeSkill = (value: string) => value.toLowerCase().replace(/[-_]/g, ' ').trim()

export default function SkillDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user, userId, setCurrentActivity, setUser, setUserId } = useAppContext()
  const { activities, loading, error, refetch } = useFeed(userId)
  const skillActivities = useMemo(
    () => activities.filter((activity) => normalizeSkill(activity.skill) === normalizeSkill(id)),
    [activities, id],
  )
  const skillName = (skillActivities[0]?.skill ?? id).replace(/[-_]/g, ' ')
  const learnerLevel = user?.skillLevel ?? user?.level ?? 'Not available'
  const averageDifficulty = skillActivities.length
    ? Math.round(skillActivities.reduce((total, activity) => total + activity.difficulty, 0) / skillActivities.length)
    : null
  const estimatedMinutes = skillActivities.reduce((total, activity) => total + activity.duration, 0)

  useEffect(() => {
    if (!error?.toLowerCase().includes('user not found')) return
    setUser(null)
    setUserId(null)
    navigate('/onboarding', { replace: true })
  }, [error, navigate, setUser, setUserId])

  const openActivity = (activityId: number) => {
    const activity = skillActivities.find((item) => item.id === activityId)
    if (!activity) return

    setCurrentActivity(activity)
    navigate(`/activity/${activity.id}`)
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
          <div className="mt-4 space-y-3">
            {skillActivities.map((activity) => {
              const progressLabel = activity.type === 'build' || activity.type === 'micro_lesson'
                ? `+${activity.progress_value}`
                : '3–5'

              return (
                <article key={activity.id} className="rounded-[22px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#111] sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <ActivityBadge type={activity.type} />
                        <span className="rounded-full border-2 border-black bg-[#FFF8E8] px-2.5 py-1 text-[10px] font-black uppercase">{activity.duration} min</span>
                      </div>
                      <h3 className="text-xl font-black uppercase leading-tight">{activity.title}</h3>
                      <p className="mt-2 text-sm font-semibold text-[#333333]">{activity.description}</p>
                    </div>
                    <span className="inline-flex shrink-0 rounded-[14px] border-[3px] border-black bg-[#FFD700] px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111]">
                      {progressLabel} progress
                    </span>
                  </div>
                  <div className="mt-4 rounded-[16px] border-2 border-black bg-[#C0F7FE] p-3">
                    <RecommendationReason reasons={activity.why_this ?? ['Recommended to explore a new skill']} />
                  </div>
                  <button
                    type="button"
                    onClick={() => void openActivity(activity.id)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[16px] border-[3px] border-black bg-[#FF6F61] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082] sm:w-auto"
                  >
                    Next challenge <ArrowRight size={16} />
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
