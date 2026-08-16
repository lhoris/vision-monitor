import { apiClient } from './api'
import { getResponseData } from './serviceUtils'
import type { ApiError } from '@/types/api'
import type { User } from '@/store/slices/authSlice'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResult {
  user: User
  token: string
}

interface LoginApiResponse {
  user: User
  token: string
}

const ADMIN_TESTER_USERNAME = 'tester'
const OPERATOR_TESTER_USERNAME = 'tester1'
const MOCK_TESTER_PASSWORD = 'tester123'

function isAdminTesterCredentials(credentials: LoginCredentials): boolean {
  return (
    credentials.username === ADMIN_TESTER_USERNAME &&
    credentials.password === MOCK_TESTER_PASSWORD
  )
}

function isOperatorTesterCredentials(credentials: LoginCredentials): boolean {
  return (
    credentials.username === OPERATOR_TESTER_USERNAME &&
    credentials.password === MOCK_TESTER_PASSWORD
  )
}

function isMockTesterUsername(credentials: LoginCredentials): boolean {
  return (
    credentials.username === ADMIN_TESTER_USERNAME ||
    credentials.username === OPERATOR_TESTER_USERNAME
  )
}

function createAuthError(message: string, code = 'AUTH_FAILED'): ApiError {
  return { code, message }
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    if (isAdminTesterCredentials(credentials)) {
      return {
        user: {
          id: 1,
          username: credentials.username,
          role: 'admin',
          permissions: ['admin:access'],
        },
        token: 'mock-tester-token',
      }
    }

    if (isOperatorTesterCredentials(credentials)) {
      return {
        user: {
          id: 2,
          username: credentials.username,
          role: 'operator',
          permissions: [],
        },
        token: 'mock-tester1-token',
      }
    }

    if (isMockTesterUsername(credentials)) {
      throw createAuthError('Invalid username or password')
    }

    const response = await apiClient.post<LoginApiResponse>('/auth/login', credentials)
    const data = getResponseData<LoginApiResponse | null>(response, null)

    if (!data?.user || !data.token) {
      throw createAuthError('Login response is invalid', 'INVALID_LOGIN_RESPONSE')
    }

    return {
      user: data.user,
      token: data.token,
    }
  }
}

export const authService = new AuthService()
