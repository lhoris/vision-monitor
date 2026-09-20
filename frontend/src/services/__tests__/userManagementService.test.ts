import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }))

const { apiClient } = await import('../api')
const { userManagementService } = await import('../userManagementService')
const { userManagementFixture } = await import('@/mocks/userManagement')
const { canPerformDangerAction } = await import('../userManagementValidation')
const mockedApiClient = vi.mocked(apiClient)

const newUser = {
  username: 'new-user', name: 'New user', displayName: 'New user', department: 'Safety', position: 'Staff',
  email: 'new-user@example.com', phone: '010-0000-0000', roleIds: ['viewer'],
  accountStatus: 'active' as const, employmentStatus: 'employed' as const,
}

describe('userManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('uses the backend API for tester user listing', async () => {
    localStorage.setItem('authUsername', 'tester')
    mockedApiClient.get.mockResolvedValue({ success: true, data: { items: [], total: 0, roles: [] } })

    await userManagementService.listUsers()

    expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/users')
  })

  it('uses the backend API for tester user creation', async () => {
    localStorage.setItem('authUsername', 'tester')
    mockedApiClient.post.mockResolvedValue({ success: true, data: { ...newUser, id: 7 } })

    const result = await userManagementService.createUser(newUser)

    expect(result.username).toBe('new-user')
    expect(mockedApiClient.post).toHaveBeenCalledWith('/admin/users', newUser)
  })

  it('uses the same backend API boundary for non-demo users', async () => {
    localStorage.setItem('authUsername', 'tester1')
    mockedApiClient.get.mockResolvedValue({ success: true, data: { items: [], total: 0, roles: [] } })

    await userManagementService.listUsers()

    expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/users')
  })

  it('protects the last active administrator', () => {
    const onlyAdminFixture = [userManagementFixture[0], userManagementFixture[2]]
    expect(canPerformDangerAction('delete-request', onlyAdminFixture[0], 'operator01', onlyAdminFixture)).toBeTruthy()
  })

  it('supports lock and unlock status actions through the API boundary', async () => {
    localStorage.setItem('authUsername', 'real-admin')
    mockedApiClient.post.mockResolvedValue({ success: true, data: userManagementFixture[1] })

    await userManagementService.dangerAction(2, 'lock', true)
    await userManagementService.dangerAction(2, 'unlock', true)

    expect(mockedApiClient.post).toHaveBeenNthCalledWith(1, '/admin/users/2/lock', { keepPersonalization: true })
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(2, '/admin/users/2/unlock', { keepPersonalization: true })
  })
})
