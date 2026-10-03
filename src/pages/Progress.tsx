import { ArrowRight, Sparkles } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { useAppContext } from '../context/AppContext'
import { useLearnerState } from '../hooks/useLearnerState'
import { useRecommendationHistory } from '../hooks/useRecommendationHistory'
import { useLearnerSnapshot } from '../hooks/useLearnerSnapshot'

function prettifySkill(skill: string) {
  return skill
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

export default function ProgressPage() {
  const navigate = useNavigate()
  const { userId, setUser, setUserId } = useAppContext()
  const { cards, engagement, loading, error, refetch } = useLearnerSnapshot(userId)
  const {
    learnerState,
    loading: learnerStateLoading,
    error: learnerStateError,
    refetch: refetchLearnerState,
  } = useLearnerState()
  const {
    data: recommendationHistory,
    loading: recommendationHistoryLoading,
    error: recommendationHistoryError,
    retry: retryRecommendationHistory,
  } = useRecommendationHistory()

  const cardTitles = useMemo(
    () => new Map(cards.filter((card) => card.isRealCard).map((card) => [card.id, card.title])),
    [cards],
  )
  const recentRecommendations = recommendationHistory?.history.slice(0, 5) ?? []

  useEffect(() => {
    if (!error?.toLowerCase().includes('user not found')) return
    setUser(null)
    setUserId(null)
    navigate('/onboarding', { replace: true })
  }, [error, navigate, setUser, setUserId])

  const skillCounts = cards.reduce<Record<string, number>>((counts, card) => {
    counts[card.skill] = (counts[card.skill] ?? 0) + 1
    return counts
  }, {})
  
  const skills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1])
  
  const metrics = [
    [String(engagement?.meaningful_actions ?? '—'), 'Recent meaningful actions'],
    [String(engagement?.recent_views ?? '—'), 'Recent views'],
    [String(cards.length), 'Recommended challenges'],
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
          <p className="mt-2 text-sm font-semibold text-[#444444]">The learning engine is watching what you do.</p>
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

      <section className="mt-8" aria-labelledby="learner-state-title">
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#4B0082]">Current learner state</p>
          <h2 id="learner-state-title" className="mt-1 text-2xl font-black uppercase sm:text-3xl">
            What Vinayoki Knows About You
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-[#444444]">
            These values come from your saved profile, skill records, and learning progress.
          </p>
        </div>

        {learnerStateLoading ? (
          <p role="status" className="rounded-[18px] border-[3px] border-black bg-[#C0F7FE] px-4 py-3 text-sm font-black shadow-[4px_4px_0_#111]">
            Loading learner state…
          </p>
        ) : null}

        {learnerStateError ? (
          <div role="alert" className="rounded-[20px] border-[3px] border-black bg-[#FFE1DC] p-4 shadow-[4px_4px_0_#111]">
            <p className="text-sm font-bold">Learner state is unavailable. {learnerStateError}</p>
            <button
              type="button"
              onClick={refetchLearnerState}
              className="mt-3 rounded-[14px] border-[3px] border-black bg-[#FFD700] px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
            >
              Retry learner state
            </button>
          </div>
        ) : null}

        {learnerState ? (
          <div className="space-y-5">
            <div className="grid min-w-0 gap-5 xl:grid-cols-[0.8fr_1.2fr]">
              <section className="min-w-0 rounded-[24px] border-[3px] border-black bg-[#C0F7FE] p-4 shadow-[5px_5px_0_#111] sm:p-5" aria-labelledby="learner-profile-title">
                <h3 id="learner-profile-title" className="text-lg font-black uppercase">Profile</h3>
                <dl className="mt-4 space-y-3">
                  {[
                    ['Goal', learnerState.profile.goal],
                    ['Level', learnerState.profile.level],
                    ['Learning style', learnerState.profile.learning_style],
                  ].map(([label, value]) => (
                    <div key={label} className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] gap-2 border-t-2 border-black/20 pt-2">
                      <dt className="text-xs font-black uppercase tracking-wide">{label}</dt>
                      <dd className="min-w-0 break-words text-right text-sm font-bold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="min-w-0 rounded-[24px] border-[3px] border-black bg-[#FFD700] p-4 shadow-[5px_5px_0_#111] sm:p-5" aria-labelledby="learner-metrics-title">
                <h3 id="learner-metrics-title" className="text-lg font-black uppercase">Learner metrics</h3>
                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    ['Cards attempted', String(learnerState.metrics.cards_attempted)],
                    ['Cards completed', String(learnerState.metrics.cards_completed)],
                    ['Average mastery', formatPercent(learnerState.metrics.average_mastery)],
                    ['Average accuracy', formatPercent(learnerState.metrics.average_accuracy)],
                    ['Average build score', formatPercent(learnerState.metrics.average_build_score)],
                    ['Total attempts', String(learnerState.metrics.total_attempts)],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0 rounded-[16px] border-2 border-black bg-white p-3">
                      <dt className="break-words text-[10px] font-black uppercase leading-tight tracking-wide">{label}</dt>
                      <dd className="mt-2 break-words text-2xl font-black sm:text-3xl">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>

            <section className="min-w-0 rounded-[24px] border-[3px] border-black bg-[#FFF8E8] p-4 shadow-[5px_5px_0_#111] sm:p-5" aria-labelledby="learner-skills-title">
              <h3 id="learner-skills-title" className="text-lg font-black uppercase">Skills</h3>
              {learnerState.skills.length > 0 ? (
                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                  {learnerState.skills.map((skill) => (
                    <article key={skill.skill} className="min-w-0 rounded-[18px] border-2 border-black bg-white p-3 sm:p-4">
                      <h4 className="break-words text-sm font-black uppercase">{prettifySkill(skill.skill)}</h4>
                      <dl className="mt-3 grid grid-cols-2 gap-2">
                        {[
                          ['Interest', formatPercent(skill.interest_score)],
                          ['Skill score', formatPercent(skill.skill_score)],
                          ['Completion rate', formatPercent(skill.completion_rate)],
                          ['Skip rate', formatPercent(skill.skip_rate)],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0 rounded-[12px] border-2 border-black/20 bg-[#FFF8E8] p-2">
                            <dt className="break-words text-[9px] font-black uppercase leading-tight">{label}</dt>
                            <dd className="mt-1 text-base font-black">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-[14px] border-2 border-black/20 bg-white p-3 text-sm font-semibold">
                  No skill records are available yet.
                </p>
              )}
            </section>

            <section className="rounded-[24px] border-[3px] border-black bg-[#E8D7FF] p-4 shadow-[5px_5px_0_#111] sm:p-5" aria-labelledby="learner-state-explainer">
              <h3 id="learner-state-explainer" className="text-lg font-black uppercase">How Vinayoki Uses This</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Your activity', 'Meaningful interactions update learning progress.'],
                  ['Learner state', 'Stored profile, skill, and progress data summarize what the system currently knows.'],
                  ['ML prediction', 'The recommender combines learner and content features to estimate completion probability.'],
                  ['Recommendation', 'The ranked feed can change after meaningful interactions update learner state.'],
                ].map(([title, description], index) => (
                  <div key={title} className="min-w-0 rounded-[16px] border-2 border-black bg-white p-3">
                    <p className="text-xs font-black uppercase">{index + 1}. {title}</p>
                    <p className="mt-2 break-words text-xs font-semibold leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold text-[#333333]">
                This section shows saved learner data; it does not display a live ML prediction.
              </p>
            </section>
          </div>
        ) : null}
      </section>

      {!loading && !error ? (
        <section className="mt-7 rounded-[26px] border-[3px] border-black bg-[#111111] p-5 text-white shadow-[6px_6px_0_#FFD700] sm:p-6" aria-labelledby="progress-principle">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">The Vinayoki loop</p>
          <h2 id="progress-principle" className="mt-2 text-2xl font-black uppercase sm:text-3xl">Progress is something you do.</h2>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] sm:text-xs">
            {['Attention', 'Action', 'Feedback', 'Progress', 'Adaptation'].map((step, index) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className={`rounded-full border-2 border-white px-3 py-1 ${index === 4 ? 'bg-[#00FF7F] text-black' : 'bg-transparent'}`}>{step}</span>
                {index < 4 ? <ArrowRight size={14} aria-hidden="true" /> : null}
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
                    tickFormatter={(skill: string) => prettifySkill(skill).slice(0, 12)}
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: '#111' }} />
                  <Tooltip labelFormatter={(label) => prettifySkill(label as string)} />
                  <Bar dataKey="count" name="Recommended challenges" fill="#00BFFF" stroke="#111" strokeWidth={2} />
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
                <span>{prettifySkill(skill)}</span>
                <span className="text-xs">{count} {count === 1 ? 'challenge' : 'challenges'} →</span>
              </Link>
            ))}
            {!loading && skills.length === 0 ? <p className="text-sm font-semibold">No recommended skills yet.</p> : null}
          </div>
        </div>
      </div> : null}

      <section className="mt-8 min-w-0" aria-labelledby="recommendation-history-title">
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#4B0082]">Recommendation transparency</p>
          <h2 id="recommendation-history-title" className="mt-1 text-2xl font-black uppercase sm:text-3xl">
            Why These Recommendations?
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-[#444444]">
            Recent recommendation decisions. Showing up to five records, newest first.
          </p>
        </div>

        {recommendationHistoryLoading ? (
          <p role="status" className="rounded-[18px] border-[3px] border-black bg-[#C0F7FE] px-4 py-3 text-sm font-black shadow-[4px_4px_0_#111]">
            Loading recommendation history…
          </p>
        ) : null}

        {recommendationHistoryError ? (
          <div role="alert" className="rounded-[20px] border-[3px] border-black bg-[#FFE1DC] p-4 shadow-[4px_4px_0_#111]">
            <p className="text-sm font-bold">Recommendation history couldn&apos;t be loaded.</p>
            <button
              type="button"
              onClick={retryRecommendationHistory}
              className="mt-3 rounded-[14px] border-[3px] border-black bg-[#FFD700] px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!recommendationHistoryLoading && !recommendationHistoryError && recentRecommendations.length === 0 ? (
          <p className="rounded-[18px] border-[3px] border-black bg-white p-4 text-sm font-bold shadow-[4px_4px_0_#111]">
            No recommendation decisions recorded yet.
          </p>
        ) : null}

        {recentRecommendations.length > 0 ? (
          <div className="space-y-3">
            {recentRecommendations.map((item) => (
              <article key={item.id} className="min-w-0 rounded-[22px] border-[3px] border-black bg-[#FFF8E8] p-4 shadow-[5px_5px_0_#111] sm:p-5">
                <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-black uppercase">
                      {cardTitles.get(item.card_id) ?? `Card #${item.card_id}`}
                    </h3>
                    <p className="mt-1 text-xs font-black uppercase tracking-wide">Rank #{item.rank}</p>
                  </div>
                  <dl className="grid min-w-0 grid-cols-2 gap-2 sm:min-w-[18rem]">
                    <div className="min-w-0 rounded-[14px] border-2 border-black bg-[#FFD700] p-3">
                      <dt className="break-words text-[9px] font-black uppercase leading-tight">Recommendation score</dt>
                      <dd className="mt-1 text-xl font-black">{formatPercent(item.final_score)}</dd>
                    </div>
                    <div className="min-w-0 rounded-[14px] border-2 border-black bg-[#C0F7FE] p-3">
                      <dt className="break-words text-[9px] font-black uppercase leading-tight">Predicted completion probability</dt>
                      <dd className="mt-1 text-xl font-black">{formatPercent(item.completion_probability)}</dd>
                    </div>
                  </dl>
                </div>

                <details className="mt-4 border-t-2 border-black/20 pt-3">
                  <summary className="w-fit cursor-pointer rounded-[12px] border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4B0082]">
                    Why this was recommended
                  </summary>
                  <div className="mt-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em]">Why these signals</p>
                    <dl className="mt-2 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {[
                        ['Predicted completion probability', item.completion_probability],
                        ['Performance contribution', item.performance_score],
                        ['Interest signal', item.interest_score],
                        ['Skill-fit signal', item.skill_fit_score],
                        ['Progress value', item.progress_score],
                        ['Learning preference', item.preference_score],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0 rounded-[14px] border-2 border-black/20 bg-white p-3">
                          <dt className="break-words text-[9px] font-black uppercase leading-tight">{label}</dt>
                          <dd className="mt-1 text-lg font-black">{formatPercent(value as number)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </details>
              </article>
            ))}
          </div>
        ) : null}

        <div className="mt-4 rounded-[20px] border-[3px] border-black bg-[#E8D7FF] p-4 shadow-[4px_4px_0_#111]">
          <p className="text-sm font-semibold">
            These signals are used by Vinayoki&apos;s recommendation layer. They describe the information available when each recommendation was generated.
          </p>
          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-[12px] border-2 border-black bg-white p-3">
              <dt className="font-black uppercase">Learner state</dt>
              <dd className="mt-1 font-semibold">What Vinayoki currently knows about the learner.</dd>
            </div>
            <div className="rounded-[12px] border-2 border-black bg-white p-3">
              <dt className="font-black uppercase">ML prediction</dt>
              <dd className="mt-1 font-semibold">The predicted probability of completing the card.</dd>
            </div>
            <div className="rounded-[12px] border-2 border-black bg-white p-3">
              <dt className="font-black uppercase">Recommendation score</dt>
              <dd className="mt-1 font-semibold">The combined score used to rank recommendations.</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs font-semibold text-[#333333]">
            The component signals are learner-state inputs or deterministic scoring values; they are not all separate ML predictions.
          </p>
        </div>
      </section>
    </main>
  )
}
