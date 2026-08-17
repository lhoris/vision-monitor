import { userManagementFixture, userManagementRoles } from '@/mocks/userManagement'
import type { UserAccount, UserDangerAction, UserListResponse, UserMutationRequest } from '@/types/userManagement'
import { canPerformDangerAction, validateUserMutation } from './userManagementValidation'

let users = structuredClone(userManagementFixture)

const clone = <T>(value: T): T => structuredClone(value)

function response<T>(data: T): { success: true; data: T } {
  return { success: true, data: clone(data) }
}

function failure(code: string, message: string): never {
  const error = new Error(message) as Error & { code: string }
  error.code = code
  throw error
}

function refreshUser(user: UserAccount): UserAccount {
  return { ...user, roles: user.roleIds.flatMap((id) => userManagementRoles.filter((role) => role.id === id)) }
}

export const userManagementMockAdapter = {
  reset() {
    users = structuredClone(userManagementFixture)
  },

  async listUsers(): Promise<{ success: true; data: UserListResponse }> {
    return response({ items: users, total: users.length, roles: userManagementRoles })
  },

  async getUser(userId: number) {
    const user = users.find((item) => item.id === userId)
    return user ? response(user) : failure('USER_NOT_FOUND', '사용자를 찾을 수 없습니다.')
  },

  async createUser(input: UserMutationRequest, actor: string) {
    const errors = validateUserMutation(input, users)
    if (Object.keys(errors).length) failure('VALIDATION_ERROR', Object.values(errors)[0] ?? '입력값을 확인하세요.')
    const now = new Date().toISOString()
    const created = refreshUser({
      ...input,
      id: Math.max(...users.map((user) => user.id), 0) + 1,
      roles: [],
      createdAt: now,
      updatedAt: now,
      updatedBy: actor,
      personalization: { hasSettings: false, cameraGridCount: 0 },
    })
    users = [...users, created]
    return response(created)
  },

  async updateUser(userId: number, input: UserMutationRequest, actor: string) {
    const current = users.find((user) => user.id === userId)
    if (!current) failure('USER_NOT_FOUND', '사용자를 찾을 수 없습니다.')
    const errors = validateUserMutation(input, users, userId)
    if (Object.keys(errors).length) failure('VALIDATION_ERROR', Object.values(errors)[0] ?? '입력값을 확인하세요.')
    const updated = refreshUser({ ...current, ...input, updatedAt: new Date().toISOString(), updatedBy: actor })
    users = users.map((user) => (user.id === userId ? updated : user))
    return response(updated)
  },

  async dangerAction(userId: number, action: UserDangerAction, actor: string, keepPersonalization: boolean) {
    const target = users.find((user) => user.id === userId)
    if (!target) failure('USER_NOT_FOUND', '사용자를 찾을 수 없습니다.')
    const guardMessage = canPerformDangerAction(action, target, actor, users)
    if (guardMessage) failure(action === 'delete-request' ? 'LAST_ADMIN_RISK' : 'SELF_LOCKOUT_RISK', guardMessage)

    const now = new Date().toISOString()
    const updated: UserAccount = {
      ...target,
      accountStatus: action === 'delete-request' ? 'disabled' : target.accountStatus,
      employmentStatus: action === 'retire' ? 'retired' : target.employmentStatus,
      personalization: keepPersonalization ? target.personalization : { hasSettings: false, cameraGridCount: 0 },
      updatedAt: now,
      updatedBy: actor,
    }
    users = users.map((user) => (user.id === userId ? updated : user))
    return response(updated)
  },
}
