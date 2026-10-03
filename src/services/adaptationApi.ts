import api from './api'

export interface AdaptationLearnerState {
  mastery_score: number
  accuracy_score: number
  build_score: number
  time_efficiency: number
  attempt_count: number
}

export interface AdaptationMlState {
  completion_probability: number
}

export interface AdaptationRecommendationState {
  recommendation_score: number | null
  rank: number | null
}

export interface AdaptationSnapshot {
  user_id: number
  card_id: number
  learner_state: AdaptationLearnerState
  ml: AdaptationMlState
  recommendation: AdaptationRecommendationState
}

const pendingRequests = new Map<string, Promise<AdaptationSnapshot>>()

export function getAdaptationSnapshot(userId: number, cardId: number): Promise<AdaptationSnapshot> {
  const key = `${userId}:${cardId}`
  const pendingRequest = pendingRequests.get(key)
  if (pendingRequest) return pendingRequest

  const request = api
    .get<AdaptationSnapshot>(`/adaptation/${userId}/${cardId}`)
    .then((response) => response.data)
    .finally(() => pendingRequests.delete(key))

  pendingRequests.set(key, request)
  return request
}
