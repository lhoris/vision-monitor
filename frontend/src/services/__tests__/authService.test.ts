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

  it('keeps tester1 login as a non-admin frontend mock without calling the login API', async () => {
    await expect(
      authService.login({ username: 'tester1', password: 'tester123' })
    ).resolves.toEqual({
      user: {
        id: 2,
        username: 'tester1',
        role: 'operator',
        permissions: [],
      },
      token: 'mock-tester1-token',
    })

    expect(mockedApiClient.post).not.toHaveBeenCalled()
  })

  it('does not call the login API for an invalid tester1 password', async () => {
    await expect(
      authService.login({ username: 'tester1', password: 'wrong' })
    ).rejects.toMatchObject({
      code: 'AUTH_FAILED',
      message: 'Invalid username or password',
    })

    expect(mockedApiClient.post).not.toHaveBeenCalled()
  })

  it('calls the login API for non-mock accounts and preserves authorization fields', async () => {
    mockedApiClient.post.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: 1,
          username: 'admin',
          role: 'admin',
          permissions: ['admin:access'],
        },
        token: 'dev-auth-token-admin',
      },
      timestamp: '2026-08-24T21:30:00',
    })

    await expect(
      authService.login({ username: 'admin', password: 'admin' })
    ).resolves.toEqual({
      user: {
        id: 1,
        username: 'admin',
        role: 'admin',
        permissions: ['admin:access'],
      },
      token: 'dev-auth-token-admin',
    })

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
      username: 'admin',
      password: 'admin',
    })
  })
})
