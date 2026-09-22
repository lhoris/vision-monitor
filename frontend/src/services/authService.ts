import { apiClient } from './api'
import { getResponseData } from './serviceUtils'
import type { User } from '@/store/slices/authSlice'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResult {
  user: User
  token: string
  passwordChangeRequired?: boolean
}

export interface MyProfile {
  id: number
  username: string
  name: string | null
  role: 'admin' | 'manager' | 'user'
  email: string | null
  phone: string | null
}

interface LoginApiResponse {
  user: User
  token: string
  passwordChangeRequired?: boolean
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await apiClient.post<LoginApiResponse>('/auth/login', credentials)
    const data = getResponseData<LoginApiResponse | null>(response, null)

    if (!data?.user || !data.token) {
      throw new Error('Login response is invalid')
    }

    return {
      user: data.user,
      token: data.token,
      passwordChangeRequired: data.passwordChangeRequired,
    }
  }

  async changePassword(newPassword: string, currentPassword?: string): Promise<void> {
    await apiClient.post('/auth/password', { currentPassword, newPassword })
  }

  async getMyProfile(): Promise<MyProfile> {
    const response = await apiClient.get<MyProfile>('/auth/profile')
    const profile = getResponseData<MyProfile | null>(response, null)
    if (!profile) throw new Error('Profile response is invalid')
    return profile
  }

  async getCurrentSession(): Promise<User> {
    const response = await apiClient.get<LoginApiResponse['user']>('/auth/session')
    const user = getResponseData<User | null>(response, null)
    if (!user) throw new Error('Authentication session is invalid')
    return user
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }
}

export const authService = new AuthService()
