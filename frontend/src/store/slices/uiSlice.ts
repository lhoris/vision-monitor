/**
 * Redux Slice for UI State
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface UIState {
  sidebarOpen: boolean
  themeMode: 'light' | 'dark'
  notifications: Notification[]
  modal: {
    isOpen: boolean
    type: string | null
    data?: unknown
  }
  selectedTab: string
}

const initialState: UIState = {
  sidebarOpen: false,
  themeMode: 'dark',
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
  },
  selectedTab: '',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.themeMode = action.payload
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      )
    },
    openModal: (
      state,
      action: PayloadAction<{ type: string; data?: any }>
    ) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data,
      }
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
      }
    },
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light'
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    setSelectedTab: (state, action: PayloadAction<string>) => {
      state.selectedTab = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setThemeMode,
  addNotification,
  removeNotification,
  openModal,
  closeModal,
  toggleTheme,
  clearNotifications,
  setSelectedTab,
} = uiSlice.actions

export default uiSlice.reducer
