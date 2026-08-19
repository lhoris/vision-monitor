import { apiClient } from './api'
import { getResponseData } from './serviceUtils'
import { userManagementMockAdapter } from './userManagementMockAdapter'
import type { UserAccount, UserDangerAction, UserListResponse, UserMutationRequest } from '@/types/userManagement'

export interface UserManagementService {
  listUsers(filters?: { query?: string; orgUnitId?: number; roleId?: string; accountStatus?: string; employmentStatus?: string; page?: number; pageSize?: number; sort?: string }): Promise<UserListResponse>
  getUser(userId: number): Promise<UserAccount>
  createUser(input: UserMutationRequest): Promise<UserAccount>
  updateUser(userId: number, input: UserMutationRequest): Promise<UserAccount>
  dangerAction(userId: number, action: UserDangerAction, keepPersonalization: boolean): Promise<UserAccount>
}

function currentUsername(): string {
  return localStorage.getItem('authUsername') ?? ''
}

function isMockAdmin(): boolean {
  return currentUsername() === 'tester'
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
    async dangerAction(userId, action, keepPersonalization) {
      const endpoint = action === 'disable'
        ? `/admin/users/${userId}/disable`
        : action === 'retire'
          ? `/admin/users/${userId}/retire`
          : `/admin/users/${userId}/delete-request`
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

function selectedService(): UserManagementService {
  return actualApi
}

export const userManagementService: UserManagementService = {
  listUsers: () => isMockAdmin() ? userManagementMockAdapter.listUsers().then((result) => result.data) : selectedService().listUsers(),
  getUser: (userId) => isMockAdmin() ? userManagementMockAdapter.getUser(userId).then((result) => result.data) : selectedService().getUser(userId),
  createUser: (input) => isMockAdmin() ? userManagementMockAdapter.createUser(input, currentUsername()).then((result) => result.data) : selectedService().createUser(input),
  updateUser: (userId, input) => isMockAdmin() ? userManagementMockAdapter.updateUser(userId, input, currentUsername()).then((result) => result.data) : selectedService().updateUser(userId, input),
  dangerAction: (userId, action, keepPersonalization) => isMockAdmin() ? userManagementMockAdapter.dangerAction(userId, action, currentUsername(), keepPersonalization).then((result) => result.data) : selectedService().dangerAction(userId, action, keepPersonalization),
}

export function resetUserManagementMock(): void {
  userManagementMockAdapter.reset()
}
