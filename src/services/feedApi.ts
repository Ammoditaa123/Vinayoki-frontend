import api from './api'
import type { Activity, FeedResponse } from '../types'

interface ContentCatalogResponse {
  count: number
  activities: Activity[]
}

export const getFeed = async (userId: number) => {
  const response = await api.get<FeedResponse | { error: string }>(`/feed/${userId}`)
  if (!('activities' in response.data) || !Array.isArray(response.data.activities)) {
    throw new Error('error' in response.data ? response.data.error : 'The learning engine returned an invalid feed.')
  }

  return response.data
}

export const getActivityCatalog = async () => {
  const response = await api.get<ContentCatalogResponse>('/feed/')
  if (!Array.isArray(response.data.activities)) {
    throw new Error('The learning engine returned an invalid activity catalog.')
  }

  return response.data.activities
}

export const getPersonalizedFeed = getFeed
