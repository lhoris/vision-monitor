/**
 * Root Application Component
 * Pages & Events UI Implementation
 */

import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { store } from '@/store'
import { AppLayout } from '@/components/Layout'
import Live from '@/pages/Live'
import Playback from '@/pages/Playback'
import Events from '@/pages/Events'
import Settings from '@/pages/Settings'
import '@/styles/global.css'

export function App() {
  return (
    <Provider store={store}>
      <Router>
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
      </Router>
    </Provider>
  )
}

export default App
