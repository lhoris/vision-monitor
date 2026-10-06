import { describe, expect, it, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { loginUser, logout, logoutUser, validateAuthSession } from '../authSlice'

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    getCurrentSession: vi.fn(),
    logout: vi.fn(),
  },
}))

const { authService } = await import('@/services/authService')
const mockedAuthService = vi.mocked(authService)

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('stores auth state and localStorage values after fulfilled login', async () => {
    mockedAuthService.login.mockResolvedValue({
      user: {
        id: 1,
        username: 'admin',
        role: 'admin',
        permissions: ['admin:access'],
      },
      token: 'dev-auth-token-admin',
    })

    const action = await loginUser({ username: 'admin', password: 'admin' })(vi.fn(), vi.fn(), undefined)
    const state = authReducer(undefined, action)

    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.username).toBe('admin')
    expect(state.user?.permissions).toEqual(['admin:access'])
    expect(localStorage.getItem('authToken')).toBe('dev-auth-token-admin')
    expect(localStorage.getItem('authUsername')).toBe('admin')
    expect(JSON.parse(localStorage.getItem('authUser') ?? '{}')).toMatchObject({
      username: 'admin',
      role: 'admin',
      permissions: ['admin:access'],
    })
  })

  it('clears auth state and localStorage values on rejected login and logout', async () => {
    localStorage.setItem('authToken', 'old-token')
    localStorage.setItem('authUsername', 'admin')
    localStorage.setItem('authUser', JSON.stringify({ id: 1, username: 'admin' }))
    mockedAuthService.login.mockRejectedValue(new Error('Invalid username or password'))

    const rejected = await loginUser({ username: 'admin', password: 'wrong' })(vi.fn(), vi.fn(), undefined)
    const rejectedState = authReducer(undefined, rejected)

    expect(rejectedState.isAuthenticated).toBe(false)
    expect(rejectedState.user).toBeNull()
    expect(rejectedState.error).toBe('Invalid username or password')
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('authUsername')).toBeNull()
    expect(localStorage.getItem('authUser')).toBeNull()

    localStorage.setItem('authToken', 'token')
    localStorage.setItem('authUsername', 'admin')
    localStorage.setItem('authUser', JSON.stringify({ id: 1, username: 'admin' }))
    const loggedOutState = authReducer(rejectedState, logout())

    expect(loggedOutState.isAuthenticated).toBe(false)
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('authUsername')).toBeNull()
    expect(localStorage.getItem('authUser')).toBeNull()

    localStorage.setItem('authToken', 'token')
    localStorage.setItem('authUsername', 'admin')
    localStorage.setItem('authUser', JSON.stringify({ id: 1, username: 'admin' }))
    const logoutAction = await logoutUser()(vi.fn(), vi.fn(), undefined)
    authReducer(loggedOutState, logoutAction)

    expect(mockedAuthService.logout).toHaveBeenCalled()
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('authUsername')).toBeNull()
    expect(localStorage.getItem('authUser')).toBeNull()
  })

  it('clears local authentication even when server logout fails', async () => {
    localStorage.setItem('authToken', 'token')
    localStorage.setItem('authUsername', 'admin')
    localStorage.setItem('authUser', JSON.stringify({ id: 1, username: 'admin' }))
    mockedAuthService.logout.mockRejectedValue(new Error('Network unavailable'))

    const logoutAction = await logoutUser()(vi.fn(), vi.fn(), undefined)
    const state = authReducer(undefined, logoutAction)

    expect(logoutAction.type).toContain('/fulfilled')
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('authToken')).toBeNull()
  })

  it('does not validate the same stored session concurrently', async () => {
    localStorage.setItem('authToken', 'token')
    localStorage.setItem('authUsername', 'tester')
    localStorage.setItem('authUser', JSON.stringify({ id: 1, username: 'tester', role: 'user' }))

    let resolveSession: ((value: { id: number; username: string; role: string }) => void) | undefined
    mockedAuthService.getCurrentSession.mockReturnValue(new Promise((resolve) => { resolveSession = resolve }))
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 1, username: 'tester', role: 'user', permissions: [] },
          loading: false,
          error: null,
          sessionStatus: 'idle' as const,
        },
      },
    })

    const firstValidation = store.dispatch(validateAuthSession())
    const secondValidation = store.dispatch(validateAuthSession())
    expect(mockedAuthService.getCurrentSession).toHaveBeenCalledTimes(1)

    resolveSession?.({ id: 1, username: 'tester', role: 'user' })
    await Promise.all([firstValidation, secondValidation])
    expect(store.getState().auth.sessionStatus).toBe('valid')
  })

  it('restores administrator access from stored session regardless of role casing', async () => {
    vi.resetModules()
    localStorage.setItem('authToken', 'dev-auth-token-admin')
    localStorage.setItem('authUsername', 'admin')
    localStorage.setItem('authUser', JSON.stringify({
      id: 1,
      username: 'admin',
      role: 'ADMIN',
      permissions: ['ADMIN:ACCESS'],
    }))

    const { default: freshAuthReducer, hasAdminAccess } = await import('../authSlice')
    const state = freshAuthReducer(undefined, { type: '@@INIT' })

    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toMatchObject({
      username: 'admin',
      role: 'ADMIN',
      permissions: ['ADMIN:ACCESS'],
    })
    expect(hasAdminAccess(state.user)).toBe(true)
  })

  it('does not infer administrator access from the tester username', async () => {
    vi.resetModules()
    localStorage.setItem('authToken', 'demo-token')
    localStorage.setItem('authUsername', 'tester')

    const { default: freshAuthReducer } = await import('../authSlice')
    const state = freshAuthReducer(undefined, { type: '@@INIT' })

    expect(state.user).toMatchObject({ username: 'tester', role: 'user', permissions: [] })
  })
})
