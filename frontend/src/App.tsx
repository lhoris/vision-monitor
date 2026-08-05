/**
 * Root Application Component
 */

import { Provider } from 'react-redux'
import { store } from '@/store'
import '@/styles/global.css'

// TODO: Phase 3에서 페이지/라우팅 구현

export function App() {
  return (
    <Provider store={store}>
      <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900">
        {/* TODO: Phase 3에서 Layout, Router, Pages 구현 */}
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Vision Monitor VMS
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Manufacturing AI Monitoring Dashboard
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-600 mt-4">
              Phase 2: Harness Engineering - Ready for Phase 3 Implementation
            </p>
          </div>
        </div>
      </div>
    </Provider>
  )
}

export default App
