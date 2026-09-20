import { apiClient } from './api'
import { getResponseData } from './serviceUtils'
import type { UserAccount, UserDangerAction, UserListResponse, UserMutationRequest } from '@/types/userManagement'

export interface UserManagementService {
  listUsers(filters?: { query?: string; roleId?: string; accountStatus?: string; employmentStatus?: string; page?: number; pageSize?: number; sort?: string }): Promise<UserListResponse>
  getUser(userId: number): Promise<UserAccount>
  createUser(input: UserMutationRequest): Promise<UserAccount>
  updateUser(userId: number, input: UserMutationRequest): Promise<UserAccount>
  resetPassword(userId: number): Promise<UserAccount>
  dangerAction(userId: number, action: UserDangerAction, keepPersonalization: boolean): Promise<UserAccount>
}

function actualApiService(): UserManagementService {
  return {
    async listUsers(filters) {
      const params = Object.fromEntries(Object.entries(filters ?? {}).filter(([, value]) => value !== undefined && value !== '' && value !== 'all'))
      const response = Object.keys(params).length > 0
        ? await apiClient.get<UserListResponse>('/admin/users', params)
        : await apiClient.get<UserListResponse>('/admin/users')
      return getResponseData(response, { items: [], total: 0, roles: [] })
    },
    async getUser(userId) {
      return getResponseData(await apiClient.get<UserAccount>(`/admin/users/${userId}`), null as never)
    },
    async createUser(input) {
      return getResponseData(await apiClient.post<UserAccount>('/admin/users', input), null as never)
    },
    async updateUser(userId, input) {
      return getResponseData(await apiClient.put<UserAccount>(`/admin/users/${userId}`, input), null as never)
    },
    async resetPassword(userId) {
      return getResponseData(await apiClient.post<UserAccount>(`/admin/users/${userId}/reset-password`), null as never)
    },
    async dangerAction(userId, action, keepPersonalization) {
      const endpoint = `/admin/users/${userId}/${action}`
      const body = action === 'retire'
        ? { personalizationAction: keepPersonalization ? 'keep' : 'reset' }
        : action === 'delete-request'
          ? { keepPersonalization, confirmedImpact: true, reason: '사용자관리 화면 요청' }
          : { keepPersonalization }
      return getResponseData(await apiClient.post<UserAccount>(endpoint, body), null as never)
    },
  }
}

const actualApi = actualApiService()

export const userManagementService: UserManagementService = {
  listUsers: (filters) => actualApi.listUsers(filters),
  getUser: (userId) => actualApi.getUser(userId),
  createUser: (input) => actualApi.createUser(input),
  updateUser: (userId, input) => actualApi.updateUser(userId, input),
  resetPassword: (userId) => actualApi.resetPassword(userId),
  dangerAction: (userId, action, keepPersonalization) => actualApi.dangerAction(userId, action, keepPersonalization),
}
