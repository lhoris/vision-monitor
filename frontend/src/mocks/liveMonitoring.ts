import type { Camera } from '@/types/camera'
import type { CameraPosition, Layout } from '@/types/layout'
import { buildCameraStreamPageUrl } from '@/streaming/config'

const DEFAULT_CAMERA_COUNT = 7

const defaultCameraPositions: CameraPosition[] = [
  { cameraId: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
  { cameraId: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
  { cameraId: 3, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
  { cameraId: 4, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
  { cameraId: 5, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
  { cameraId: 6, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
  { cameraId: 7, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
]

function cloneDefaultCameraPositions(): CameraPosition[] {
  return defaultCameraPositions.map((position) => ({ ...position }))
}

export function createMockCameras(count = DEFAULT_CAMERA_COUNT): Camera[] {
  return Array.from({ length: count }, (_, index) => {
    const cameraNumber = index + 1

    return {
      id: cameraNumber,
      name: `Camera ${cameraNumber}`,
      location: `Line A-${cameraNumber}`,
      zone: 'Zone 1',
      streamUrl: buildCameraStreamPageUrl(cameraNumber),
      streamProtocol: 'webrtc',
      status: 'online',
      resolution: '1920x1080',
      fps: 30,
    }
  })
}

export function createMockLayout(now = new Date().toISOString()): Layout {
  return {
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
            gridConfig: { rows: 3, cols: 3, layout: 'grid', gapSize: 8 },
            cameraPositions: cloneDefaultCameraPositions(),
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'subtab-2',
            name: 'Equipment 2',
            gridConfig: { rows: 3, cols: 3, layout: 'grid', gapSize: 8 },
            cameraPositions: cloneDefaultCameraPositions(),
            createdAt: now,
            updatedAt: now,
          },
        ],
        activeSubTab: 'subtab-1',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tab-2',
        name: 'Production Line B',
        subTabs: [
          {
            id: 'subtab-b-1',
            name: 'Equipment 1',
            gridConfig: { rows: 2, cols: 2, layout: 'grid', gapSize: 8 },
            cameraPositions: [
              { cameraId: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
              { cameraId: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
            ],
            createdAt: now,
            updatedAt: now,
          },
        ],
        activeSubTab: 'subtab-b-1',
        createdAt: now,
        updatedAt: now,
      },
    ],
    activeTab: 'tab-1',
    createdAt: now,
    updatedAt: now,
  }
}
