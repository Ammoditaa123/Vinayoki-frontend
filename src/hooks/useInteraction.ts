import { toast } from 'sonner'
import { sendInteraction } from '../services/interactionApi'
import type { Activity, Interaction, InteractionResult } from '../types'

type InteractionExtras = Partial<Pick<Interaction, 'time_spent' | 'completed' | 'correct'>>

export const createIdempotencyKey = (prefix: string, contentId: number, action: string) => {
  const uniqueId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `${prefix}-${contentId}-${action}-${uniqueId}`
}

export function useInteraction() {
  const logInteraction = async (
    userId: number | null,
    activity: Activity,
    action: Interaction['action'],
    extra: InteractionExtras = {},
    idempotencyKey?: string,
  ): Promise<InteractionResult | null> => {
    if (!userId) return null

    const resolvedIdempotencyKey = idempotencyKey ?? createIdempotencyKey('momentum', activity.id, action)
    const payload: Interaction = {
      user_id: userId,
      content_id: activity.id,
      action,
      completed: action === 'complete' || action === 'answer',
      ...extra,
      idempotency_key: resolvedIdempotencyKey,
    }

    try {
      return await sendInteraction(payload)
    } catch (error) {
      console.error('Interaction failed', error)
      toast.error("Couldn't save that interaction.", {
        description: 'Please try again. Your activity is still here.',
      })
      return null
    }
  }

  return { logInteraction }
}

export default useInteraction
