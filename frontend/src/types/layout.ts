/**
 * Layout Type Definitions
 * 개인화된 그리드 레이아웃 관련 타입
 */

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
}

export interface Tab {
  id: string
  name: string
  cameras: number[]
  gridConfig: GridConfig
  cameraPositions: CameraPosition[]
  createdAt: Date
  updatedAt: Date
}

export interface Layout {
  id: number
  userId: number
  tabs: Tab[]
  activeTab: string
  createdAt: Date
  updatedAt: Date
}

export interface LayoutState {
  layout: Layout | null
  loading: boolean
  error: string | null
  activeTab: string
}
