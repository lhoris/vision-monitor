/**
 * Redux Slice for Authentication State
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: number
  username: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; password: string }>) => {
      if (action.payload.username === 'tester' && action.payload.password === 'tester123') {
        state.isAuthenticated = true
        state.user = {
          id: 1,
          username: action.payload.username,
        }
      }
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { login, logout, setLoading } = authSlice.actions
export default authSlice.reducer
