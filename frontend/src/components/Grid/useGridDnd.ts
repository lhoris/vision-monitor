/**
 * Custom Hook for Grid Drag & Drop
 */

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { updateCameraPositions } from '@/store/slices/layoutSlice'
import type { DropResult } from 'react-beautiful-dnd'
import type { CameraPosition } from '@/types/layout'

export function useGridDnd() {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((state) => state.layout.layout)
  const activeTabId = useAppSelector((state) => state.layout.activeTab)

  /**
   * 드래그 & 드롭 완료 처리
   */
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result

      // 목적지가 없으면 드롭 취소
      if (!destination) return

      // 같은 위치에 드롭되면 무시
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return
      }

      if (!layout) return

      const activeTab = layout.tabs.find((tab) => tab.id === activeTabId)
      if (!activeTab) return

      // 드롭된 카메라 찾기 (draggableId는 "camera-{id}" 형식)
      const cameraIdFromDraggable = parseInt(draggableId.replace('camera-', ''))
      const draggedCamera = activeTab.cameraPositions.find(
        (pos) => pos.cameraId === cameraIdFromDraggable
      )

      if (!draggedCamera) return

      // 카메라 위치 업데이트
      const updatedPositions: CameraPosition[] = activeTab.cameraPositions.map((pos) => {
        if (pos.cameraId === cameraIdFromDraggable) {
          // 목적지 셀의 행/열 계산
          const colsPerRow = activeTab.gridConfig.cols
          const destIndex = destination.index
          const row = Math.floor(destIndex / colsPerRow)
          const col = destIndex % colsPerRow

          return {
            ...pos,
            row,
            col,
          }
        }
        return pos
      }) as CameraPosition[]

      dispatch(updateCameraPositions({ tabId: activeTabId, positions: updatedPositions }))
    },
    [dispatch, layout, activeTabId]
  )

  /**
   * 카메라를 특정 셀로 이동
   */
  const moveCamera = useCallback(
    (cameraId: number, row: number, col: number) => {
      if (!layout) return

      const activeTab = layout.tabs.find((tab) => tab.id === activeTabId)
      if (!activeTab) return

      const updatedPositions: CameraPosition[] = activeTab.cameraPositions.map((pos) => {
        if (pos.cameraId === cameraId) {
          return {
            ...pos,
            row,
            col,
          }
        }
        return pos
      })

      dispatch(updateCameraPositions({ tabId: activeTabId, positions: updatedPositions }))
    },
    [dispatch, layout, activeTabId]
  )

  /**
   * 카메라 제거
   */
  const removeCamera = useCallback(
    (cameraId: number) => {
      if (!layout) return

      const activeTab = layout.tabs.find((tab) => tab.id === activeTabId)
      if (!activeTab) return

      const updatedPositions = activeTab.cameraPositions.filter(
        (pos) => pos.cameraId !== cameraId
      )

      dispatch(updateCameraPositions({ tabId: activeTabId, positions: updatedPositions }))
    },
    [dispatch, layout, activeTabId]
  )

  return {
    handleDragEnd,
    moveCamera,
    removeCamera,
  }
}
