import { useCallback, useEffect, useState } from 'react'
import { getEngagement } from '../services/interactionApi'
import { getLearningFeed } from '../services/cardService'
import type { EngagementState, NormalizedLearningCard } from '../types'

interface LearnerSnapshot {
  userId: number | null
  request: number
  cards: NormalizedLearningCard[]
  engagement: EngagementState | null
  error: string | null
}

const initialSnapshot: LearnerSnapshot = {
  userId: null,
  request: -1,
  cards: [],
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
        const [feedCards, engagement] = await Promise.all([
          getLearningFeed(userId),
          getEngagement(userId),
        ])

        if (!cancelled) {
          setSnapshot({
            userId,
            request,
            cards: feedCards,
            engagement,
            error: null,
          })
        }
      } catch (error) {
        if (!cancelled) {
          setSnapshot({
            userId,
            request,
            cards: [],
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