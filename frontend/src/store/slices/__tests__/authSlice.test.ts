import { describe, expect, it, vi, beforeEach } from 'vitest'
import authReducer, { loginUser, logout, logoutUser } from '../authSlice'

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
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
  })

  it('clears auth state and localStorage values on rejected login and logout', async () => {
    localStorage.setItem('authToken', 'old-token')
    localStorage.setItem('authUsername', 'admin')
    mockedAuthService.login.mockRejectedValue(new Error('Invalid username or password'))

    const rejected = await loginUser({ username: 'admin', password: 'wrong' })(vi.fn(), vi.fn(), undefined)
    const rejectedState = authReducer(undefined, rejected)

    expect(rejectedState.isAuthenticated).toBe(false)
    expect(rejectedState.user).toBeNull()
    expect(rejectedState.error).toBe('Invalid username or password')
    expect(localStorage.getItem('authToken')).toBeNull()

    localStorage.setItem('authToken', 'token')
    localStorage.setItem('authUsername', 'admin')
    const loggedOutState = authReducer(rejectedState, logout())

    expect(loggedOutState.isAuthenticated).toBe(false)
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('authUsername')).toBeNull()

    localStorage.setItem('authToken', 'token')
    localStorage.setItem('authUsername', 'admin')
    const logoutAction = await logoutUser()(vi.fn(), vi.fn(), undefined)
    authReducer(loggedOutState, logoutAction)

    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('authUsername')).toBeNull()
  })
})
