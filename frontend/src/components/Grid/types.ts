/**
 * Grid Component Types
 */

export interface GridDimensions {
  rows: number
  cols: number
  label: string
}

export interface DraggableItem {
  type: 'cell'
  cellId: string
  cameraId?: number
}

export interface CellPosition {
  id: string
  row: number
  col: number
  camera?: {
    id: number
    name: string
    location: string
  }
}
