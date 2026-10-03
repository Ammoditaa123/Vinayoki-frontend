import { useCallback, useEffect, useState } from 'react'
import { getLearningFeed, getBackendMode } from '../services/cardService'
import type { BackendMode, NormalizedLearningCard } from '../types'

interface FeedState {
  cards: NormalizedLearningCard[]
  loading: boolean
  error: string | null
  feedUserId: number | null
  backendMode: BackendMode | null
}

export function useFeed(userId: number | null, initialCards?: NormalizedLearningCard[]) {
  const hasFreshInitialCards = Boolean(userId && initialCards && initialCards.length > 0)

  const [state, setState] = useState<FeedState>({
    cards: hasFreshInitialCards && initialCards ? initialCards : [],
    loading: Boolean(userId && !hasFreshInitialCards),
    error: null,
    feedUserId: hasFreshInitialCards ? userId : null,
    backendMode: null,
  })
  const [request, setRequest] = useState(0)

  const refetch = useCallback(() => {
    setRequest((current) => current + 1)
  }, [])

  const replaceFeed = useCallback((cards: NormalizedLearningCard[], feedUser: number) => {
    setState((prev) => ({
      ...prev,
      cards,
      feedUserId: feedUser,
      error: null,
      loading: false,
    }))
  }, [])

  useEffect(() => {
    if (!userId) return
    if (hasFreshInitialCards && request === 0) return

    let cancelled = false

    const fetchFeed = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const cards = await getLearningFeed(userId)
        const mode = await getBackendMode(userId)

        if (!cancelled) {
          setState({ cards, loading: false, error: null, feedUserId: userId, backendMode: mode })
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            feedUserId: userId,
            error: err instanceof Error ? err.message : 'Unable to load feed',
          }))
        }
      }
    }

    void fetchFeed()

    return () => { cancelled = true }
  }, [hasFreshInitialCards, request, userId])

  const hasCurrentFeed = Boolean(userId && state.feedUserId === userId)

  return {
    cards: hasCurrentFeed ? state.cards : [],
    loading: Boolean(userId && (state.loading || !hasCurrentFeed)),
    error: hasCurrentFeed ? state.error : null,
    backendMode: state.backendMode,
    replaceFeed,
    refetch,
  }
}

export default useFeed
