import api from './api'

export interface RecommendationHistoryItem {
  id: number
  card_id: number
  feed_session_id: string
  rank: number
  completion_probability: number
  performance_score: number
  interest_score: number
  skill_fit_score: number
  progress_score: number
  preference_score: number
  final_score: number
  created_at: string
}

export interface RecommendationHistoryResponse {
  user_id: number
  count: number
  history: RecommendationHistoryItem[]
}

const pendingRequests = new Map<number, Promise<RecommendationHistoryResponse>>()

export function getRecommendationHistory(
  userId: number,
): Promise<RecommendationHistoryResponse> {
  const pendingRequest = pendingRequests.get(userId)
  if (pendingRequest) return pendingRequest

  const request = api
    .get<RecommendationHistoryResponse>(`/recommendations/history/${userId}`)
    .then((response) => response.data)
    .finally(() => {
      pendingRequests.delete(userId)
    })

  pendingRequests.set(userId, request)
  return request
}
