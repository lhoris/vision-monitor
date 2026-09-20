/**
 * Redux Slice for Authentication State
 */

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { authService, type LoginCredentials } from '@/services/authService'
import { fetchCommonCodes } from './commonCodeSlice'

export interface User {
  id: number
  username: string
  role?: 'admin' | 'operator' | 'user'
  permissions?: string[]
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
  sessionStatus: 'idle' | 'checking' | 'valid' | 'invalid'
}

const AUTH_TOKEN_KEY = 'authToken'
const AUTH_USERNAME_KEY = 'authUsername'
const AUTH_USER_KEY = 'authUser'

function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function removeStoredAuth(): void {
  if (!isStorageAvailable()) return

  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USERNAME_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

function readStoredUser(): User | null {
  if (!isStorageAvailable()) return null

  const rawUser = localStorage.getItem(AUTH_USER_KEY)
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser) as Partial<User>
      if (typeof user.username === 'string' && user.username.trim()) {
        return {
          id: typeof user.id === 'number' ? user.id : 0,
          username: user.username,
          role: user.role,
          permissions: Array.isArray(user.permissions) ? user.permissions : [],
        }
      }
    } catch {
      removeStoredAuth()
      return null
    }
  }

  const username = localStorage.getItem(AUTH_USERNAME_KEY)
  if (!username) return null

  return {
    id: 0,
    username,
    role: 'user',
    permissions: [],
  }
}

function createInitialState(): AuthState {
  const token = isStorageAvailable() ? localStorage.getItem(AUTH_TOKEN_KEY) : null
  const user = token ? readStoredUser() : null

  if (!token || !user) {
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      sessionStatus: 'invalid',
    }
  }

  return {
    isAuthenticated: true,
    user,
    loading: false,
    error: null,
    sessionStatus: 'idle',
  }
}

const initialState: AuthState = {
  ...createInitialState(),
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue, dispatch }) => {
    try {
      const result = await authService.login(credentials)
      localStorage.setItem(AUTH_TOKEN_KEY, result.token)
      localStorage.setItem(AUTH_USERNAME_KEY, result.user.username)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user))
      void dispatch(fetchCommonCodes())
      return result
    } catch (error) {
      removeStoredAuth()
      const message = error instanceof Error ? error.message : 'Invalid username or password'
      if (typeof error === 'object' && error && 'message' in error) {
        return rejectWithValue(String(error.message))
      }
      return rejectWithValue(message)
    }
  }
)

export const validateAuthSession = createAsyncThunk(
  'auth/validateAuthSession',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentSession()
      localStorage.setItem(AUTH_USERNAME_KEY, user.username)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
      return user
    } catch (error) {
      removeStoredAuth()
      return rejectWithValue(error instanceof Error ? error.message : 'Authentication session is invalid')
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  removeStoredAuth()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.error = null
      state.sessionStatus = 'invalid'
      removeStoredAuth()
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.error = null
        state.sessionStatus = 'valid'
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.error = typeof action.payload === 'string'
          ? action.payload
          : 'Invalid username or password'
        state.sessionStatus = 'invalid'
      })
      .addCase(validateAuthSession.pending, (state) => {
        state.sessionStatus = 'checking'
      })
      .addCase(validateAuthSession.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload
        state.sessionStatus = 'valid'
        state.error = null
      })
      .addCase(validateAuthSession.rejected, (state, action) => {
        state.isAuthenticated = false
        state.user = null
        state.sessionStatus = 'invalid'
        state.error = typeof action.payload === 'string' ? action.payload : null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.error = null
        state.sessionStatus = 'invalid'
      })
  },
})

export const { logout, setLoading } = authSlice.actions
export default authSlice.reducer
