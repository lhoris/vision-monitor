/**
 * Live Monitoring Page
 * 개인화 그리드 대시보드
 */

import React, { useEffect } from 'react'
import { GridContainer } from '@/components/Grid'
import { useAppSelector, useAppDispatch } from '@/store'
import { fetchUserLayout } from '@/store/slices/layoutSlice'
import type { Camera } from '@/types/camera'

export function Live() {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((state) => state.layout.layout)
  const loading = useAppSelector((state) => state.layout.loading)

  // Mock cameras data - 실제 구현에서는 API에서 가져옴
  const mockCameras: Camera[] = [
    {
      id: 1,
      name: 'Camera 1',
      location: 'Area A',
      zone: 'Zone 1',
      streamUrl: 'rtsp://example.com/stream1',
      status: 'online',
      resolution: '1920x1080',
      fps: 30,
    },
    {
      id: 2,
      name: 'Camera 2',
      location: 'Area B',
      zone: 'Zone 2',
      streamUrl: 'rtsp://example.com/stream2',
      status: 'online',
      resolution: '1920x1080',
      fps: 30,
    },
    {
      id: 3,
      name: 'Camera 3',
      location: 'Area C',
      zone: 'Zone 3',
      streamUrl: 'rtsp://example.com/stream3',
      status: 'offline',
      resolution: '1920x1080',
      fps: 30,
    },
    {
      id: 4,
      name: 'Camera 4',
      location: 'Area D',
      zone: 'Zone 4',
      streamUrl: 'rtsp://example.com/stream4',
      status: 'online',
      resolution: '1920x1080',
      fps: 30,
    },
    {
      id: 5,
      name: 'Camera 5',
      location: 'Area E',
      zone: 'Zone 5',
      streamUrl: 'rtsp://example.com/stream5',
      status: 'online',
      resolution: '1920x1080',
      fps: 30,
    },
    {
      id: 6,
      name: 'Camera 6',
      location: 'Area F',
      zone: 'Zone 6',
      streamUrl: 'rtsp://example.com/stream6',
      status: 'error',
      resolution: '1920x1080',
      fps: 30,
    },
  ]

  // 사용자 레이아웃 초기화 (실제 구현에서는 실제 userId 사용)
  useEffect(() => {
    const userId = 1 // Mock user ID
    if (!layout && !loading) {
      dispatch(fetchUserLayout(userId))
    }
  }, [dispatch, layout, loading])

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
