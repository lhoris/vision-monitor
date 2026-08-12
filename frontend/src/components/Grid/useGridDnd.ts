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
  colsPerRow: number
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
