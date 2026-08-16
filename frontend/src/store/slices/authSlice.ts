/**
 * Redux Slice for Authentication State
 */

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { authService, type LoginCredentials } from '@/services/authService'

export interface User {
  id: number
  username: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await authService.login(credentials)
      localStorage.setItem('authToken', result.token)
      return result
    } catch (error) {
      localStorage.removeItem('authToken')
      const message = error instanceof Error ? error.message : 'Invalid username or password'
      if (typeof error === 'object' && error && 'message' in error) {
        return rejectWithValue(String(error.message))
      }
      return rejectWithValue(message)
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  localStorage.removeItem('authToken')
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.error = null
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.error = typeof action.payload === 'string'
          ? action.payload
          : 'Invalid username or password'
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.error = null
      })
  },
})

export const { logout, setLoading } = authSlice.actions
export default authSlice.reducer
