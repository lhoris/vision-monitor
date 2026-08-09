/**
 * Root Application Component
 * Pages & Events UI Implementation
 */

import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store'
import { AppLayout } from '@/components/Layout'
import Login from '@/pages/Login'
import Live from '@/pages/Live'
import Playback from '@/pages/Playback'
import Events from '@/pages/Events'
import Settings from '@/pages/Settings'
import { store } from '@/store'
import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import '@/styles/global.css'

function AppRoutes() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const themeMode = useAppSelector((state) => state.ui.themeMode)

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [themeMode])

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
        element={
          <AppLayout>
            <Navigate to="/live" replace />
          </AppLayout>
        }
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
        path="/playback"
        element={
          <AppLayout>
            <Playback />
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
