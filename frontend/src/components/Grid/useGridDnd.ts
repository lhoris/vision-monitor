/**
 * Grid camera position helpers.
 *
 * The current grid uses native HTML5 drag/drop in DraggableCell, so this file
 * intentionally avoids a dependency on a specific drag/drop library.
 */

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { updateCameraPositions } from '@/store/slices/layoutSlice'
import type { CameraPosition } from '@/types/layout'

export interface CellCoordinates {
  row: number
  col: number
}

export function resizeCameraPosition(
  positions: CameraPosition[],
  cameraId: number,
  rowSpan: number,
  colSpan: number,
  rows: number,
  cols: number
): CameraPosition[] {
  const target = positions.find((position) => position.cameraId === cameraId)
  if (!target || rowSpan < 1 || colSpan < 1 || target.row + rowSpan > rows || target.col + colSpan > cols) {
    return positions
  }

  const overlaps = (position: CameraPosition) => {
    if (position.cameraId === cameraId) return false
    const otherRowSpan = position.rowSpan || 1
    const otherColSpan = position.colSpan || 1
    return target.row < position.row + otherRowSpan && target.row + rowSpan > position.row &&
      target.col < position.col + otherColSpan && target.col + colSpan > position.col
  }

  return positions
    .filter((position) => !overlaps(position))
    .map((position) => position.cameraId === cameraId
      ? { ...position, rowSpan, colSpan }
      : position)
}

export function getCellCoordinates(cellIndex: number, colsPerRow: number): CellCoordinates {
  return {
    row: Math.floor(cellIndex / colsPerRow),
    col: cellIndex % colsPerRow,
  }
}

export type CameraMoveFailureReason =
  | 'merged-source-target'
  | 'merged-target'
  | 'occupied-target'
  | 'out-of-bounds'
  | 'overlapping-target'

export function getCameraMoveFailureReason(
  positions: CameraPosition[],
  cameraId: number,
  targetCellIndex: number,
  colsPerRow: number,
  rowsPerGrid = Number.POSITIVE_INFINITY
): CameraMoveFailureReason | null {
  const target = getCellCoordinates(targetCellIndex, colsPerRow)
  const draggedCameraPosition = positions.find((position) => position.cameraId === cameraId)
  if (!draggedCameraPosition) return null

  const targetCameraPosition = positions.find(
    (position) =>
      position.row === target.row &&
      position.col === target.col &&
      position.cameraId !== cameraId
  )
  const draggedRowSpan = draggedCameraPosition.rowSpan || 1
  const draggedColSpan = draggedCameraPosition.colSpan || 1
  const shouldUnmerge = !targetCameraPosition && (draggedRowSpan > 1 || draggedColSpan > 1)
  const nextRowSpan = shouldUnmerge ? 1 : draggedRowSpan
  const nextColSpan = shouldUnmerge ? 1 : draggedColSpan

  if (targetCameraPosition) {
    if (draggedRowSpan !== 1 || draggedColSpan !== 1) return 'merged-source-target'
    if ((targetCameraPosition.rowSpan || 1) !== 1 || (targetCameraPosition.colSpan || 1) !== 1) return 'merged-target'
    return null
  }

  if (target.row >= rowsPerGrid || target.col >= colsPerRow) return 'out-of-bounds'

  const overlaps = positions.some((position) => {
    if (position.cameraId === cameraId) return false
    return target.row < position.row + (position.rowSpan || 1) &&
      target.row + nextRowSpan > position.row &&
      target.col < position.col + (position.colSpan || 1) &&
      target.col + nextColSpan > position.col
  })
  return overlaps ? 'overlapping-target' : null
}

export function moveCameraPosition(
  positions: CameraPosition[],
  cameraId: number,
  targetCellIndex: number,
  colsPerRow: number,
  rowsPerGrid = Number.POSITIVE_INFINITY
): CameraPosition[] {
  const target = getCellCoordinates(targetCellIndex, colsPerRow)
  const draggedCameraPosition = positions.find((position) => position.cameraId === cameraId)

  if (!draggedCameraPosition) {
    return positions
  }

  const targetCameraPosition = positions.find(
    (position) =>
      position.row === target.row &&
      position.col === target.col &&
      position.cameraId !== cameraId
  )

  const draggedRowSpan = draggedCameraPosition.rowSpan || 1
  const draggedColSpan = draggedCameraPosition.colSpan || 1
  const failureReason = getCameraMoveFailureReason(
    positions,
    cameraId,
    targetCellIndex,
    colsPerRow,
    rowsPerGrid
  )
  if (failureReason) return positions
  const shouldUnmerge = !targetCameraPosition && (draggedRowSpan > 1 || draggedColSpan > 1)

  return positions.map((position) => {
    if (position.cameraId === cameraId) {
      return {
        ...position,
        row: target.row,
        col: target.col,
        ...(shouldUnmerge ? { rowSpan: 1, colSpan: 1 } : {}),
      }
    }

    if (targetCameraPosition && position.cameraId === targetCameraPosition.cameraId) {
      return { ...position, row: draggedCameraPosition.row, col: draggedCameraPosition.col }
    }

    return position
  })
}

export function placeCameraAtCell(
  positions: CameraPosition[],
  cameraId: number,
  targetCellIndex: number,
  colsPerRow: number
): CameraPosition[] {
  const target = getCellCoordinates(targetCellIndex, colsPerRow)
  const nextPosition: CameraPosition = {
    cameraId,
    row: target.row,
    col: target.col,
    rowSpan: 1,
    colSpan: 1,
  }

  const existingIndex = positions.findIndex(
    (position) => position.row === target.row && position.col === target.col
  )

  if (existingIndex === -1) {
    return [...positions, nextPosition]
  }

  return positions.map((position, index) => (index === existingIndex ? nextPosition : position))
}

export function removeCameraPosition(
  positions: CameraPosition[],
  cameraId: number
): CameraPosition[] {
  const index = positions.findIndex((position) => position.cameraId === cameraId)
  if (index === -1) return positions
  return positions.filter((_, positionIndex) => positionIndex !== index)
}

export function useGridDnd() {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((state) => state.layout.layout)
  const activeTabId = useAppSelector((state) => state.layout.activeTab)
  const activeTab = layout?.tabs.find((tab) => tab.id === activeTabId)
  const activeSubTab = activeTab?.subTabs.find((subTab) => subTab.id === activeTab.activeSubTab)

  const moveCamera = useCallback(
    (cameraId: number, targetCellIndex: number) => {
      if (!activeTab || !activeSubTab) return

      dispatch(updateCameraPositions({
        tabId: activeTab.id,
        subTabId: activeSubTab.id,
        positions: moveCameraPosition(
          activeSubTab.cameraPositions,
          cameraId,
          targetCellIndex,
          activeSubTab.gridConfig.cols
        ),
      }))
    },
    [activeTab, activeSubTab, dispatch]
  )

  const removeCamera = useCallback(
    (cameraId: number) => {
      if (!activeTab || !activeSubTab) return

      dispatch(updateCameraPositions({
        tabId: activeTab.id,
        subTabId: activeSubTab.id,
        positions: removeCameraPosition(activeSubTab.cameraPositions, cameraId),
      }))
    },
    [activeTab, activeSubTab, dispatch]
  )

  return {
    moveCamera,
    removeCamera,
  }
}
