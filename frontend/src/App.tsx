/**
 * Root Application Component
 * Pages & Events UI Implementation
 */

import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { AppLayout } from '@/components/Layout'
import Login from '@/pages/Login'
import Live from '@/pages/Live'
import CameraFocus from '@/pages/CameraFocus'
import RecordingEntry from '@/pages/RecordingEntry'
import Events from '@/pages/Events'
import Settings from '@/pages/Settings'
import AdminPlaceholder from '@/pages/AdminPlaceholder'
import { VideoManagement } from '@/pages/VideoManagement'
import { store } from '@/store'
import { useEffect, useRef } from 'react'
import { fetchCommonCodes } from '@/store/slices/commonCodeSlice'
import { fetchEvents } from '@/store/slices/eventSlice'
import { hasAdminAccess, validateAuthSession } from '@/store/slices/authSlice'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import '@/styles/global.css'
import '@/styles/custom-theme.css'

export function AppRoutes() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const user = useAppSelector((state) => state.auth.user)
  const themeMode = useAppSelector((state) => state.ui.themeMode)
  const commonCodeStatus = useAppSelector((state) => state.commonCode.status)
  const sessionStatus = useAppSelector((state) => state.auth.sessionStatus)
  const eventFetchStarted = useRef(false)
  const canAccessAdminRoutes = hasAdminAccess(user)

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode

    if (themeMode === 'theme2' || themeMode === 'theme3') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [themeMode])

  useEffect(() => {
    if (isAuthenticated && commonCodeStatus === 'idle') {
      void dispatch(fetchCommonCodes())
    }
  }, [commonCodeStatus, dispatch, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && sessionStatus === 'idle') {
      void dispatch(validateAuthSession())
    }
  }, [dispatch, isAuthenticated, sessionStatus])

  useEffect(() => {
    if (!isAuthenticated) {
      eventFetchStarted.current = false
      return
    }
    if (!eventFetchStarted.current) {
      eventFetchStarted.current = true
      void dispatch(fetchEvents({ page: 0, pageSize: 100 }))
    }
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/live" replace />}
      />
      <Route
        path="/live"
        element={
          <AppLayout>
            <Live />
          </AppLayout>
        }
      />
      <Route
        path="/live/cameras/:cameraId"
        element={
          <AppLayout>
            <CameraFocus />
          </AppLayout>
        }
      />
      <Route
        path="/playback"
        element={
          <AppLayout>
            <RecordingEntry />
          </AppLayout>
        }
      />
      <Route
        path="/events"
        element={
          <AppLayout>
            <Events />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <Settings />
          </AppLayout>
        }
      />
      <Route
        path="/admin/videos"
        element={canAccessAdminRoutes ? (
          <AppLayout>
            <VideoManagement />
          </AppLayout>
        ) : (
          <Navigate to="/live" replace />
        )}
      />
      <Route
        path="/admin/*"
        element={canAccessAdminRoutes ? (
          <AppLayout>
            <AdminPlaceholder />
          </AppLayout>
        ) : (
          <Navigate to="/live" replace />
        )}
      />
      <Route path="*" element={<Navigate to="/live" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <Router>
          <AppRoutes />
        </Router>
      </Provider>
    </I18nextProvider>
  )
}

export default App
