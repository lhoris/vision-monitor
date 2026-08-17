import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

const { apiClient } = await import('../api')
const { resetUserManagementMock, userManagementService } = await import('../userManagementService')
const { userManagementFixture } = await import('@/mocks/userManagement')
const { canPerformDangerAction } = await import('../userManagementValidation')

const mockedApiClient = vi.mocked(apiClient)

const newUser = {
  username: 'new-user',
  name: '신규 사용자',
  displayName: '신규 사용자',
  department: '품질관리팀',
  position: '사원',
  email: 'new-user@example.com',
  phone: '010-0000-0000',
  roleIds: ['viewer'],
  accountStatus: 'active' as const,
  employmentStatus: 'employed' as const,
}

describe('userManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    resetUserManagementMock()
  })

  it('uses mock only for tester and supports user creation', async () => {
    localStorage.setItem('authUsername', 'tester')

    const result = await userManagementService.createUser(newUser)

    expect(result.username).toBe('new-user')
    expect(mockedApiClient.post).not.toHaveBeenCalled()
    expect((await userManagementService.listUsers()).items).toHaveLength(6)
  })

  it('does not use mock for tester1 and calls the real API boundary', async () => {
    localStorage.setItem('authUsername', 'tester1')
    mockedApiClient.get.mockResolvedValue({ success: true, data: { items: [], total: 0, roles: [] } })

    await userManagementService.listUsers()

    expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/users')
  })

  it('blocks duplicate IDs and protects the last administrator', async () => {
    localStorage.setItem('authUsername', 'tester')

    await expect(userManagementService.createUser({ ...newUser, username: 'tester' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    await expect(userManagementService.dangerAction(1, 'disable', true)).rejects.toMatchObject({ code: 'SELF_LOCKOUT_RISK' })
    expect(canPerformDangerAction('delete-request', userManagementFixture[0], 'operator01', userManagementFixture)).toBe('마지막 활성 관리자 계정은 변경하거나 삭제할 수 없습니다.')
  })
})
