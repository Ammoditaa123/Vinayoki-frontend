import { useCallback, useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import {
  getRecommendationHistory,
  type RecommendationHistoryResponse,
} from '../services/recommendationHistoryApi'

interface RecommendationHistorySnapshot {
  userId: number | null
  request: number
  data: RecommendationHistoryResponse | null
  error: string | null
}

const initialSnapshot: RecommendationHistorySnapshot = {
  userId: null,
  request: -1,
  data: null,
  error: null,
}

export function useRecommendationHistory() {
  const { userId } = useAppContext()
  const [snapshot, setSnapshot] = useState<RecommendationHistorySnapshot>(initialSnapshot)
  const [request, setRequest] = useState(0)

  const retry = useCallback(() => {
    setRequest((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    getRecommendationHistory(userId)
      .then((data) => {
        if (!cancelled) {
          setSnapshot({ userId, request, data, error: null })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot({
            userId,
            request,
            data: null,
            error: 'Recommendation history couldn\'t be loaded.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [request, userId])

  if (!userId) {
    return { data: null, loading: false, error: null, retry }
  }

  const isCurrentSnapshot = snapshot.userId === userId && snapshot.request === request

  return {
    data: isCurrentSnapshot ? snapshot.data : null,
    loading: !isCurrentSnapshot,
    error: isCurrentSnapshot ? snapshot.error : null,
    retry,
  }
}
