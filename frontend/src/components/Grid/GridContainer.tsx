/**
 * Grid Container Component (2중 탭 구조)
 * 공정(상위탭) > 설비(하위탭) > 그리드 레이아웃
 */

import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  setActiveTab,
  setActiveSubTab,
  addTab,
  removeTab,
  reorderTabs,
  addSubTab,
  removeSubTab,
  reorderSubTabs,
  updateCameraPositions,
} from '@/store/slices/layoutSlice'
import TabsBar from './TabsBar'
import SubTabsBar from './SubTabsBar'
import LayoutSelector from './LayoutSelector'
import DraggableCell from './DraggableCell'
import CameraSelector from './CameraSelector'
import { useGridLayout } from './useGridLayout'
import type { Tab, SubTab } from '@/types/layout'
import type { Camera } from '@/types/camera'

interface GridContainerProps {
  userId?: number
  cameras?: Camera[]
}

export const GridContainer: React.FC<GridContainerProps> = ({ userId = 1, cameras = [] }) => {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((state) => state.layout.layout)
  const activeTabId = useAppSelector((state) => state.layout.activeTab)
  const {
    gridOptions,
    handleChangeGridLayout,
    getCurrentGridLabel,
    activeTab,
    activeSubTab,
  } = useGridLayout()

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  const [showCameraSelector, setShowCameraSelector] = useState(false)
  const [usedCameraIds, setUsedCameraIds] = useState<number[]>([])
  const [draggedCameraId, setDraggedCameraId] = useState<number | null>(null)

  // 사용 중인 카메라 ID 추적
  useEffect(() => {
    if (activeSubTab) {
      const used = activeSubTab.cameraPositions.map((pos) => pos.cameraId)
      setUsedCameraIds(used)
    }
  }, [activeSubTab])

  const handleAddCamera = (cellId: string) => {
    setSelectedCellId(cellId)
    setShowCameraSelector(true)
  }

  const handleDragStart = (cameraId: number) => {
    setDraggedCameraId(cameraId)
  }

  const handleDrop = (cellIndex: number) => {
    if (!draggedCameraId || !activeTab?.activeSubTab || !activeTabId) return

    const colsPerRow = activeSubTab!.gridConfig.cols
    const targetRow = Math.floor(cellIndex / colsPerRow)
    const targetCol = cellIndex % colsPerRow

    // 드래그 소스 카메라의 현재 위치 찾기
    const draggedCameraPos = activeSubTab!.cameraPositions.find(
      (pos) => pos.cameraId === draggedCameraId
    )
    if (!draggedCameraPos) {
      setDraggedCameraId(null)
      return
    }

    // 드롭 위치에 이미 있는 카메라 찾기
    const targetCameraPos = activeSubTab!.cameraPositions.find(
      (pos) =>
        pos.row === targetRow && pos.col === targetCol && pos.cameraId !== draggedCameraId
    )

    // 위치 교환하기
    const updatedPositions = activeSubTab!.cameraPositions.map((pos) => {
      if (pos.cameraId === draggedCameraId) {
        return { ...pos, row: targetRow, col: targetCol }
      }
      if (targetCameraPos && pos.cameraId === targetCameraPos.cameraId) {
        return { ...pos, row: draggedCameraPos.row, col: draggedCameraPos.col }
      }
      return pos
    })

    dispatch(
      updateCameraPositions({
        tabId: activeTabId,
        subTabId: activeTab.activeSubTab,
        positions: updatedPositions,
      })
    )
    setDraggedCameraId(null)
  }

  const removeCamera = (cameraId: number) => {
    if (!activeTabId || !activeTab?.activeSubTab) return
    const updatedPositions = activeSubTab!.cameraPositions.filter(
      (pos) => pos.cameraId !== cameraId
    )
    dispatch(
      updateCameraPositions({
        tabId: activeTabId,
        subTabId: activeTab.activeSubTab,
        positions: updatedPositions,
      })
    )
  }

  const handleSelectCamera = (camera: Camera) => {
    if (!selectedCellId || !activeTabId || !activeTab?.activeSubTab) return

    const cellIndex = parseInt(selectedCellId.split('-')[1])
    const colsPerRow = activeSubTab!.gridConfig.cols
    const row = Math.floor(cellIndex / colsPerRow)
    const col = cellIndex % colsPerRow

    const newPosition = {
      cameraId: camera.id,
      row,
      col,
      rowSpan: 1,
      colSpan: 1,
    }

    const existingIndex = activeSubTab!.cameraPositions.findIndex(
      (pos) => pos.row === row && pos.col === col
    )

    let updatedPositions = [...activeSubTab!.cameraPositions]
    if (existingIndex !== -1) {
      updatedPositions[existingIndex] = newPosition
    } else {
      updatedPositions.push(newPosition)
    }

    dispatch(
      updateCameraPositions({
        tabId: activeTabId,
        subTabId: activeTab.activeSubTab,
        positions: updatedPositions,
      })
    )

    setShowCameraSelector(false)
    setSelectedCellId(null)
  }

  const handleAddTab = (tab: Tab) => {
    dispatch(addTab(tab))
    dispatch(setActiveTab(tab.id))
  }

  const handleRemoveTab = (tabId: string) => {
    if (!layout) return
    if (layout.tabs.length === 1) {
      alert('Cannot remove the last tab')
      return
    }
    dispatch(removeTab(tabId))
  }

  const handleReorderTabs = (fromIndex: number, toIndex: number) => {
    dispatch(reorderTabs({ fromIndex, toIndex }))
  }

  const handleAddSubTab = (subTab: SubTab) => {
    dispatch(addSubTab({ tabId: activeTabId, subTab }))
    if (activeTab) {
      dispatch(setActiveSubTab({ tabId: activeTabId, subTabId: subTab.id }))
    }
  }

  const handleRemoveSubTab = (subTabId: string) => {
    if (!activeTab || activeTab.subTabs.length === 1) {
      alert('Cannot remove the last subtab')
      return
    }
    dispatch(removeSubTab({ tabId: activeTabId, subTabId }))
  }

  const handleReorderSubTabs = (fromIndex: number, toIndex: number) => {
    dispatch(reorderSubTabs({ tabId: activeTabId, fromIndex, toIndex }))
  }

  if (!layout || layout.tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">
        No layout data available
      </div>
    )
  }

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">
        No process selected
      </div>
    )
  }

  if (!activeSubTab) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">
        No equipment selected
      </div>
    )
  }

  const totalCells = activeSubTab.gridConfig.rows * activeSubTab.gridConfig.cols
  const cameraMap = new Map(cameras.map((cam) => [cam.id, cam]))

  const cellsData = Array.from({ length: totalCells }, (_, index) => {
    const col = index % activeSubTab.gridConfig.cols
    const row = Math.floor(index / activeSubTab.gridConfig.cols)
    const position = activeSubTab.cameraPositions.find((pos) => pos.row === row && pos.col === col)
    const camera = position ? cameraMap.get(position.cameraId) : undefined

    return {
      id: `cell-${index}`,
      index,
      row,
      col,
      camera,
    }
  })

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Tabs Bar with Grid Selector */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Top Tabs (공정) */}
        <TabsBar
          tabs={layout.tabs}
          activeTabId={activeTabId}
          onTabChange={(tabId) => dispatch(setActiveTab(tabId))}
          onAddTab={handleAddTab}
          onRemoveTab={handleRemoveTab}
          onReorderTabs={handleReorderTabs}
        />

        {/* Sub Tabs (설비) with Layout Selector */}
        <SubTabsBar
          subTabs={activeTab.subTabs}
          activeSubTabId={activeTab.activeSubTab}
          onSubTabChange={(subTabId) =>
            dispatch(setActiveSubTab({ tabId: activeTabId, subTabId }))
          }
          onAddSubTab={handleAddSubTab}
          onRemoveSubTab={handleRemoveSubTab}
          onReorderSubTabs={handleReorderSubTabs}
          layoutSelector={
            <LayoutSelector
              currentLayout={getCurrentGridLabel()}
              options={gridOptions}
              onLayoutChange={handleChangeGridLayout}
            />
          }
        />
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-6">
        <div
          className="grid gap-4 auto-fit"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${activeSubTab.gridConfig.cols}, 1fr)`,
            gap: `${activeSubTab.gridConfig.gapSize}px`,
          }}
        >
          {cellsData.map((cell) => (
            <DraggableCell
              key={cell.id}
              cellId={cell.id}
              index={cell.index}
              camera={cell.camera}
              onAddCamera={() => handleAddCamera(cell.id)}
              onRemoveCamera={() => {
                if (cell.camera) {
                  removeCamera(cell.camera.id)
                }
              }}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* Camera Selector Modal */}
      <CameraSelector
        isOpen={showCameraSelector}
        cameras={cameras}
        usedCameraIds={usedCameraIds}
        onSelect={handleSelectCamera}
        onClose={() => {
          setShowCameraSelector(false)
          setSelectedCellId(null)
        }}
      />
    </div>
  )
}

export default GridContainer
