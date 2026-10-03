import api from './api'

export interface LearnerProfile {
  name: string
  goal: string
  level: string
  learning_style: string
}

export interface LearnerSkill {
  skill: string
  interest_score: number
  skill_score: number
  completion_rate: number
  skip_rate: number
}

export interface LearnerMetrics {
  cards_attempted: number
  cards_completed: number
  average_mastery: number
  average_accuracy: number
  average_build_score: number
  total_attempts: number
}

export interface LearnerState {
  user_id: number
  profile: LearnerProfile
  skills: LearnerSkill[]
  metrics: LearnerMetrics
}

const pendingRequests = new Map<number, Promise<LearnerState>>()

export function getLearnerState(userId: number): Promise<LearnerState> {
  const pendingRequest = pendingRequests.get(userId)
  if (pendingRequest) return pendingRequest

  const request = api
    .get<LearnerState>(`/learner-state/${userId}`)
    .then((response) => response.data)
    .finally(() => {
      pendingRequests.delete(userId)
    })

  pendingRequests.set(userId, request)
  return request
}
