/**
 * Grid Container Component
 */

import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import AddCameraDialog from './AddCameraDialog'
import { useGridLayout } from './useGridLayout'
import {
  moveCameraPosition,
  placeCameraAtCell,
  removeCameraPosition,
} from './useGridDnd'
import type { CameraPosition, Tab, SubTab } from '@/types/layout'
import type { Camera } from '@/types/camera'
import type { PlayerState, TemporaryVideoSource } from '@/types/streamPlayer'

interface GridContainerProps {
  userId?: number
  cameras?: Camera[]
}

export const GridContainer: React.FC<GridContainerProps> = ({
  userId: _userId,
  cameras = [],
}) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
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
  const [editingTemporaryId, setEditingTemporaryId] = useState<number | null>(null)
  const temporaryIdRef = useRef(-1)

  useEffect(() => {
    if (activeSubTab) {
      setUsedCameraIds(activeSubTab.cameraPositions
        .filter((position) => !position.source && position.cameraId > 0)
        .map((position) => position.cameraId))
    }
  }, [activeSubTab])

  useEffect(() => {
    if (!layout) return
    const minCameraId = layout.tabs
      .flatMap((tab) => tab.subTabs)
      .flatMap((subTab) => subTab.cameraPositions)
      .reduce((min, position) => Math.min(min, position.cameraId), 0)
    temporaryIdRef.current = Math.min(-1, minCameraId - 1)
  }, [layout])

  const updateActiveSubTabPositions = (positions: CameraPosition[]) => {
    if (!activeTab || !activeSubTab) return

    dispatch(
      updateCameraPositions({
        tabId: activeTab.id,
        subTabId: activeSubTab.id,
        positions,
      })
    )
  }

  const handleAddCamera = (cellId: string) => {
    setSelectedCellId(cellId)
    setShowCameraSelector(true)
  }

  const handleDragStart = (cameraId: number) => {
    setDraggedCameraId(cameraId)
  }

  const handleDrop = (cellIndex: number) => {
    if (!draggedCameraId || !activeSubTab) return

    updateActiveSubTabPositions(
      moveCameraPosition(
        activeSubTab.cameraPositions,
        draggedCameraId,
        cellIndex,
        activeSubTab.gridConfig.cols
      )
    )
    setDraggedCameraId(null)
  }

  const removeCamera = (cameraId: number) => {
    if (!activeSubTab) return

    updateActiveSubTabPositions(
      removeCameraPosition(activeSubTab.cameraPositions, cameraId)
    )
  }

  const handleRenameCamera = (cameraId: number, name: string) => {
    if (!activeSubTab) return

    updateActiveSubTabPositions(
      activeSubTab.cameraPositions.map((position) =>
        position.cameraId === cameraId
          ? {
              ...position,
              displayName: name,
              source: position.source ? { ...position.source, displayName: name } : position.source,
            }
          : position
      )
    )
  }

  const handleFocusCamera = (cameraId: number) => {
    const params = new URLSearchParams({ mode: 'live' })

    if (activeTab && activeSubTab) {
      const currentCameraIds = activeSubTab.cameraPositions.map((position) => position.cameraId)
      params.set('tabId', activeTab.id)
      params.set('subTabId', activeSubTab.id)
      params.set('cameraIds', currentCameraIds.join(','))

      const currentNameOverrides = activeSubTab.cameraPositions.reduce<Record<number, string>>((overrides, position) => {
        const override = position.displayName
        if (override) {
          overrides[position.cameraId] = override
        }
        return overrides
      }, {})

      if (Object.keys(currentNameOverrides).length > 0) {
        params.set('cameraNames', JSON.stringify(currentNameOverrides))
      }
    }

    navigate(`/live/cameras/${cameraId}?${params.toString()}`)
  }

  const handleSelectCamera = (camera: Camera) => {
    if (!selectedCellId || !activeSubTab) return

    const cellIndex = parseInt(selectedCellId.split('-')[1])
    updateActiveSubTabPositions(
      placeCameraAtCell(
        activeSubTab.cameraPositions,
        camera.id,
        cellIndex,
        activeSubTab.gridConfig.cols
      )
    )

    setShowCameraSelector(false)
    setSelectedCellId(null)
  }

  const handleAddDirectSource = (source: TemporaryVideoSource) => {
    if (!selectedCellId || !activeSubTab) return

    if (editingTemporaryId !== null) {
      updateActiveSubTabPositions(
        activeSubTab.cameraPositions.map((position) =>
          position.cameraId === editingTemporaryId
            ? {
                ...position,
                displayName: source.displayName,
                temporarySourceId: source.id,
                source,
              }
            : position
        )
      )
      setEditingTemporaryId(null)
      setSelectedCellId(null)
      return
    }

    const temporaryId = temporaryIdRef.current
    temporaryIdRef.current -= 1
    const cellIndex = parseInt(selectedCellId.split('-')[1])
    const positions = placeCameraAtCell(
      activeSubTab.cameraPositions,
      temporaryId,
      cellIndex,
      activeSubTab.gridConfig.cols
    ).map((position) =>
      position.cameraId === temporaryId
        ? {
            ...position,
            displayName: source.displayName,
            temporarySourceId: source.id,
            source,
          }
        : position
    )
    updateActiveSubTabPositions(positions)
    setSelectedCellId(null)
  }

  const handleEditTemporarySource = (cameraId: number) => {
    setEditingTemporaryId(cameraId)
    setSelectedCellId(null)
    setShowCameraSelector(true)
  }

  const handleTemporaryStatusChange = (cameraId: number, status: PlayerState) => {
    if (!activeSubTab) return
    updateActiveSubTabPositions(
      activeSubTab.cameraPositions.map((position) =>
        position.cameraId === cameraId && position.source && position.source.playbackStatus !== status
          ? { ...position, source: { ...position.source, playbackStatus: status } }
          : position
      )
    )
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
    if (!activeTabId) return

    dispatch(addSubTab({ tabId: activeTabId, subTab }))
    dispatch(setActiveSubTab({ tabId: activeTabId, subTabId: subTab.id }))
  }

  const handleRemoveSubTab = (subTabId: string) => {
    if (!activeTab || activeTab.subTabs.length === 1) {
      alert('Cannot remove the last subtab')
      return
    }
    dispatch(removeSubTab({ tabId: activeTab.id, subTabId }))
  }

  const handleReorderSubTabs = (fromIndex: number, toIndex: number) => {
    if (!activeTabId) return
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
  const cameraMap = new Map(
    cameras.map((camera) => [
      camera.id,
      camera,
    ])
  )

  const cellsData = Array.from({ length: totalCells }, (_, index) => {
    const col = index % activeSubTab.gridConfig.cols
    const row = Math.floor(index / activeSubTab.gridConfig.cols)
    const position = activeSubTab.cameraPositions.find(
      (cameraPosition) => cameraPosition.row === row && cameraPosition.col === col
    )
    const baseCamera = position ? cameraMap.get(position.cameraId) : undefined
    const camera = baseCamera && position?.displayName
      ? { ...baseCamera, name: position.displayName }
      : baseCamera
    const temporarySource = position?.source

    return {
      id: `cell-${index}`,
      index,
      row,
      col,
      positionId: position?.cameraId,
      camera,
      temporarySource,
    }
  })

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TabsBar
          tabs={layout.tabs}
          activeTabId={activeTabId}
          onTabChange={(tabId) => dispatch(setActiveTab(tabId))}
          onAddTab={handleAddTab}
          onRemoveTab={handleRemoveTab}
          onReorderTabs={handleReorderTabs}
        />

        <SubTabsBar
          subTabs={activeTab.subTabs}
          activeSubTabId={activeTab.activeSubTab}
          onSubTabChange={(subTabId) =>
            dispatch(setActiveSubTab({ tabId: activeTab.id, subTabId }))
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

      <div className="flex-1 overflow-auto p-6">
        <div
          className="grid gap-4 auto-fit"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${activeSubTab.gridConfig.cols}, minmax(0, 1fr))`,
            gap: `${activeSubTab.gridConfig.gapSize}px`,
          }}
        >
          {cellsData.map((cell) => (
            <DraggableCell
              key={cell.id}
              cellId={cell.id}
              index={cell.index}
              positionId={cell.positionId}
              camera={cell.camera}
              temporarySource={cell.temporarySource}
              onAddCamera={() => handleAddCamera(cell.id)}
              onRemoveCamera={() => {
                if (cell.camera || cell.temporarySource) {
                  const cameraId = cell.camera?.id ?? cell.positionId
                  if (cameraId === undefined) return
                  removeCamera(cameraId)
                }
              }}
              onFocusCamera={cell.temporarySource ? undefined : handleFocusCamera}
              onRenameCamera={handleRenameCamera}
              onEditTemporarySource={cell.temporarySource && cell.positionId !== undefined ? () => handleEditTemporarySource(cell.positionId as number) : undefined}
              onTemporaryStatusChange={cell.temporarySource && cell.positionId !== undefined ? (status) => handleTemporaryStatusChange(cell.positionId as number, status) : undefined}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      <AddCameraDialog
        isOpen={showCameraSelector}
        cameras={cameras}
        usedCameraIds={usedCameraIds}
        existingTemporaryUrls={activeSubTab.cameraPositions
          .map((position) => position.source?.url)
          .filter((url): url is string => Boolean(url))}
        initialSource={editingTemporaryId !== null
          ? activeSubTab.cameraPositions.find((position) => position.cameraId === editingTemporaryId)?.source
          : undefined}
        onSelectCamera={handleSelectCamera}
        onAddDirectSource={handleAddDirectSource}
        onClose={() => {
          setShowCameraSelector(false)
          setSelectedCellId(null)
          setEditingTemporaryId(null)
        }}
      />
    </div>
  )
}

export default GridContainer
