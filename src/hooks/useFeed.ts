import { useCallback, useEffect, useState } from 'react'
import { getFeed } from '../services/feedApi'
import type { Activity, FeedResponse } from '../types'

const parseOptions = (value: string[] | string | undefined) => {
  if (!value) return []

  if (Array.isArray(value)) return value

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return [value]
  }
}

const normalizeActivities = (activities: Activity[]) => activities.map((activity) => ({
  ...activity,
  options: parseOptions(activity.options),
}))

export function useFeed(userId: number | null, initialFeed?: FeedResponse) {
  const hasFreshInitialFeed = Boolean(userId && initialFeed?.user_id === userId)
  const [activities, setActivities] = useState<Activity[]>(() => (
    hasFreshInitialFeed && initialFeed ? normalizeActivities(initialFeed.activities) : []
  ))
  const [loading, setLoading] = useState(Boolean(userId && !hasFreshInitialFeed))
  const [error, setError] = useState<string | null>(null)
  const [feedUserId, setFeedUserId] = useState<number | null>(() => (
    hasFreshInitialFeed && userId ? userId : null
  ))
  const [request, setRequest] = useState(0)

  const refetch = useCallback(() => {
    setRequest((current) => current + 1)
  }, [])

  const replaceFeed = useCallback((feed: FeedResponse) => {
    setActivities(normalizeActivities(feed.activities))
    setFeedUserId(feed.user_id)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!userId) return

    if (initialFeed?.user_id === userId && request === 0) {
      return
    }

    let cancelled = false

    const fetchFeed = async () => {
      setLoading(true)
      setError(null)

      try {
        const response: FeedResponse = await getFeed(userId)

        if (!cancelled) {
          setActivities(normalizeActivities(response.activities))
          setFeedUserId(response.user_id)
        }
      } catch (err) {
        if (!cancelled) {
          setFeedUserId(userId)
          setError(err instanceof Error ? err.message : 'Unable to load feed')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchFeed()

    return () => {
      cancelled = true
    }
  }, [initialFeed, request, userId])

  const hasCurrentFeed = Boolean(userId && feedUserId === userId)

  return {
    activities: hasCurrentFeed ? activities : [],
    loading: Boolean(userId && (loading || !hasCurrentFeed)),
    error: hasCurrentFeed ? error : null,
    replaceFeed,
    refetch,
  }
}

export default useFeed
