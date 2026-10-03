import api from './api'
import type { UserStats } from '../types'

export const getUserStats = async (userId: number): Promise<UserStats> => {
  const response = await api.get<UserStats>(`/stats/${userId}`)
  return response.data
}
