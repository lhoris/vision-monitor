/**
 * Live Monitoring Page
 */

import { useEffect } from 'react'
import { GridContainer } from '@/components/Grid'
import { useAppSelector, useAppDispatch } from '@/store'
import { fetchUserLayout } from '@/store/slices/layoutSlice'
import { createMockCameras, createMockLayout } from '@/mocks/liveMonitoring'

export function Live() {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((state) => state.layout.layout)
  const loading = useAppSelector((state) => state.layout.loading)
  const mockCameras = createMockCameras()

  useEffect(() => {
    if (!layout) {
      dispatch(fetchUserLayout.fulfilled(createMockLayout(), '', 1))
    }
  }, [dispatch, layout])

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
    <div className="flex-1 flex flex-col h-screen">
      <GridContainer userId={1} cameras={mockCameras} />
    </div>
  )
}

export default Live
