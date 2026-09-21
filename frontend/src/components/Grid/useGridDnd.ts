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
  if (targetCameraPosition) {
    if (draggedRowSpan !== 1 || draggedColSpan !== 1 ||
      (targetCameraPosition.rowSpan || 1) !== 1 || (targetCameraPosition.colSpan || 1) !== 1) {
      return positions
    }
  } else {
    if (target.row + draggedRowSpan > rowsPerGrid || target.col + draggedColSpan > colsPerRow) {
      return positions
    }
    const overlaps = positions.some((position) => {
      if (position.cameraId === cameraId) return false
      return target.row < position.row + (position.rowSpan || 1) &&
        target.row + draggedRowSpan > position.row &&
        target.col < position.col + (position.colSpan || 1) &&
        target.col + draggedColSpan > position.col
    })
    if (overlaps) return positions
  }

  return positions.map((position) => {
    if (position.cameraId === cameraId) {
      return { ...position, row: target.row, col: target.col }
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
  return positions.filter((position) => position.cameraId !== cameraId)
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
