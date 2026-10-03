export type ActivityType =
  | 'micro_lesson'
  | 'quiz'
  | 'simulation'
  | 'coding'
  | 'build'
  | 'career'

export type GoalType =
  | 'Cybersecurity'
  | 'Python'
  | 'Web Development'
  | 'AI / ML'
  | 'DSA'
  | 'Career Skills'
  | 'Explore'

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type LearningStyle = 'Watch' | 'Solve' | 'Build' | 'Explore'
export type InteractionAction = 'view' | 'skip' | 'answer' | 'complete' | 'build'

export interface User {
  id: number | null
  name: string
  goal: GoalType | string
  skillLevel?: SkillLevel
  learningStyle?: LearningStyle
  level?: string
  learning_style?: string
  created_at?: string
}

export interface OnboardingData {
  goal: GoalType | string
  skillLevel: SkillLevel
  learningStyle: LearningStyle
}

export interface Activity {
  id: number
  title: string
  topic: string
  skill: string
  type: ActivityType
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

export interface FeedResponse {
  user_id: number
  count: number
  activities: Activity[]
}

export interface Interaction {
  user_id: number
  content_id: number
  action: InteractionAction
  time_spent?: number
  completed?: boolean
  correct?: boolean
  idempotency_key: string
}

export interface InteractionResult {
  id: number
  action: InteractionAction
  correct: boolean | null
  completed: boolean
  progress_earned: number
  timestamp: string
}

export interface EngagementState {
  intervention: boolean
  recent_views: number
  meaningful_actions: number
}

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

export interface AppContextValue {
  user: User | null
  userId: number | null
  onboarding: OnboardingData
  currentActivity: Activity | null
  progressState: ProgressState
  setUser: (user: User | null) => void
  setUserId: (userId: number | null) => void
  setOnboardingData: (data: Partial<OnboardingData>) => void
  setCurrentActivity: (activity: Activity | null) => void
  setProgressState: (state: ProgressState | ((prev: ProgressState) => ProgressState)) => void
}
