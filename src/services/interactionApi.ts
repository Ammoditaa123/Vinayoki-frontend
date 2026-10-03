/**
 * interactionApi.ts — Low-level interaction API calls.
 *
 * UI components should use cardService.submitStepInteraction(), NOT this file.
 * This file is called by cardService.ts internally.
 */

import api from './api'
import type { CardInteractionPayload, CardInteractionResult, EngagementState, LegacyInteraction, LegacyInteractionResult } from '../types'

const pendingEngagementRequests = new Map<number, Promise<EngagementState>>()

/** OLD backend: POST /interactions/ */
export const sendInteraction = async (payload: LegacyInteraction) => {
  const response = await api.post<LegacyInteractionResult>('/interactions/', payload)
  return response.data
}

/** NEW backend: POST /card-interactions/ */
export const postCardInteraction = async (
  payload: CardInteractionPayload,
): Promise<CardInteractionResult> => {
  const response = await api.post<CardInteractionResult>('/card-interactions/', payload)
  return response.data
}

/** Both backends: GET /engagement/{userId} */
export const getEngagement = async (userId: number) => {
  const pendingRequest = pendingEngagementRequests.get(userId)
  if (pendingRequest) return pendingRequest

  const request = api
    .get<EngagementState>(`/engagement/${userId}`)
    .then((response) => response.data)
    .finally(() => {
      pendingEngagementRequests.delete(userId)
    })

  pendingEngagementRequests.set(userId, request)
  return request
}
