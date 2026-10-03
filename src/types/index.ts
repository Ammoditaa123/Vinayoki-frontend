// =============================================================
// NORMALIZED FRONTEND TYPES — UI works with these exclusively
// cardService.ts adapts both backends into these types
// =============================================================

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type LearningStyle = 'Watch' | 'Solve' | 'Build' | 'Explore'
export type StepType = 'watch' | 'solve' | 'build'
export type BackendMode = 'cards' | 'activities'

// Which backend API is currently serving requests
export interface BackendCapabilities {
  mode: BackendMode
  /** true when /cards/feed/ is available */
  hasCardFeed: boolean
  /** true when /card-interactions/ is available */
  hasCardInteractions: boolean
}

// ---------------------------------------------------------------
// USER
// ---------------------------------------------------------------

export interface User {
  id: number | null
  name: string
  goal: string
  level?: string
  learning_style?: string
  created_at?: string
}

export interface UserStats {
  user_id: number
  total_time: number
  learning_time: number
  passive_time: number
  cards_completed: number
  steps_completed: number
}

export interface OnboardingData {
  name: string
  goal: string
  skillLevel: SkillLevel
  learningStyle: LearningStyle
}

// ---------------------------------------------------------------
// CARD PROGRESS (from new backend)
// ---------------------------------------------------------------

export interface StepProgress {
  completed: boolean
  correct: boolean | null
  build_score: number | null
  time_spent: number
  attempt_count: number
  completed_at?: string | null
}

export interface CardProgress {
  started_at: string | null
  completed_at: string | null
  watch_completed: boolean
  solve_completed: boolean
  build_completed: boolean
  correct_answers: number
  total_questions: number
  build_score: number
  time_spent: number
  ideal_time: number
  comprehension_score: number
  mastery_score: number
  needs_revision: boolean
  attempt_count: number
}

// ---------------------------------------------------------------
// NORMALIZED STEP — rendered by WatchStep/SolveStep/BuildStep
// ---------------------------------------------------------------

export interface NormalizedStep {
  id: number
  order: number
  type: StepType
  title: string
  /** textual explanation content (watch steps) */
  content: string | null
  /** question text (solve steps) */
  question: string | null
  /** parsed string[] — comes as JSON string from backend */
  options: string[]
  /** correct answer (solve steps) */
  answer: string | null
  /** starting code for build steps */
  starter_code: string | null
  /** expected output hint for build steps */
  expected_output: string | null
  /** estimated seconds for this step */
  duration: number
  /** current progress for this step (may be null if not started) */
  progress: StepProgress | null
}

// ---------------------------------------------------------------
// NORMALIZED LEARNING CARD — feed list item
// ---------------------------------------------------------------

export interface NormalizedLearningCard {
  id: number
  title: string
  subject: string
  topic: string
  concept: string
  skill: string
  difficulty: number
  /** estimated time in seconds */
  estimatedTime: number
  progressValue: number
  description: string
  /** opaque ML score 0–1, used only for UX label generation */
  recommendationScore: number
  /** internal ML signal — never shown directly to users */
  completionProbability: number
  /** true when this came from the new /cards/ endpoint */
  isRealCard: boolean
  /** step type preview for the card journey (watch/solve/build) */
  stepTypes?: StepType[]
}

// ---------------------------------------------------------------
// NORMALIZED CARD DETAIL — opened card with steps + progress
// ---------------------------------------------------------------

export interface NormalizedCardDetail {
  card: NormalizedLearningCard
  steps: NormalizedStep[]
  progress: CardProgress | null
  /** index of first incomplete step (0 if no progress) */
  resumeFromStep: number
}

// ---------------------------------------------------------------
// CARD INTERACTION PAYLOADS
// ---------------------------------------------------------------

/** New backend: POST /card-interactions/ */
export interface CardInteractionPayload {
  user_id: number
  card_id: number
  step_id: number
  action: StepType
  time_spent: number
  correct?: boolean
  build_score?: number
}

/** Response from POST /card-interactions/ */
export interface CardInteractionResult {
  message: string
  card_id: number
  action: string
  progress: CardProgress
}

// ---------------------------------------------------------------
// ENGAGEMENT / INTERVENTION
// ---------------------------------------------------------------

export interface EngagementState {
  intervention: boolean
  recent_views: number
  meaningful_actions: number
}

// ---------------------------------------------------------------
// APP CONTEXT
// ---------------------------------------------------------------

export interface AppContextValue {
  user: User | null
  userId: number | null
  onboarding: OnboardingData
  /** Card selected from feed (new backend path) */
  currentCard: NormalizedLearningCard | null
  /** Legacy: activity selected (old backend path) */
  currentActivity: LegacyActivity | null
  backendMode: BackendMode | null
  setUser: (user: User | null) => void
  setUserId: (userId: number | null) => void
  setOnboardingData: (data: Partial<OnboardingData>) => void
  setCurrentCard: (card: NormalizedLearningCard | null) => void
  setCurrentActivity: (activity: LegacyActivity | null) => void
  setBackendMode: (mode: BackendMode | null) => void
}

// =============================================================
// LEGACY TYPES — kept for old /feed/{user_id} fallback path
// Do NOT use in new components — use Normalized* types above
// =============================================================

export type LegacyActivityType =
  | 'micro_lesson'
  | 'quiz'
  | 'simulation'
  | 'coding'
  | 'build'
  | 'career'

export type LegacyInteractionAction = 'view' | 'skip' | 'answer' | 'complete' | 'build'

export interface LegacyActivity {
  id: number
  title: string
  topic: string
  skill: string
  type: LegacyActivityType
  difficulty: number
  duration: number
  description: string
  question?: string
  options?: string[] | string
  answer?: string
  progress_value: number
  recommendation_score?: number
  completion_probability?: number
  why_this?: string[]
}

export interface LegacyFeedResponse {
  user_id: number
  count: number
  activities: LegacyActivity[]
}

export interface LegacyInteraction {
  user_id: number
  content_id: number
  action: LegacyInteractionAction
  time_spent?: number
  completed?: boolean
  correct?: boolean
  idempotency_key: string
}

export interface LegacyInteractionResult {
  id: number
  action: LegacyInteractionAction
  correct: boolean | null
  completed: boolean
  progress_earned: number
  timestamp: string
}

// Backward compat aliases (used in existing hooks/components still referencing old names)
export type Activity = LegacyActivity
export type ActivityType = LegacyActivityType
export type InteractionAction = LegacyInteractionAction
export type Interaction = LegacyInteraction
export type InteractionResult = LegacyInteractionResult
export type FeedResponse = LegacyFeedResponse

// Legacy types that are no longer needed but kept for compilation compat
export type GoalType = string

export interface SkillState {
  name: string
  score: number
  label: string
  interest?: number
  completionRate?: number
  skipRate?: number
}

export interface ProgressState {
  progress: number
  meaningfulActions: number
  activitiesCompleted: number
  skillsImproved: number
  artifacts: number
}
