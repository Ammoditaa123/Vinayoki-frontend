/**
 * cardService.ts — The single source of truth for learning content.
 *
 * This adapter exposes a clean API to UI components. Internally it detects
 * which backend version is running and routes calls accordingly.
 *
 * NEW backend (local / future Render):
 *   GET  /cards/feed/{userId}
 *   GET  /cards/{cardId}?user_id={userId}
 *   POST /card-interactions/
 *
 * OLD backend (current Render):
 *   GET  /feed/{userId}          → activities[]
 *   POST /interactions/
 *
 * UI components NEVER import from feedApi or interactionApi directly.
 * They only call functions exported from this file.
 *
 * MIGRATION: When the new backend is fully deployed, only this file changes.
 */

import api from './api'
import type {
  BackendCapabilities,
  BackendMode,
  CardInteractionPayload,
  CardInteractionResult,
  CardProgress,
  LegacyActivity,
  LegacyFeedResponse,
  NormalizedCardDetail,
  NormalizedLearningCard,
  NormalizedStep,
  StepProgress,
  StepType,
} from '../types'

// ---------------------------------------------------------------------------
// Backend capability detection from the real feed request, cached per session.
// ---------------------------------------------------------------------------

let cachedCapabilities: BackendCapabilities | null = null

interface RawCardFeedResponse {
  user_id: number
  count: number
  cards: RawCard[]
}

interface RawCard {
  id: number
  title: string
  subject: string
  topic: string
  concept: string
  skill: string
  difficulty: number
  ideal_time: number
  progress_value: number
  description: string
  recommendation_score: number
  completion_probability: number
}

interface RawStep {
  id: number
  order: number
  type: StepType
  title: string
  content: string | null
  question: string | null
  options: string | null
  answer: string | null
  starter_code: string | null
  expected_output: string | null
  duration: number
  progress: StepProgress | null
}

interface RawCardDetailResponse {
  card: RawCard
  progress: CardProgress | null
  steps: RawStep[]
}

function getCapabilities(): BackendCapabilities {
  // The card API is the default. getLearningFeed detects and caches a legacy
  // backend through its actual feed request, without a discarded probe.
  return cachedCapabilities ?? {
    mode: 'cards',
    hasCardFeed: true,
    hasCardInteractions: true,
  }
}

/** Reset the cached backend capabilities (useful for testing) */
export function resetBackendCapabilityCache(): void {
  cachedCapabilities = null
}

export async function getBackendMode(userId?: number): Promise<BackendMode> {
  void userId
  return getCapabilities().mode
}

// ---------------------------------------------------------------------------
// Option parsing (options come as JSON strings from backend)
// ---------------------------------------------------------------------------

function parseOptions(raw: string | string[] | null | undefined): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw

  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.every((o) => typeof o === 'string')
      ? (parsed as string[])
      : []
  } catch {
    return [raw]
  }
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

function normalizeCard(raw: RawCard, stepTypes?: StepType[]): NormalizedLearningCard {
  return {
    id: raw.id,
    title: raw.title,
    subject: raw.subject,
    topic: raw.topic,
    concept: raw.concept,
    skill: raw.skill,
    difficulty: raw.difficulty,
    estimatedTime: raw.ideal_time,
    progressValue: raw.progress_value,
    description: raw.description,
    recommendationScore: raw.recommendation_score,
    completionProbability: raw.completion_probability,
    isRealCard: true,
    stepTypes,
  }
}

function normalizeStep(raw: RawStep): NormalizedStep {
  return {
    id: raw.id,
    order: raw.order,
    type: raw.type,
    title: raw.title,
    content: raw.content,
    question: raw.question,
    options: parseOptions(raw.options),
    answer: raw.answer,
    starter_code: raw.starter_code,
    expected_output: raw.expected_output,
    duration: raw.duration,
    progress: raw.progress,
  }
}

function normalizeActivityAsCard(activity: LegacyActivity): NormalizedLearningCard {
  // Convert old Activity into NormalizedLearningCard for unified feed display.
  // isRealCard=false signals that the full step experience is unavailable.
  const hasQuestion = Boolean(activity.question)
  const stepTypes: StepType[] =
    activity.type === 'build'
      ? ['build']
      : activity.type === 'micro_lesson'
        ? ['watch']
        : hasQuestion
          ? ['watch', 'solve']
          : ['watch']

  return {
    id: activity.id,
    title: activity.title,
    subject: activity.topic,
    topic: activity.topic,
    concept: activity.skill,
    skill: activity.skill,
    difficulty: activity.difficulty,
    // Old API uses minutes, convert to seconds for consistency
    estimatedTime: activity.duration * 60,
    progressValue: activity.progress_value,
    description: activity.description,
    recommendationScore: activity.recommendation_score ?? 0.5,
    completionProbability: activity.completion_probability ?? 0.5,
    isRealCard: false,
    stepTypes,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the adaptive learning feed for a user.
 * Tries /cards/feed/{userId} first; falls back to /feed/{userId}.
 */
export async function getLearningFeed(userId: number): Promise<NormalizedLearningCard[]> {
  if (cachedCapabilities?.mode !== 'activities') {
    try {
      // This is the actual feed request; do not issue a separate capability probe.
      const response = await api.get<RawCardFeedResponse>(`/cards/feed/${userId}`)
      if (Array.isArray(response.data.cards)) {
        cachedCapabilities = { mode: 'cards', hasCardFeed: true, hasCardInteractions: true }
        return response.data.cards.map((card) => normalizeCard(card))
      }
    } catch {
      // The new endpoint is unavailable; fall through to the legacy feed.
    }
  }

  // Cache legacy mode after the real card-feed request fails or is unavailable.
  cachedCapabilities = { mode: 'activities', hasCardFeed: false, hasCardInteractions: false }
  const response = await api.get<LegacyFeedResponse>(`/feed/${userId}`)
  if (!('activities' in response.data) || !Array.isArray(response.data.activities)) {
    throw new Error('error' in response.data ? String((response.data as { error: string }).error) : 'The learning engine returned an invalid feed.')
  }
  return response.data.activities.map(normalizeActivityAsCard)
}

/**
 * Get full card detail with steps and progress.
 * Only available on the new backend — returns null if using old backend.
 */
export async function getLearningCardDetail(
  cardId: number,
  userId: number,
): Promise<NormalizedCardDetail | null> {
  const caps = getCapabilities()

  if (!caps.hasCardFeed) {
    return null
  }

  const response = await api.get<RawCardDetailResponse>(
    `/cards/${cardId}?user_id=${userId}`,
  )

  const { card: rawCard, steps: rawSteps, progress } = response.data

  const steps = rawSteps.map(normalizeStep)
  const stepTypes = steps.map((s) => s.type) as StepType[]

  // Find first incomplete step to resume from
  const resumeFromStep = steps.findIndex((s) => !s.progress?.completed)
  const resumeIndex = resumeFromStep === -1 ? steps.length - 1 : resumeFromStep

  return {
    card: normalizeCard(rawCard, stepTypes),
    steps,
    progress: progress ?? null,
    resumeFromStep: resumeIndex,
  }
}

/**
 * Submit a step interaction.
 * Routes to /card-interactions/ or /interactions/ based on backend mode.
 */
export async function submitStepInteraction(
  payload: CardInteractionPayload,
): Promise<CardInteractionResult> {
  const caps = getCapabilities()

  if (caps.hasCardInteractions) {
    const response = await api.post<CardInteractionResult>('/card-interactions/', payload)
    return response.data
  }

  // Fallback: old interactions endpoint
  // Map card interaction to legacy interaction format
  const legacyAction =
    payload.action === 'watch'
      ? 'complete'
      : payload.action === 'solve'
        ? 'answer'
        : 'build'

  const legacyPayload = {
    user_id: payload.user_id,
    content_id: payload.card_id,
    action: legacyAction,
    completed: true,
    correct: payload.correct,
    time_spent: payload.time_spent,
    idempotency_key: `vinayoki-${payload.card_id}-${payload.step_id}-${payload.action}-${Date.now()}`,
  }

  const response = await api.post('/interactions/', legacyPayload)

  // Construct a minimal CardInteractionResult from legacy response
  const legacyResult = response.data as { id?: number; progress_earned?: number; timestamp?: string }
  const syntheticProgress: CardProgress = {
    started_at: null,
    completed_at: null,
    watch_completed: payload.action === 'watch',
    solve_completed: payload.action === 'solve',
    build_completed: payload.action === 'build',
    correct_answers: payload.correct === true ? 1 : 0,
    total_questions: payload.action === 'solve' ? 1 : 0,
    build_score: payload.build_score ?? 0,
    time_spent: payload.time_spent,
    ideal_time: 0,
    comprehension_score: payload.correct === true ? 1.0 : 0.5,
    mastery_score: 0.5,
    needs_revision: false,
    attempt_count: 1,
  }

  return {
    message: 'Interaction recorded',
    card_id: payload.card_id,
    action: payload.action,
    progress: syntheticProgress,
  }
}
