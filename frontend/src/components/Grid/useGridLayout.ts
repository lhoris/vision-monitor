/**
 * Custom Hook for Grid Layout Management
 */

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setActiveTab, updateGridConfig } from '@/store/slices/layoutSlice'
import type { Tab, GridConfig } from '@/types/layout'
import type { GridDimensions } from './types'

const GRID_OPTIONS: GridDimensions[] = [
  { rows: 2, cols: 3, label: '2x3' },
  { rows: 3, cols: 3, label: '3x3' },
  { rows: 3, cols: 2, label: '3x2' },
  { rows: 2, cols: 4, label: '2x4' },
  { rows: 4, cols: 2, label: '4x2' },
  { rows: 4, cols: 4, label: '4x4' },
]

export function useGridLayout() {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((state) => state.layout.layout)
  const activeTabId = useAppSelector((state) => state.layout.activeTab)
  const [gridOptions] = useState<GridDimensions[]>(GRID_OPTIONS)

  // 현재 활성 탭 데이터
  const activeTab = layout?.tabs.find((tab) => tab.id === activeTabId) as Tab | undefined

  /**
   * 활성 탭 변경
   */
  const handleSetActiveTab = useCallback(
    (tabId: string) => {
      dispatch(setActiveTab(tabId))
    },
    [dispatch]
  )

  /**
   * 그리드 레이아웃 변경
   */
  const handleChangeGridLayout = useCallback(
    (dimensions: GridDimensions) => {
      if (!activeTab) return

      const newConfig: GridConfig = {
        rows: dimensions.rows,
        cols: dimensions.cols,
        layout: 'grid',
        gapSize: 8,
      }

      dispatch(updateGridConfig({ tabId: activeTabId, config: newConfig }))
    },
    [dispatch, activeTab, activeTabId]
  )

  /**
   * 그리드 셀 수 계산
   */
  const getTotalCells = useCallback(() => {
    if (!activeTab) return 0
    return activeTab.gridConfig.rows * activeTab.gridConfig.cols
  }, [activeTab])

  /**
   * 현재 그리드 레이아웃 라벨 반환
   */
  const getCurrentGridLabel = useCallback(() => {
    if (!activeTab) return 'N/A'
    return `${activeTab.gridConfig.rows}x${activeTab.gridConfig.cols}`
  }, [activeTab])

  return {
    layout,
    activeTab,
    activeTabId,
    gridOptions,
    getTotalCells,
    getCurrentGridLabel,
    handleSetActiveTab,
    handleChangeGridLayout,
  }
}
