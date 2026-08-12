import { describe, expect, it } from 'vitest'
import {
  getCellCoordinates,
  moveCameraPosition,
  placeCameraAtCell,
  removeCameraPosition,
} from '../useGridDnd'
import type { CameraPosition } from '@/types/layout'

const positions: CameraPosition[] = [
  { cameraId: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
  { cameraId: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
]

describe('grid position helpers', () => {
  it('calculates row and column from cell index', () => {
    expect(getCellCoordinates(5, 3)).toEqual({ row: 1, col: 2 })
  })

  it('moves a camera to an empty cell', () => {
    expect(moveCameraPosition(positions, 1, 5, 3)).toEqual([
      { cameraId: 1, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
      { cameraId: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
    ])
  })

  it('swaps cameras when dropping on an occupied cell', () => {
    expect(moveCameraPosition(positions, 1, 1, 3)).toEqual([
      { cameraId: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { cameraId: 2, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
    ])
  })

  it('returns the same positions when dragged camera is missing', () => {
    expect(moveCameraPosition(positions, 9, 1, 3)).toBe(positions)
  })

  it('places a camera in an empty cell', () => {
    expect(placeCameraAtCell(positions, 3, 3, 3)).toEqual([
      ...positions,
      { cameraId: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
    ])
  })

  it('replaces an existing camera in the selected cell', () => {
    expect(placeCameraAtCell(positions, 3, 1, 3)).toEqual([
      { cameraId: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { cameraId: 3, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
    ])
  })

  it('removes a camera position by camera id', () => {
    expect(removeCameraPosition(positions, 1)).toEqual([
      { cameraId: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
    ])
  })
})
