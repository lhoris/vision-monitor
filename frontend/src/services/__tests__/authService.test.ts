import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

const { apiClient } = await import('../api')
const { authService } = await import('../authService')

const mockedApiClient = vi.mocked(apiClient)

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps tester login as a frontend mock without calling the login API', async () => {
    await expect(
      authService.login({ username: 'tester', password: 'tester123' })
    ).resolves.toEqual({
      user: {
        id: 1,
        username: 'tester',
        role: 'admin',
        permissions: ['admin:access'],
      },
      token: 'mock-tester-token',
    })

    expect(mockedApiClient.post).not.toHaveBeenCalled()
  })

  it('does not call the login API for an invalid tester password', async () => {
    await expect(
      authService.login({ username: 'tester', password: 'wrong' })
    ).rejects.toMatchObject({
      code: 'AUTH_FAILED',
      message: 'Invalid username or password',
    })

    expect(mockedApiClient.post).not.toHaveBeenCalled()
  })

  it('calls the login API for non-tester accounts', async () => {
    mockedApiClient.post.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: 12,
          username: 'operator',
        },
        token: 'real-api-token',
      },
      timestamp: '2026-08-16T00:00:00.000Z',
    })

    await expect(
      authService.login({ username: 'operator', password: 'secret' })
    ).resolves.toEqual({
      user: {
        id: 12,
        username: 'operator',
      },
      token: 'real-api-token',
    })

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
      username: 'operator',
      password: 'secret',
    })
  })
})
