/**
 * Live Monitoring Page
 */

import { useEffect } from 'react'
import { GridContainer } from '@/components/Grid'
import { useAppSelector, useAppDispatch } from '@/store'
import { fetchMyLayout } from '@/store/slices/layoutSlice'
import { createMockCameras } from '@/mocks/liveMonitoring'
import { usePersistLayout } from '@/hooks/usePersistLayout'
import LayoutPersistStatus from '@/components/Grid/LayoutPersistStatus'

export function Live() {
  const dispatch = useAppDispatch()
  const username = useAppSelector((state) => state.auth.user?.username)
  const restoredForUser = useAppSelector((state) => state.layout.restoredForUser)
  const loading = useAppSelector((state) => state.layout.loading)
  const mockCameras = createMockCameras()
  usePersistLayout()

  useEffect(() => {
    if (username && restoredForUser !== username) {
      dispatch(fetchMyLayout(username))
    }
  }, [dispatch, restoredForUser, username])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading layout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 flex flex-col h-screen">
      <LayoutPersistStatus />
      <GridContainer cameras={mockCameras} />
    </div>
  )
}

export default Live
