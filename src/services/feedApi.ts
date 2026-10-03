/**
 * feedApi.ts — Low-level feed API calls.
 *
 * UI components should use cardService.ts, NOT this file directly.
 * This file is called by cardService.ts internally.
 */

import api from './api'
import type { LegacyFeedResponse, NormalizedLearningCard } from '../types'

interface RawCardFeedResponse {
  user_id: number
  count: number
  cards: NormalizedLearningCard[]
}

/** OLD backend: GET /feed/{userId} */
export const getFeed = async (userId: number) => {
  const response = await api.get<LegacyFeedResponse | { error: string }>(`/feed/${userId}`)
  if (!('activities' in response.data) || !Array.isArray(response.data.activities)) {
    throw new Error(
      'error' in response.data
        ? response.data.error
        : 'The learning engine returned an invalid feed.',
    )
  }
  return response.data
}

/** NEW backend: GET /cards/feed/{userId} */
export const getCardFeed = async (userId: number) => {
  const response = await api.get<RawCardFeedResponse>(`/cards/feed/${userId}`)
  if (!Array.isArray(response.data.cards)) {
    throw new Error('The learning engine returned an invalid card feed.')
  }
  return response.data
}

/** Alias kept for backward compat with existing hooks */
export const getPersonalizedFeed = getFeed

/** Catalog (old backend only — used by Activity.tsx legacy fallback) */
export const getActivityCatalog = async () => {
  const response = await api.get<{ count: number; activities: LegacyFeedResponse['activities'] }>('/feed/')
  if (!Array.isArray(response.data.activities)) {
    throw new Error('The learning engine returned an invalid activity catalog.')
  }
  return response.data.activities
}
