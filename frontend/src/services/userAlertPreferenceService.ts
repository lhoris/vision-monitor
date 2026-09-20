import { apiClient } from './api'
import { getResponseData } from './serviceUtils'

export interface UserAlertPreferences {
  email: string | null
  phone: string | null
  emailEnabled: boolean
  smsEnabled: boolean
}

export type UserAlertPreferenceInput = Pick<UserAlertPreferences, 'emailEnabled' | 'smsEnabled'>

export const userAlertPreferenceService = {
  async get(): Promise<UserAlertPreferences> {
    const result = getResponseData<UserAlertPreferences | null>(
      await apiClient.get<UserAlertPreferences>('/auth/notification-settings'),
      null,
    )
    if (!result) throw new Error('Notification settings response is invalid')
    return result
  },

  async save(input: UserAlertPreferenceInput): Promise<UserAlertPreferences> {
    const result = getResponseData<UserAlertPreferences | null>(
      await apiClient.put<UserAlertPreferences>('/auth/notification-settings', input),
      null,
    )
    if (!result) throw new Error('Notification settings response is invalid')
    return result
  },
}
