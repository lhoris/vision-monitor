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
import { addEvent, fetchPersistedAlarms } from '@/store/slices/eventSlice'
import { hasAdminAccess, logout, passwordChangeCompleted, validateAuthSession } from '@/store/slices/authSlice'
import { I18nextProvider } from 'react-i18next'
import i18n, { getUserLanguage } from '@/i18n'
import { Modal } from '@/components/Common'
import { SESSION_EXPIRED_EVENT } from '@/services/api'
import { subscribeToAlarmStream } from '@/services/alarmSseService'
import { authService } from '@/services/authService'
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
  const passwordChangeRequired = useAppSelector((state) => state.auth.passwordChangeRequired)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [passwordChangeNotice, setPasswordChangeNotice] = useState('')
  const alarmFetchStarted = useRef(false)
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
    if (isAuthenticated && sessionStatus === 'valid' && commonCodeStatus === 'idle') {
      void dispatch(fetchCommonCodes())
    }
  }, [commonCodeStatus, dispatch, isAuthenticated, sessionStatus])

  useEffect(() => {
    if (isAuthenticated && sessionStatus === 'idle') {
      void dispatch(validateAuthSession())
    }
  }, [dispatch, isAuthenticated, sessionStatus])

  useEffect(() => {
    if (!passwordChangeNotice) return undefined
    const timeoutId = window.setTimeout(() => setPasswordChangeNotice(''), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [passwordChangeNotice])

  useEffect(() => {
    if (!isAuthenticated || sessionStatus !== 'valid') {
      alarmFetchStarted.current = false
      return
    }
    if (!alarmFetchStarted.current) {
      alarmFetchStarted.current = true
      void dispatch(fetchPersistedAlarms())
    }
  }, [dispatch, isAuthenticated, sessionStatus])

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
    <>
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
      {passwordChangeNotice ? <div role="status" className="animate-toast-in-out fixed right-6 top-20 z-[90] rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200">{passwordChangeNotice}</div> : null}
      <PasswordChangeRequiredModal isOpen={passwordChangeRequired} onCompleted={() => setPasswordChangeNotice('비밀번호가 변경되었습니다.')} />
    </>
  )
}

function PasswordChangeRequiredModal({ isOpen, onCompleted }: { isOpen: boolean; onCompleted: () => void }) {
  const dispatch = useAppDispatch()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    setError('')
    if (newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    setSaving(true)
    try {
      await authService.changePassword(newPassword)
      dispatch(passwordChangeCompleted())
      setNewPassword('')
      setConfirmPassword('')
      onCompleted()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '비밀번호 변경에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return <Modal isOpen={isOpen} onClose={() => undefined} dismissible={false} title="비밀번호 변경" className="max-w-md"><p className="text-sm text-slate-600 dark:text-slate-300">관리자가 비밀번호를 초기화했습니다. 새 비밀번호를 설정해 주세요.</p><div className="mt-4 space-y-3"><div className="relative"><input aria-label="새 비밀번호" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="새 비밀번호" className="w-full border px-3 py-2 pr-10 dark:bg-slate-900" /><button type="button" aria-label="새 비밀번호 표시" onPointerDown={(event) => { event.preventDefault(); setShowNewPassword(true) }} onPointerUp={() => setShowNewPassword(false)} onPointerLeave={() => setShowNewPassword(false)} onPointerCancel={() => setShowNewPassword(false)} onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); setShowNewPassword(true) } }} onKeyUp={() => setShowNewPassword(false)} onBlur={() => setShowNewPassword(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" />{!showNewPassword ? <path d="m3 3 18 18" /> : null}</svg></button></div><div className="relative"><input aria-label="새 비밀번호 확인" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="새 비밀번호 확인" className="w-full border px-3 py-2 pr-10 dark:bg-slate-900" /><button type="button" aria-label="새 비밀번호 확인 표시" onPointerDown={(event) => { event.preventDefault(); setShowConfirmPassword(true) }} onPointerUp={() => setShowConfirmPassword(false)} onPointerLeave={() => setShowConfirmPassword(false)} onPointerCancel={() => setShowConfirmPassword(false)} onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); setShowConfirmPassword(true) } }} onKeyUp={() => setShowConfirmPassword(false)} onBlur={() => setShowConfirmPassword(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" />{!showConfirmPassword ? <path d="m3 3 18 18" /> : null}</svg></button></div>{error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}<button type="button" onClick={() => void submit()} disabled={saving} className="w-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? '저장 중...' : '비밀번호 저장'}</button></div></Modal>
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
