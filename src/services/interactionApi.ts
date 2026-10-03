import api from './api'
import type { EngagementState, Interaction, InteractionResult } from '../types'

const pendingEngagementRequests = new Map<number, Promise<EngagementState>>()

export const sendInteraction = async (payload: Interaction) => {
  const response = await api.post<InteractionResult>('/interactions/', payload)
  return response.data
}

export const getEngagement = async (userId: number) => {
  const pendingRequest = pendingEngagementRequests.get(userId)
  if (pendingRequest) return pendingRequest

  const request = api.get<EngagementState>(`/engagement/${userId}`)
    .then((response) => response.data)
    .finally(() => {
      pendingEngagementRequests.delete(userId)
    })

  pendingEngagementRequests.set(userId, request)
  return request
}
