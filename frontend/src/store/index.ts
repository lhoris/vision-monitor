/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'

// Slices
import layoutReducer from './slices/layoutSlice'
import cameraReducer from './slices/cameraSlice'
import eventReducer from './slices/eventSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    camera: cameraReducer,
    event: eventReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 비직렬화 가능한 데이터(Date 등)를 포함하는 액션/상태 경로 무시
        ignoredActions: [
          'layout/fetchUserLayout/fulfilled',
          'event/fetchEvents/fulfilled',
          'event/fetchCameraEvents/fulfilled',
          'event/fetchAlertSettings/fulfilled',
        ],
        ignoredPaths: ['layout.layout', 'event.events', 'event.alertSettings'],
      },
    }),
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/**
 * Type-safe hooks for Redux
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
