import { ArrowRight, Sparkles } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { useAppContext } from '../context/AppContext'
import { useLearnerSnapshot } from '../hooks/useLearnerSnapshot'
import { useNavigate } from 'react-router-dom'

export default function ProgressPage() {
  const navigate = useNavigate()
  const { userId, setUser, setUserId } = useAppContext()
  const { activities, engagement, loading, error, refetch } = useLearnerSnapshot(userId)

  useEffect(() => {
    if (!error?.toLowerCase().includes('user not found')) return
    setUser(null)
    setUserId(null)
    navigate('/onboarding', { replace: true })
  }, [error, navigate, setUser, setUserId])
  const skillCounts = activities.reduce<Record<string, number>>((counts, activity) => {
    counts[activity.skill] = (counts[activity.skill] ?? 0) + 1
    return counts
  }, {})
  const skills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1])
  const metrics = [
    [String(engagement?.meaningful_actions ?? '—'), 'Recent meaningful actions'],
    [String(engagement?.recent_views ?? '—'), 'Recent views'],
    [String(activities.length), 'Recommended challenges'],
    [String(skills.length), 'Recommended skill areas'],
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#C0F7FE] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4B0082]">
            <Sparkles size={13} aria-hidden="true" /> Actions over screen time
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">Progress<span className="text-[#FF6F61]">.</span></h1>
          <p className="mt-2 text-sm font-semibold text-[#444444]">What you do matters more than how long you stay.</p>
        </div>
      </div>

      {loading ? <LoadingState label="Loading your progress signals..." /> : null}

      {error ? (
        <div role="alert" className="mb-6 rounded-[24px] border-[3px] border-black bg-[#FF6F61] p-5 font-bold shadow-[5px_5px_0_#111]">
          <p>Could not load your progress from the learning engine. {error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-4 rounded-[14px] border-[3px] border-black bg-[#FFD700] px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !error ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([value, label], index) => (
          <div
            key={label}
            className={`rounded-[24px] border-[3px] border-black p-5 shadow-[5px_5px_0_#111] ${
              index % 2 === 0 ? 'bg-[#FFD700]' : index % 2 === 1 ? 'bg-[#C0F7FE]' : 'bg-[#FF6F61]'
            }`}
          >
            <p className="text-4xl font-black uppercase">{loading ? '…' : value}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em]">{label}</p>
          </div>
        ))}
      </div> : null}

      {!loading && !error ? (
        <section className="mt-7 rounded-[26px] border-[3px] border-black bg-[#111111] p-5 text-white shadow-[6px_6px_0_#FFD700] sm:p-6" aria-labelledby="progress-principle">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">The Vinayoki loop</p>
          <h2 id="progress-principle" className="mt-2 text-2xl font-black uppercase sm:text-3xl">Progress is something you do.</h2>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] sm:text-xs">
            {['Attention', 'Action', 'Evidence', 'Progress'].map((step, index) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className={`rounded-full border-2 border-white px-3 py-1 ${index === 3 ? 'bg-[#00FF7F] text-black' : 'bg-transparent'}`}>{step}</span>
                {index < 3 ? <ArrowRight size={14} aria-hidden="true" /> : null}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && !error ? <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-5 shadow-[6px_6px_0_#111]">
          <h2 className="text-lg font-black uppercase sm:text-xl">Recommended activity by skill</h2>
          <p className="mt-1 text-sm font-semibold text-[#333333]">A snapshot of what the learning engine is recommending now.</p>
          <div className="mt-4 h-52 min-w-0 overflow-hidden">
            {skills.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skills.map(([skill, count]) => ({ skill, count }))} margin={{ top: 4, right: 16, bottom: 8, left: -16 }}>
                  <CartesianGrid stroke="#111" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="skill"
                    tickLine={false}
                    axisLine={{ stroke: '#111' }}
                    tick={{ fontSize: 9, fontWeight: 700 }}
                    tickFormatter={(skill: string) => skill.replace(/_/g, ' ').slice(0, 9)}
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: '#111' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Recommended activities" fill="#00BFFF" stroke="#111" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm font-bold">
                {loading ? 'Loading your recommendations…' : 'Your skill breakdown will appear when recommendations are available.'}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-[28px] border-[3px] border-black bg-[#FFF8E8] p-5 shadow-[6px_6px_0_#111]">
          <h2 className="text-xl font-black uppercase">Focus areas</h2>
          <p className="mt-1 text-sm font-semibold text-[#333333]">Open a skill to see its recommended challenges.</p>
          <div className="mt-5 space-y-3">
            {skills.map(([skill, count]) => (
              <Link
                key={skill}
                to={`/skill/${encodeURIComponent(skill)}`}
                className="flex items-center justify-between rounded-[18px] border-[3px] border-black bg-white p-4 font-black uppercase shadow-[4px_4px_0_#111] hover:bg-[#C0F7FE]"
              >
                <span>{skill}</span>
                <span className="text-xs">{count} {count === 1 ? 'challenge' : 'challenges'} →</span>
              </Link>
            ))}
            {!loading && skills.length === 0 ? <p className="text-sm font-semibold">No recommended skills yet.</p> : null}
          </div>
        </div>
      </div> : null}
    </main>
  )
}
