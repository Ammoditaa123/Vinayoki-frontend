import api from './api'

export interface MlModelFeatures {
  user_interest: number
  skill_level: number
  content_difficulty: number
  content_topic_match: number
  previous_completion_rate: number
  previous_skip_rate: number
  difficulty_gap: number
  progress_value: number
}

export interface AdaptiveLearnerFeatures {
  mastery_score: number
  accuracy_score: number
  time_efficiency: number
  build_score: number
  attempt_count: number
}

export interface MlFeatures {
  model_features: MlModelFeatures
  adaptive_features: AdaptiveLearnerFeatures
}

export interface MlPrediction {
  completion_probability: number
}

export interface MlModelMetadata {
  type: string
  feature_count: number
  feature_names: string[]
}

export interface MlPredictionResponse {
  user_id: number
  card_id: number
  features: MlFeatures
  prediction: MlPrediction
  model: MlModelMetadata
}

const pendingRequests = new Map<string, Promise<MlPredictionResponse>>()

export function getMlPrediction(userId: number, cardId: number): Promise<MlPredictionResponse> {
  const key = `${userId}:${cardId}`
  const pendingRequest = pendingRequests.get(key)
  if (pendingRequest) return pendingRequest

  const request = api
    .get<MlPredictionResponse>(`/ml/prediction/${userId}/${cardId}`)
    .then((response) => response.data)
    .finally(() => pendingRequests.delete(key))

  pendingRequests.set(key, request)
  return request
}
