/**
 * Root Application Component
 * Pages & Events UI Implementation
 */

import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
import { useEffect, useRef, useState } from 'react'
import { fetchCommonCodes } from '@/store/slices/commonCodeSlice'
import { addEvent, fetchEvents } from '@/store/slices/eventSlice'
import { hasAdminAccess, logout, validateAuthSession } from '@/store/slices/authSlice'
import { I18nextProvider } from 'react-i18next'
import i18n, { getUserLanguage } from '@/i18n'
import { Modal } from '@/components/Common'
import { SESSION_EXPIRED_EVENT } from '@/services/api'
import { subscribeToAlarmStream } from '@/services/alarmSseService'
import { useTranslation } from 'react-i18next'
import '@/styles/global.css'
import '@/styles/custom-theme.css'

export function AppRoutes() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const user = useAppSelector((state) => state.auth.user)
  const themeMode = useAppSelector((state) => state.ui.themeMode)
  const commonCodeStatus = useAppSelector((state) => state.commonCode.status)
  const sessionStatus = useAppSelector((state) => state.auth.sessionStatus)
  const [sessionExpired, setSessionExpired] = useState(false)
  const eventFetchStarted = useRef(false)
  const canAccessAdminRoutes = hasAdminAccess(user)

  useEffect(() => {
    const handleSessionExpired = () => {
      // 로그인 화면에 이미 진입한 뒤 도착한 이전 요청의 401은 안내하지 않는다.
      // 로그인 화면에서는 로그인 실패 메시지와 세션 만료 안내를 혼동하지 않게 한다.
      if (window.location.pathname === '/login') return
      dispatch(logout())
      setSessionExpired(true)
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [dispatch])

  const moveToLogin = () => {
    setSessionExpired(false)
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    const language = getUserLanguage(user?.username)
    if (i18n.language !== language) {
      void i18n.changeLanguage(language)
    }
  }, [user?.username])

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

  useEffect(() => {
    if (!isAuthenticated || sessionStatus !== 'valid') return undefined

    const subscription = subscribeToAlarmStream((alarm) => {
      if (import.meta.env.DEV) {
        console.info('[Alarm SSE] received', {
          id: alarm.id,
          modelProcessId: alarm.modelProcessId,
          cameraId: alarm.cameraId,
          description: alarm.description,
        })
      }
      dispatch(addEvent({
        ...alarm,
        cameraId: alarm.cameraId == null ? 0 : Number(alarm.cameraId),
        modelProcessId: alarm.modelProcessId == null ? null : Number(alarm.modelProcessId),
        timestamp: alarm.timestamp instanceof Date ? alarm.timestamp : new Date(alarm.timestamp),
      }))
    })

    return subscription.unsubscribe
  }, [dispatch, isAuthenticated, sessionStatus])

  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Modal isOpen={sessionExpired} title={t('sessionExpired.title')} onClose={moveToLogin} className="max-w-md">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{t('sessionExpired.message')}</p>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={moveToLogin} className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              {t('sessionExpired.confirm')}
            </button>
          </div>
        </Modal>
      </>
    )
  }

  if (sessionStatus !== 'valid') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-300">
        세션을 확인하는 중입니다.
      </div>
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
