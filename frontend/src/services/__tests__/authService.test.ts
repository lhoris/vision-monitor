import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api', () => ({ apiClient: { post: vi.fn(), get: vi.fn() } }))

const { apiClient } = await import('../api')
const { authService } = await import('../authService')
const mockedApiClient = vi.mocked(apiClient)

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('authenticates the prefilled tester account through the backend', async () => {
    mockedApiClient.post.mockResolvedValue({
      success: true,
      data: {
        user: { id: 1, username: 'tester', role: 'user', permissions: [] },
        token: 'db-session-token',
      },
      timestamp: '2026-09-20T00:00:00',
    })

    await expect(authService.login({ username: 'tester', password: 'tester1@#' })).resolves.toEqual({
      user: { id: 1, username: 'tester', role: 'user', permissions: [] },
      token: 'db-session-token',
      passwordChangeRequired: undefined,
    })
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', { username: 'tester', password: 'tester1@#' })
  })

  it('sends invalid tester credentials to the backend for rejection', async () => {
    mockedApiClient.post.mockRejectedValue({ code: 'AUTH_FAILED', message: 'Invalid username or password' })
    await expect(authService.login({ username: 'tester', password: 'wrong' })).rejects.toMatchObject({ code: 'AUTH_FAILED' })
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', { username: 'tester', password: 'wrong' })
  })

  it('validates every stored session through the backend', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: { id: 1, username: 'tester', role: 'user', permissions: [] },
      timestamp: '2026-09-20T00:00:00',
    })
    await expect(authService.getCurrentSession()).resolves.toMatchObject({ username: 'tester', role: 'user' })
    expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/session')
  })

  it('revokes the current session through the backend on logout', async () => {
    mockedApiClient.post.mockResolvedValue({ success: true, data: null })

    await authService.logout()

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/logout')
  })

  it('loads the authenticated users own profile from the backend', async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: { id: 1, username: 'tester', name: 'Test User', role: 'user', email: 'tester@example.com', phone: '01012345678' },
      timestamp: '2026-09-20T00:00:00',
    })
    await expect(authService.getMyProfile()).resolves.toMatchObject({ username: 'tester', name: 'Test User' })
    expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/profile')
  })

  it('sends current and new passwords to the backend', async () => {
    mockedApiClient.post.mockResolvedValue({ success: true, data: null, timestamp: '2026-09-20T00:00:00' })
    await authService.changePassword('new-password-1', 'old-password')
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/password', {
      currentPassword: 'old-password',
      newPassword: 'new-password-1',
    })
  })
})
