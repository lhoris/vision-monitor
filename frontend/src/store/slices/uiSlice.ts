/**
 * Redux Slice for UI State
 * Phase 3에서 구현
 */

import { createSlice } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  themeMode: 'light' | 'dark'
  notifications: any[]
  modal: {
    isOpen: boolean
    type: string | null
    data?: any
  }
}

const initialState: UIState = {
  sidebarOpen: true,
  themeMode: 'dark',
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // TODO: Phase 3에서 구현
  },
})

export default uiSlice.reducer
