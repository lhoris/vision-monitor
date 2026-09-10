/**
 * Layout Type Definitions
 * 개인화된 그리드 레이아웃 관련 타입
 */

import type { ThemeMode } from '@/store/slices/uiSlice'

export interface GridConfig {
  rows: number
  cols: number
  layout: 'grid' | 'custom' | 'focus'
  gapSize: number
}

export interface CameraPosition {
  cameraId: number
  row: number
  col: number
  rowSpan: number
  colSpan: number
  displayName?: string
  temporarySourceId?: string
  source?: {
    id: string
    url: string
    protocol: 'hls' | 'webrtc' | 'rtsp'
    displayName: string
    playbackStatus: 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'seeking'
  }
}

export interface SubTab {
  id: string
  name: string
  gridConfig: GridConfig
  cameraPositions: CameraPosition[]
  createdAt: string
  updatedAt: string
}

export interface Tab {
  id: string
  name: string
  subTabs: SubTab[]
  activeSubTab: string
  createdAt: string
  updatedAt: string
}

export interface Layout {
  id: number
  userId: number
  version?: number
  theme?: {
    mode: ThemeMode
  }
  tabs: Tab[]
  activeTab: string
  createdAt: string
  updatedAt: string
}

export interface LayoutState {
  layout: Layout | null
  loading: boolean
  error: string | null
  activeTab: string
  persistStatus: LayoutPersistStatus
  persistError: string | null
  restoredForUser: string | null
}

export type LayoutPersistStatus =
  | 'idle'
  | 'loading'
  | 'saving'
  | 'saved'
  | 'saveFailed'
  | 'restoreFailed'
