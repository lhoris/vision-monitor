/**
 * Grid Container Component
 * 개인화된 카메라 그리드 메인 컨테이너
 */

import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { useLayout } from '@/hooks/useLayout'
import { useAppDispatch } from '@/store'
import { addTab, removeTab, setActiveTab, updateCameraPositions } from '@/store/slices/layoutSlice'
import TabsBar from './TabsBar'
import LayoutSelector from './LayoutSelector'
import DraggableCell from './DraggableCell'
import CameraSelector from './CameraSelector'
import { useGridLayout } from './useGridLayout'
import { useGridDnd } from './useGridDnd'
import type { Tab } from '@/types/layout'
import type { Camera } from '@/types/camera'

interface GridContainerProps {
  userId?: number
  cameras?: Camera[]
}

export const GridContainer: React.FC<GridContainerProps> = ({ userId = 1, cameras = [] }) => {
  const dispatch = useAppDispatch()
  const { layout } = useLayout(userId)
  const { gridOptions, handleChangeGridLayout, getCurrentGridLabel, activeTab } = useGridLayout()
  const { handleDragEnd, removeCamera } = useGridDnd()

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  const [showCameraSelector, setShowCameraSelector] = useState(false)
  const [usedCameraIds, setUsedCameraIds] = useState<number[]>([])

  // 사용 중인 카메라 ID 추적
  useEffect(() => {
    if (activeTab) {
      const used = activeTab.cameraPositions.map((pos) => pos.cameraId)
      setUsedCameraIds(used)
    }
  }, [activeTab])

  const handleAddCamera = (cellId: string) => {
    setSelectedCellId(cellId)
    setShowCameraSelector(true)
  }

  const handleSelectCamera = (camera: Camera) => {
    if (!selectedCellId || !activeTab) return

    // 셀 ID로부터 행/열 계산
    const cellIndex = parseInt(selectedCellId.split('-')[1])
    const colsPerRow = activeTab.gridConfig.cols
    const row = Math.floor(cellIndex / colsPerRow)
    const col = cellIndex % colsPerRow

    // 새로운 카메라 위치 추가
    const newPosition = {
      cameraId: camera.id,
      row,
      col,
      rowSpan: 1,
      colSpan: 1,
    }

    // 기존 위치 중복 확인 및 추가
    const existingIndex = activeTab.cameraPositions.findIndex(
      (pos) => pos.row === row && pos.col === col
    )

    let updatedPositions = [...activeTab.cameraPositions]
    if (existingIndex !== -1) {
      updatedPositions[existingIndex] = newPosition
    } else {
      updatedPositions.push(newPosition)
    }

    // Redux 업데이트
    dispatch(updateCameraPositions({ tabId: activeTab.id, positions: updatedPositions }))

    setShowCameraSelector(false)
    setSelectedCellId(null)
  }

  const handleAddTab = (tab: Tab) => {
    dispatch(addTab(tab))
  }

  const handleRemoveTab = (tabId: string) => {
    if (!layout) return
    if (layout.tabs.length === 1) {
      alert('Cannot remove the last tab')
      return
    }
    dispatch(removeTab(tabId))
  }

  const handleRenameTab = () => {
    // This would need to be implemented in the Redux slice
    // For now, we'll skip this feature
  }

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        Loading layout...
      </div>
    )
  }

  if (layout.tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        No tabs available. Add a new tab to get started.
      </div>
    )
  }

  const totalCells = activeTab ? activeTab.gridConfig.rows * activeTab.gridConfig.cols : 0

  // 카메라 맵 생성 (ID로 빠른 조회)
  const cameraMap = new Map(cameras.map((cam) => [cam.id, cam]))

  // 셀 데이터 생성
  const cellsData = Array.from({ length: totalCells }, (_, index) => {
    const col = index % activeTab!.gridConfig.cols
    const row = Math.floor(index / activeTab!.gridConfig.cols)
    const position = activeTab!.cameraPositions.find((pos) => pos.row === row && pos.col === col)
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Monitoring</h1>
          <LayoutSelector
            currentLayout={getCurrentGridLabel()}
            options={gridOptions}
            onLayoutChange={handleChangeGridLayout}
          />
        </div>
      </div>

      {/* Tabs */}
      <TabsBar
        tabs={layout.tabs}
        activeTabId={layout.activeTab}
        onTabChange={(tabId) => dispatch(setActiveTab(tabId))}
        onAddTab={handleAddTab}
        onRemoveTab={handleRemoveTab}
        onRenameTab={handleRenameTab}
      />

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="grid" type="CAMERA">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid gap-4 auto-fit"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${activeTab.gridConfig.cols}, 1fr)`,
                    gap: `${activeTab.gridConfig.gapSize}px`,
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
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
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
