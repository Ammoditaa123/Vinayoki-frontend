import { useCallback, useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { getLearnerState, type LearnerState } from '../services/learnerStateApi'

interface LearnerStateSnapshot {
  userId: number | null
  request: number
  learnerState: LearnerState | null
  error: string | null
}

const initialSnapshot: LearnerStateSnapshot = {
  userId: null,
  request: -1,
  learnerState: null,
  error: null,
}

export function useLearnerState() {
  const { userId } = useAppContext()
  const [snapshot, setSnapshot] = useState<LearnerStateSnapshot>(initialSnapshot)
  const [request, setRequest] = useState(0)

  const refetch = useCallback(() => {
    setRequest((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    getLearnerState(userId)
      .then((learnerState) => {
        if (!cancelled) {
          setSnapshot({ userId, request, learnerState, error: null })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSnapshot({
            userId,
            request,
            learnerState: null,
            error: error instanceof Error ? error.message : 'Unable to load learner state',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [request, userId])

  if (!userId) {
    return {
      learnerState: null,
      loading: false,
      error: null,
      refetch,
    }
  }

  const isCurrentSnapshot = snapshot.userId === userId && snapshot.request === request

  return {
    learnerState: isCurrentSnapshot ? snapshot.learnerState : null,
    loading: !isCurrentSnapshot,
    error: isCurrentSnapshot ? snapshot.error : null,
    refetch,
  }
}
