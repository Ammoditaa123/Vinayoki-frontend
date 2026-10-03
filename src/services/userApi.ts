import api from './api'
import type { OnboardingData, User } from '../types'

interface BackendUserCreatePayload {
  name: string
  goal: string
  level: string
  learning_style: string
}

export const createUser = async (payload: OnboardingData & { name?: string }) => {
  const backendPayload: BackendUserCreatePayload = {
    name: payload.name ?? 'Ammoditaa',
    goal: String(payload.goal),
    level: String(payload.skillLevel),
    learning_style: String(payload.learningStyle),
  }

  const response = await api.post<User>('/users/', backendPayload)
  return response.data
}
