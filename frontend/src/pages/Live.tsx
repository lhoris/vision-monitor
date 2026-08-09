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
  // 테스트용 공개 HLS 스트림: Apple BipBop (CORS 지원)
  const testStreamUrl = 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8'

  const mockCameras: Camera[] = [
    {
      id: 1,
      name: 'Test Camera 1',
      location: 'Test Area',
      zone: 'Zone 1',
      streamUrl: testStreamUrl,
      status: 'online',
      resolution: '1920x1080',
      fps: 24,
    },
  ]

  // Mock 레이아웃 데이터 (Backend 없이 테스트용)
  useEffect(() => {
    if (!layout) {
      const mockLayout = {
        id: 1,
        userId: 1,
        tabs: [
          {
            id: 'tab-1',
            name: 'Production Line A',
            subTabs: [
              {
                id: 'subtab-1',
                name: 'Equipment 1',
                gridConfig: { rows: 3, cols: 2, layout: 'grid', gapSize: 8 },
                cameraPositions: [
                  { cameraId: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
                  { cameraId: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
                  { cameraId: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
                  { cameraId: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
                  { cameraId: 5, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
                  { cameraId: 6, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            activeSubTab: 'subtab-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'tab-2',
            name: 'Production Line B',
            subTabs: [
              {
                id: 'subtab-2',
                name: 'Equipment 1',
                gridConfig: { rows: 2, cols: 2, layout: 'grid', gapSize: 8 },
                cameraPositions: [
                  { cameraId: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
                  { cameraId: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            activeSubTab: 'subtab-2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        activeTab: 'tab-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Redux에 mock 레이아웃 저장
      dispatch({
        type: 'layout/fetchUserLayout/fulfilled',
        payload: mockLayout,
      })
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
