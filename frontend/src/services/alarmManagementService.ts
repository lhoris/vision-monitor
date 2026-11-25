import { apiClient } from './api'
import { getResponseData } from './serviceUtils'

export interface AlarmChannelPolicy { receiver: boolean; push: boolean; email: boolean; teams: boolean }
export interface AlarmTypePolicy {
  id: number; code: string; name: string; nameKo?: string; nameEn?: string; description?: string
  category: 'GENERAL' | 'MODEL'; acknowledgementScope: 'GROUP' | 'INDIVIDUAL'
}
export interface AlarmUserSetting { userId: number; username: string; name: string; overrides: Record<string, AlarmChannelPolicy> }
export interface AlarmManagementOverview { types: AlarmTypePolicy[]; users: AlarmUserSetting[] }

export const alarmManagementService = {
  async get(): Promise<AlarmManagementOverview> {
    return getResponseData(await apiClient.get<AlarmManagementOverview>('/admin/alarm-management'), { types: [], users: [] })
  },
  async getTypes(): Promise<AlarmTypePolicy[]> {
    return getResponseData(await apiClient.get<AlarmTypePolicy[]>('/admin/alarm-management/types'), [])
  },
  async getUsers(): Promise<AlarmUserSetting[]> {
    return getResponseData(await apiClient.get<AlarmUserSetting[]>('/admin/alarm-management/users'), [])
  },
  async updateType(id: number, policy: Pick<AlarmTypePolicy, 'category' | 'acknowledgementScope'>): Promise<AlarmTypePolicy> {
    return getResponseData(await apiClient.put<AlarmTypePolicy>(`/admin/alarm-management/types/${id}`, policy), policy as AlarmTypePolicy)
  },
  async createType(input: Omit<AlarmTypePolicy, 'id'>): Promise<AlarmTypePolicy> {
    return getResponseData(await apiClient.post<AlarmTypePolicy>('/admin/alarm-management/types', input), { ...input, id: -1 })
  },
  async updateUser(userId: number, overrides: Record<string, AlarmChannelPolicy>): Promise<AlarmUserSetting> {
    return getResponseData(await apiClient.put<AlarmUserSetting>(`/admin/alarm-management/users/${userId}`, { overrides }), { userId, username: '', name: '', overrides })
  },
  async deactivateType(id: number): Promise<void> {
    await apiClient.delete(`/admin/alarm-management/types/${id}`)
  },
}
