import { useCallback, useEffect, useState } from 'react'
import { getEngagement } from '../services/interactionApi'
import { getFeed } from '../services/feedApi'
import type { Activity, EngagementState, FeedResponse } from '../types'

interface LearnerSnapshot {
  userId: number | null
  request: number
  activities: Activity[]
  engagement: EngagementState | null
  error: string | null
}

const initialSnapshot: LearnerSnapshot = {
  userId: null,
  request: -1,
  activities: [],
  engagement: null,
  error: null,
}

export function useLearnerSnapshot(userId: number | null) {
  const [snapshot, setSnapshot] = useState<LearnerSnapshot>(initialSnapshot)
  const [request, setRequest] = useState(0)

  const refetch = useCallback(() => {
    setRequest((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!userId) {
      return
    }

    let cancelled = false

    const loadSnapshot = async () => {
      try {
        const [feed, engagement]: [FeedResponse, EngagementState] = await Promise.all([
          getFeed(userId),
          getEngagement(userId),
        ])

        if (!cancelled) {
          setSnapshot({
            userId,
            request,
            activities: feed.activities,
            engagement,
            error: null,
          })
        }
      } catch (error) {
        if (!cancelled) {
          setSnapshot({
            userId,
            request,
            activities: [],
            engagement: null,
            error: error instanceof Error ? error.message : 'Unable to load learner data',
          })
        }
      }
    }

    void loadSnapshot()

    return () => {
      cancelled = true
    }
  }, [request, userId])

  if (!userId) {
    return { ...initialSnapshot, loading: false, refetch }
  }

  return {
    ...snapshot,
    loading: snapshot.userId !== userId || snapshot.request !== request,
    refetch,
  }
}