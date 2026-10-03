import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getAdaptationSnapshot, type AdaptationSnapshot } from '../services/adaptationApi'
import { getLearnerState, type LearnerState } from '../services/learnerStateApi'
import { getMlPrediction, type AdaptiveLearnerFeatures, type MlModelFeatures, type MlPredictionResponse } from '../services/mlApi'
import {
  getRecommendationHistory,
  type RecommendationHistoryItem,
  type RecommendationHistoryResponse,
} from '../services/recommendationHistoryApi'

const modelFeatureGroups = [
  {
    title: 'Learner',
    features: [
      ['user_interest', 'User interest'],
      ['skill_level', 'Skill level'],
      ['previous_completion_rate', 'Previous completion rate'],
      ['previous_skip_rate', 'Previous skip rate'],
    ] as Array<[keyof MlModelFeatures, string]>,
  },
  {
    title: 'Content / fit',
    features: [
      ['content_difficulty', 'Content difficulty'],
      ['content_topic_match', 'Topic match'],
      ['difficulty_gap', 'Difficulty gap'],
      ['progress_value', 'Progress value'],
    ] as Array<[keyof MlModelFeatures, string]>,
  },
]

function valueText(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '—'
}

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`
}

function scoreText(value: number) {
  return Number.isFinite(value) ? value.toFixed(4) : '—'
}

function timeText(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

interface RecruiterReturnState {
  userId: number
  cardId: number
  beforeSnapshot: AdaptationSnapshot
}

interface RecruiterLocationState {
  recruiterReturn?: RecruiterReturnState
}

function readRecruiterReturn(state: unknown): RecruiterReturnState | null {
  if (!state || typeof state !== 'object' || !('recruiterReturn' in state)) return null
  const candidate = (state as RecruiterLocationState).recruiterReturn
  return candidate && candidate.userId > 0 && candidate.cardId > 0
    && candidate.beforeSnapshot?.user_id === candidate.userId
    && candidate.beforeSnapshot?.card_id === candidate.cardId
    ? candidate
    : null
}

function metricValue(snapshot: AdaptationSnapshot, key: string): number | null {
  if (key === 'completion_probability') return snapshot.ml.completion_probability
  if (key === 'recommendation_score') return snapshot.recommendation.recommendation_score
  if (key === 'rank') return snapshot.recommendation.rank
  const value = snapshot.learner_state[key as keyof AdaptationSnapshot['learner_state']]
  return typeof value === 'number' ? value : null
}

const comparisonMetrics = [
  ['Mastery', 'mastery_score', 'decimal'],
  ['Accuracy', 'accuracy_score', 'decimal'],
  ['Build Score', 'build_score', 'decimal'],
  ['Time Efficiency', 'time_efficiency', 'decimal'],
  ['Attempts', 'attempt_count', 'integer'],
  ['ML Completion Probability', 'completion_probability', 'percent'],
  ['Recommendation Score', 'recommendation_score', 'percent'],
  ['Rank', 'rank', 'rank'],
] as const

function formatSnapshotMetric(value: number | null, format: (typeof comparisonMetrics)[number][2]) {
  if (value === null) return '—'
  if (format === 'percent') return `${(value * 100).toFixed(2)}%`
  if (format === 'integer' || format === 'rank') return String(value)
  return value.toFixed(2)
}

function formatDelta(delta: number, format: (typeof comparisonMetrics)[number][2]) {
  const sign = delta > 0 ? '+' : ''
  if (format === 'percent') return `${sign}${(delta * 100).toFixed(4)} pp`
  if (format === 'integer') return `${sign}${delta}`
  return `${sign}${delta.toFixed(4)}`
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-[22px] border-[3px] border-black bg-white p-4 shadow-[5px_5px_0_#111] sm:p-5 ${className}`}>
      <h2 className="mb-4 text-lg font-black uppercase tracking-tight sm:text-xl">{title}</h2>
      {children}
    </section>
  )
}

function Retry({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="mt-3 rounded-xl border-[3px] border-black bg-[#FFD700] px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111]">Retry</button>
}

export default function RecruiterDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId, currentCard } = useAppContext()
  const recruiterReturn = readRecruiterReturn(location.state)
  const [learner, setLearner] = useState<LearnerState | null>(null)
  const [learnerLoading, setLearnerLoading] = useState(false)
  const [learnerError, setLearnerError] = useState<string | null>(null)
  const [learnerRetry, setLearnerRetry] = useState(0)
  const [history, setHistory] = useState<RecommendationHistoryResponse | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyRetry, setHistoryRetry] = useState(0)
  const [selectedCardId, setSelectedCardId] = useState<number | null>(recruiterReturn?.cardId ?? null)
  const [beforeSnapshot, setBeforeSnapshot] = useState<AdaptationSnapshot | null>(() =>
    recruiterReturn && recruiterReturn.userId === userId ? recruiterReturn.beforeSnapshot : null,
  )
  const [beforeLoading, setBeforeLoading] = useState(false)
  const [beforeError, setBeforeError] = useState<string | null>(null)
  const [beforeRetry, setBeforeRetry] = useState(0)
  const [afterSnapshot, setAfterSnapshot] = useState<AdaptationSnapshot | null>(null)
  const [afterLoading, setAfterLoading] = useState(false)
  const [afterError, setAfterError] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<MlPredictionResponse | null>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)
  const [predictionRetry, setPredictionRetry] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLearnerLoading(true)
    setLearnerError(null)
    getLearnerState(userId).then((data) => {
      if (!cancelled) setLearner(data)
    }).catch((error: unknown) => {
      if (!cancelled) setLearnerError(error instanceof Error ? error.message : 'Learner state could not be loaded.')
    }).finally(() => {
      if (!cancelled) setLearnerLoading(false)
    })
    return () => { cancelled = true }
  }, [learnerRetry, userId])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setHistoryLoading(true)
    setHistoryError(null)
    getRecommendationHistory(userId).then((data) => {
      if (!cancelled) setHistory(data)
    }).catch((error: unknown) => {
      if (!cancelled) setHistoryError(error instanceof Error ? error.message : 'Recommendation history could not be loaded.')
    }).finally(() => {
      if (!cancelled) setHistoryLoading(false)
    })
    return () => { cancelled = true }
  }, [historyRetry, userId])

  const recentHistory = useMemo(
    () => [...(history?.history ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10),
    [history],
  )

  const cardOptions = useMemo(() => {
    const cards = new Map<number, string>()
    if (currentCard?.isRealCard) cards.set(currentCard.id, currentCard.title)
    for (const item of history?.history ?? []) {
      if (!cards.has(item.card_id)) cards.set(item.card_id, `Card #${item.card_id}`)
    }
    if (recruiterReturn && !cards.has(recruiterReturn.cardId)) {
      cards.set(recruiterReturn.cardId, `Card #${recruiterReturn.cardId}`)
    }
    return [...cards.entries()].map(([id, title]) => ({ id, title }))
  }, [currentCard, history, recruiterReturn])

  useEffect(() => {
    if (cardOptions.length === 0) {
      setSelectedCardId(null)
      return
    }
    setSelectedCardId((selected) => selected && cardOptions.some((card) => card.id === selected)
      ? selected
      : cardOptions[0].id)
  }, [cardOptions])

  useEffect(() => {
    if (!userId || !selectedCardId) {
      setPrediction(null)
      setPredictionError(null)
      setPredictionLoading(false)
      return
    }
    let cancelled = false
    setPrediction(null)
    setPredictionLoading(true)
    setPredictionError(null)
    getMlPrediction(userId, selectedCardId).then((data) => {
      if (!cancelled) setPrediction(data)
    }).catch((error: unknown) => {
      if (!cancelled) setPredictionError(error instanceof Error ? error.message : 'ML prediction could not be loaded.')
    }).finally(() => {
      if (!cancelled) setPredictionLoading(false)
    })
    return () => { cancelled = true }
  }, [predictionRetry, selectedCardId, userId])

  useEffect(() => {
    if (!userId || !selectedCardId) {
      setBeforeSnapshot(null)
      setBeforeError(null)
      setBeforeLoading(false)
      return
    }

    if (beforeSnapshot?.user_id === userId && beforeSnapshot.card_id === selectedCardId) return

    let cancelled = false
    setBeforeSnapshot(null)
    setAfterSnapshot(null)
    setBeforeLoading(true)
    setBeforeError(null)
    setAfterError(null)
    getAdaptationSnapshot(userId, selectedCardId).then((snapshot) => {
      if (!cancelled) setBeforeSnapshot(snapshot)
    }).catch((error: unknown) => {
      if (!cancelled) setBeforeError(error instanceof Error ? error.message : 'Before snapshot could not be loaded.')
    }).finally(() => {
      if (!cancelled) setBeforeLoading(false)
    })
    return () => { cancelled = true }
  }, [beforeRetry, beforeSnapshot, selectedCardId, userId])

  const selectedDecision: RecommendationHistoryItem | undefined = [...(history?.history ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .find((item) => item.card_id === selectedCardId)
  const titles = new Map(cardOptions.map((card) => [card.id, card.title]))

  const selectCard = (cardId: number) => {
    setSelectedCardId(cardId)
    setBeforeSnapshot(null)
    setAfterSnapshot(null)
    setBeforeError(null)
    setAfterError(null)
  }

  const openSelectedCard = () => {
    if (!userId || !selectedCardId || !beforeSnapshot) return
    navigate(`/activity/${selectedCardId}`, {
      state: {
        recruiterReturn: {
          userId,
          cardId: selectedCardId,
          beforeSnapshot,
        } satisfies RecruiterReturnState,
      },
    })
  }

  const captureAfter = async () => {
    if (!userId || !selectedCardId || !beforeSnapshot) return
    setAfterLoading(true)
    setAfterError(null)
    try {
      const snapshot = await getAdaptationSnapshot(userId, selectedCardId)
      setAfterSnapshot(snapshot)
    } catch (error) {
      setAfterError(error instanceof Error ? error.message : 'After snapshot could not be loaded.')
    } finally {
      setAfterLoading(false)
    }
  }

  const changedStatements = beforeSnapshot && afterSnapshot
    ? comparisonMetrics.flatMap(([label, key, format]) => {
      const before = metricValue(beforeSnapshot, key)
      const after = metricValue(afterSnapshot, key)
      if (key === 'rank') {
        if (before === null || after === null) return []
        if (before === after) return [`Rank did not change (${before}).`]
        return [`Rank changed from ${before} to ${after}.`]
      }
      if (before === null || after === null) return []
      if (before === after) {
        return key === 'completion_probability'
          ? ['ML completion probability did not change.']
          : [`${label} did not change (${formatSnapshotMetric(before, format)}).`]
      }
      if (key === 'completion_probability') {
        return [`ML completion probability changed from ${formatSnapshotMetric(before, format)} to ${formatSnapshotMetric(after, format)}.`]
      }
      if (key === 'attempt_count') return [`Attempt count changed from ${before} to ${after}.`]
      return [`${label} changed from ${formatSnapshotMetric(before, format)} to ${formatSnapshotMetric(after, format)}.`]
    })
    : []

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
      <header className="mb-7 rounded-[24px] border-[3px] border-black bg-[#FFD700] p-5 shadow-[6px_6px_0_#111] sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em]">Vinayoki</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight sm:text-5xl">ML / Recruiter View</h1>
        <p className="mt-2 max-w-2xl text-sm font-bold sm:text-base">How attention becomes an adaptive recommendation</p>
      </header>

      {!userId ? (
        <div role="status" className="rounded-[22px] border-[3px] border-black bg-[#C0F7FE] p-5 font-bold shadow-[5px_5px_0_#111]">No learner is selected. Complete onboarding or log in to view this demo.</div>
      ) : <>
        <div className="mb-5 flex flex-col gap-3 rounded-[18px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#111] sm:flex-row sm:items-center sm:justify-between">
          <label htmlFor="recruiter-card" className="text-sm font-black uppercase">Selected real card</label>
          {cardOptions.length ? <select id="recruiter-card" value={selectedCardId ?? ''} onChange={(event) => selectCard(Number(event.target.value))} className="min-w-0 rounded-xl border-[3px] border-black bg-[#C0F7FE] px-3 py-2 text-sm font-bold sm:max-w-md">
            {cardOptions.map((card) => <option key={card.id} value={card.id}>{card.title} · #{card.id}</option>)}
          </select> : <p className="text-sm font-semibold">No card is available in the current card context or recommendation history. Visit the learner feed to create a real selection.</p>}
        </div>

        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          <Panel title="Current Learner State" className="bg-[#C0F7FE]">
            <p className="-mt-2 mb-4 text-xs font-bold">Signals currently stored for this learner.</p>
            {learnerLoading ? <p role="status" className="font-bold">Loading learner state…</p> : null}
            {learnerError ? <div role="alert" className="text-sm font-bold">Learner state unavailable. {learnerError}<Retry onClick={() => setLearnerRetry((n) => n + 1)} /></div> : null}
            {learner ? <>
              <p className="mb-3 text-xl font-black">{learner.profile.name}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {([['Goal', learner.profile.goal], ['Level', learner.profile.level], ['Learning style', learner.profile.learning_style], ['Average mastery', percent(learner.metrics.average_mastery)], ['Average accuracy', percent(learner.metrics.average_accuracy)], ['Average build score', percent(learner.metrics.average_build_score)], ['Cards attempted', learner.metrics.cards_attempted], ['Cards completed', learner.metrics.cards_completed], ['Total attempts', learner.metrics.total_attempts]] as const).map(([label, value]) => <div key={label} className="rounded-xl border-2 border-black bg-white p-3"><p className="text-[10px] font-black uppercase">{label}</p><p className="break-words font-bold">{value}</p></div>)}
              </div>
              <h3 className="mb-2 mt-5 text-sm font-black uppercase">Stored skill signals</h3>
              {learner.skills.length ? <div className="space-y-2">{learner.skills.map((skill) => <div key={skill.skill} className="rounded-xl border-2 border-black bg-white p-3"><p className="font-black">{skill.skill}</p><div className="mt-1 grid grid-cols-2 gap-x-2 text-xs font-semibold sm:grid-cols-4"><span>Interest {percent(skill.interest_score)}</span><span>Skill {percent(skill.skill_score)}</span><span>Completion {percent(skill.completion_rate)}</span><span>Skip {percent(skill.skip_rate)}</span></div></div>)}</div> : <p className="text-sm font-semibold">No stored skill records.</p>}
            </> : null}
          </Panel>

          <Panel title="ML Prediction" className="bg-[#FFB4A8]">
            {predictionLoading ? <p role="status" className="font-bold">Loading actual model prediction…</p> : null}
            {predictionError ? <div role="alert" className="text-sm font-bold">ML prediction unavailable. {predictionError}<Retry onClick={() => setPredictionRetry((n) => n + 1)} /></div> : null}
            {prediction ? <>
              <div className="rounded-[18px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#111]">
                <p className="text-xs font-black uppercase">Logistic Regression</p>
                <p className="mt-1 text-sm font-bold">Pipeline: StandardScaler → Logistic Regression · Model inputs: {prediction.model.feature_count}</p>
                <p className="mt-4 text-4xl font-black sm:text-5xl">{percent(prediction.prediction.completion_probability)}</p>
                <p className="mt-1 text-xs font-bold">Predicted probability that this learner completes the selected card.</p>
              </div>
            </> : !predictionLoading && !predictionError ? <p className="text-sm font-semibold">Select a card from available real card records.</p> : null}
          </Panel>

          <Panel title="Model Inputs">
            {prediction ? <div className="grid gap-4 sm:grid-cols-2">{modelFeatureGroups.map((group) => <div key={group.title} className="rounded-xl border-2 border-black bg-[#FFF8E8] p-3"><h3 className="mb-2 text-xs font-black uppercase">{group.title}</h3><dl className="space-y-2">{group.features.map(([key, label]) => <div key={key} className="flex items-start justify-between gap-3 border-b border-black/20 pb-1 text-xs"><dt className="font-semibold">{label}</dt><dd className="max-w-[45%] break-all text-right font-black">{valueText(prediction.features.model_features[key])}</dd></div>)}</dl></div>)}</div> : <p className="text-sm font-semibold">Model inputs will appear after a card prediction loads.</p>}
          </Panel>

          <Panel title="Adaptive Learner State" className="bg-[#D7F7B5]">
            <p className="mb-3 text-xs font-bold">These signals are produced by the learning-progress system. The current Logistic Regression artifact does not directly consume these five values.</p>
            {prediction ? <dl className="grid grid-cols-2 gap-2">{([['mastery_score', 'Mastery score'], ['accuracy_score', 'Accuracy score'], ['time_efficiency', 'Time efficiency'], ['build_score', 'Build score'], ['attempt_count', 'Attempt count']] as Array<[keyof AdaptiveLearnerFeatures, string]>).map(([key, label]) => <div key={key} className="rounded-xl border-2 border-black bg-white p-3"><dt className="text-[10px] font-black uppercase">{label}</dt><dd className="font-bold">{valueText(prediction.features.adaptive_features[key])}</dd></div>)}</dl> : <p className="text-sm font-semibold">Adaptive values will appear with the selected card prediction.</p>}
          </Panel>

          <Panel title="Recommendation Decision" className="bg-[#FFD700]">
            <p className="mb-3 text-xs font-semibold">The ML model predicts completion probability. Vinayoki then combines this prediction with learner and content signals to rank recommendations.</p>
            {selectedDecision ? <dl className="grid grid-cols-2 gap-2">{[['Recommendation score', selectedDecision.final_score], ['Rank', selectedDecision.rank], ['ML completion probability', selectedDecision.completion_probability], ['Performance score', selectedDecision.performance_score], ['Interest score', selectedDecision.interest_score], ['Skill fit score', selectedDecision.skill_fit_score], ['Progress score', selectedDecision.progress_score], ['Preference score', selectedDecision.preference_score]].map(([label, value]) => <div key={label} className="rounded-xl border-2 border-black bg-white p-3"><dt className="text-[10px] font-black uppercase">{label}</dt><dd className="font-black">{label === 'Rank' ? value : scoreText(Number(value))}</dd></div>)}</dl> : <p className="text-sm font-semibold">No recommendation-history decision is available for this selected card.</p>}
          </Panel>

          <Panel title="Why This Recommendation">
            {selectedDecision ? <p className="text-sm font-semibold">The stored history row records this card’s ranked decision and component scores. Values shown here come directly from that record; this dashboard does not recalculate the recommendation score.</p> : <p className="text-sm font-semibold">A stored recommendation decision will appear when history contains this card.</p>}
          </Panel>

          <Panel title="Adaptation Loop" className="bg-[#C0F7FE] lg:col-span-2">
            {!selectedCardId ? <p className="text-sm font-bold">Select a card to load a BEFORE INTERACTION snapshot.</p> : null}
            {selectedCardId && beforeLoading ? <p role="status" className="text-sm font-bold">Loading before snapshot…</p> : null}
            {beforeError ? <div role="alert" className="text-sm font-bold">Before snapshot unavailable. {beforeError}<Retry onClick={() => setBeforeRetry((current) => current + 1)} /></div> : null}

            {beforeSnapshot && beforeSnapshot.card_id === selectedCardId ? <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[18px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#111]">
                <h3 className="mb-3 text-sm font-black uppercase">Before Interaction</h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Mastery', beforeSnapshot.learner_state.mastery_score.toFixed(2)],
                    ['Accuracy', beforeSnapshot.learner_state.accuracy_score.toFixed(2)],
                    ['Build score', beforeSnapshot.learner_state.build_score.toFixed(2)],
                    ['Time efficiency', beforeSnapshot.learner_state.time_efficiency.toFixed(2)],
                    ['Attempts', String(beforeSnapshot.learner_state.attempt_count)],
                    ['ML completion probability', percent(beforeSnapshot.ml.completion_probability)],
                    ['Recommendation score', beforeSnapshot.recommendation.recommendation_score === null ? '—' : percent(beforeSnapshot.recommendation.recommendation_score)],
                    ['Rank', beforeSnapshot.recommendation.rank === null ? '—' : String(beforeSnapshot.recommendation.rank)],
                  ].map(([label, value]) => <div key={label} className="rounded-lg border-2 border-black bg-[#FFF8E8] p-2"><dt className="text-[10px] font-black uppercase">{label}</dt><dd className="font-bold">{value}</dd></div>)}
                </dl>
                <button type="button" onClick={openSelectedCard} className="mt-4 w-full rounded-xl border-[3px] border-black bg-[#FFD700] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#111]">Open Learning Card</button>
              </div>

              <div className="rounded-[18px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#111]">
                <h3 className="mb-3 text-sm font-black uppercase">After Interaction</h3>
                {afterSnapshot ? <>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      ['Mastery', afterSnapshot.learner_state.mastery_score.toFixed(2)],
                      ['Accuracy', afterSnapshot.learner_state.accuracy_score.toFixed(2)],
                      ['Build score', afterSnapshot.learner_state.build_score.toFixed(2)],
                      ['Time efficiency', afterSnapshot.learner_state.time_efficiency.toFixed(2)],
                      ['Attempts', String(afterSnapshot.learner_state.attempt_count)],
                      ['ML completion probability', percent(afterSnapshot.ml.completion_probability)],
                      ['Recommendation score', afterSnapshot.recommendation.recommendation_score === null ? '—' : percent(afterSnapshot.recommendation.recommendation_score)],
                      ['Rank', afterSnapshot.recommendation.rank === null ? '—' : String(afterSnapshot.recommendation.rank)],
                    ].map(([label, value]) => <div key={label} className="rounded-lg border-2 border-black bg-[#D7F7B5] p-2"><dt className="text-[10px] font-black uppercase">{label}</dt><dd className="font-bold">{value}</dd></div>)}
                  </dl>
                </> : <p className="rounded-xl border-2 border-dashed border-black bg-[#FFF8E8] p-4 text-sm font-semibold">{afterError ? `After snapshot unavailable. ${afterError}` : 'Waiting for a new interaction. Return here after using the real learning card, then capture the updated state.'}</p>}
                {afterError ? <Retry onClick={captureAfter} /> : null}
                <button type="button" onClick={captureAfter} disabled={afterLoading || !beforeSnapshot} className="mt-4 w-full rounded-xl border-[3px] border-black bg-[#00FF7F] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#111] disabled:cursor-not-allowed disabled:opacity-50">{afterLoading ? 'Capturing…' : 'Capture After State'}</button>
              </div>

              {afterSnapshot ? <div className="overflow-x-auto rounded-[18px] border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_#111] md:col-span-2 sm:p-4">
                <h3 className="mb-3 text-sm font-black uppercase">Adaptation Result</h3>
                <table className="w-full min-w-[540px] border-collapse text-left text-xs sm:text-sm"><thead><tr className="border-b-[3px] border-black">{['Metric', 'Before', 'After', 'Change'].map((heading) => <th key={heading} className="px-2 py-2 font-black uppercase">{heading}</th>)}</tr></thead>
                  <tbody>{comparisonMetrics.map(([label, key, format]) => {
                    const before = metricValue(beforeSnapshot, key)
                    const after = metricValue(afterSnapshot, key)
                    let change = '—'
                    if (before !== null && after !== null) {
                      if (key === 'rank') {
                        change = before === after ? 'No change' : `Changed (${before} → ${after})`
                      } else if (before === after) {
                        change = 'No change'
                      } else {
                        change = formatDelta(after - before, format)
                      }
                    }
                    return <tr key={key} className="border-b border-black/20"><td className="px-2 py-2 font-bold">{label}</td><td className="px-2 py-2">{formatSnapshotMetric(before, format)}</td><td className="px-2 py-2">{formatSnapshotMetric(after, format)}</td><td className="px-2 py-2 font-black">{change}</td></tr>
                  })}</tbody>
                </table>
                <div className="mt-4 rounded-xl border-2 border-black bg-[#FFF8E8] p-3">
                  <h4 className="text-xs font-black uppercase">What Changed?</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm font-semibold">{changedStatements.length ? changedStatements.map((statement) => <li key={statement}>{statement}</li>) : <li>No comparable value changes were returned.</li>}</ul>
                </div>
              </div> : null}
            </div> : null}

            <p className="mt-4 rounded-xl border-2 border-black bg-[#FFE1DC] p-3 text-xs font-semibold">Current model note: The deployed completion model currently uses 8 stored features. Interaction-level adaptive signals such as mastery and build score are currently used by the recommendation layer but are not direct inputs to this model artifact. Therefore an interaction may change the recommendation score without changing the ML completion probability.</p>
          </Panel>

          <Panel title="Feature → Prediction Pipeline">
            <ol className="grid gap-2 text-center text-xs font-black uppercase sm:grid-cols-3">{['Learner + Content Features', 'StandardScaler', 'Logistic Regression', 'Completion Probability', 'Recommendation Layer', 'Ranked Feed'].map((label, index) => <li key={label} className="rounded-xl border-2 border-black bg-[#FFF8E8] p-3">{index + 1}. {label}</li>)}</ol>
          </Panel>

          <Panel title="Recommendation History" className="lg:col-span-2">
            {historyLoading ? <p role="status" className="font-bold">Loading recommendation history…</p> : null}
            {historyError ? <div role="alert" className="text-sm font-bold">History unavailable. {historyError}<Retry onClick={() => setHistoryRetry((n) => n + 1)} /></div> : null}
            {history && !historyError ? <>
              <p className="mb-3 text-xs font-semibold">Showing up to 10 most recent records, not the complete history.</p>
              {recentHistory.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] border-collapse text-left text-xs"><thead><tr className="border-b-[3px] border-black">{['Time', 'Card', 'Rank', 'Completion probability', 'Recommendation score'].map((heading) => <th key={heading} className="px-2 py-2 font-black uppercase">{heading}</th>)}</tr></thead><tbody>{recentHistory.map((item) => <tr key={item.id} className="border-b border-black/20"><td className="px-2 py-2">{timeText(item.created_at)}</td><td className="px-2 py-2 font-bold">{titles.get(item.card_id) ?? `Card #${item.card_id}`}</td><td className="px-2 py-2">{item.rank}</td><td className="px-2 py-2">{percent(item.completion_probability)}</td><td className="px-2 py-2">{scoreText(item.final_score)}</td></tr>)}</tbody></table></div> : <p className="text-sm font-semibold">No recommendation records are available.</p>}
            </> : null}
          </Panel>

          <Panel title="Model Notes" className="bg-[#FFE1DC] lg:col-span-2">
            <ul className="space-y-2 text-sm font-semibold">
              <li>Current artifact: StandardScaler + Logistic Regression.</li>
              <li>Input features in deployed artifact: {prediction?.model.feature_count ?? '8'}.</li>
              <li>Adaptive features generated: {prediction ? Object.keys(prediction.features.adaptive_features).length : '5'}.</li>
              <li>The current model artifact does not directly consume the five adaptive features.</li>
              <li>Training metadata currently contains a 13-feature list, while the deployed model artifact uses 8 inference features.</li>
            </ul>
          </Panel>
        </div>
      </>}
    </main>
  )
}
