import { apiClient } from './api'
import { getResponseData } from './serviceUtils'

export interface AlarmChannelPolicy { receiver: boolean; push: boolean; email: boolean; teams: boolean }
export interface AlarmTypePolicy {
  id: number; code: string; name: string; nameKo?: string; nameEn?: string; description?: string
  category: 'GENERAL' | 'MODEL'; recipientScope: 'ALL_ADMIN' | 'SELECTED_USER'; acknowledgementScope: 'GROUP' | 'INDIVIDUAL'
  defaultSave: boolean; defaultReceive: boolean; defaultPush: boolean; defaultEmail: boolean; defaultTeams: boolean
}
export interface AlarmUserSetting { userId: number; username: string; name: string; overrides: Record<string, AlarmChannelPolicy> }
export interface AlarmManagementOverview { types: AlarmTypePolicy[]; users: AlarmUserSetting[] }

export const alarmManagementService = {
  async get(): Promise<AlarmManagementOverview> {
    return getResponseData(await apiClient.get<AlarmManagementOverview>('/admin/alarm-management'), { types: [], users: [] })
  },
  async updateType(id: number, policy: Omit<AlarmTypePolicy, 'id' | 'code' | 'name' | 'nameKo' | 'nameEn' | 'description'>): Promise<AlarmTypePolicy> {
    return getResponseData(await apiClient.put<AlarmTypePolicy>(`/admin/alarm-management/types/${id}`, policy), policy as AlarmTypePolicy)
  },
  async updateUser(userId: number, overrides: Record<string, AlarmChannelPolicy>): Promise<AlarmUserSetting> {
    return getResponseData(await apiClient.put<AlarmUserSetting>(`/admin/alarm-management/users/${userId}`, { overrides }), { userId, username: '', name: '', overrides })
  },
}
