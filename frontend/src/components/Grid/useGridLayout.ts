/**
 * Custom Hook for Grid Layout Management (2중 탭 구조)
 */

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setActiveTab, setActiveSubTab, updateGridConfig } from '@/store/slices/layoutSlice'
import type { Tab, SubTab, GridConfig } from '@/types/layout'
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

  // 현재 활성 상위 탭
  const activeTab = layout?.tabs.find((tab) => tab.id === activeTabId) as Tab | undefined

  // 현재 활성 하위 탭
  const activeSubTab = activeTab?.subTabs.find(
    (subTab) => subTab.id === activeTab.activeSubTab
  ) as SubTab | undefined

  /**
   * 활성 상위 탭 변경
   */
  const handleSetActiveTab = useCallback(
    (tabId: string) => {
      dispatch(setActiveTab(tabId))
    },
    [dispatch]
  )

  /**
   * 활성 하위 탭 변경
   */
  const handleSetActiveSubTab = useCallback(
    (subTabId: string) => {
      if (!activeTabId) return
      dispatch(setActiveSubTab({ tabId: activeTabId, subTabId }))
    },
    [dispatch, activeTabId]
  )

  /**
   * 그리드 레이아웃 변경 (하위 탭 기준)
   */
  const handleChangeGridLayout = useCallback(
    (dimensions: GridDimensions) => {
      if (!activeTabId || !activeTab?.activeSubTab) return

      const newConfig: GridConfig = {
        rows: dimensions.rows,
        cols: dimensions.cols,
        layout: 'grid',
        gapSize: 8,
      }

      dispatch(updateGridConfig({
        tabId: activeTabId,
        subTabId: activeTab.activeSubTab,
        config: newConfig,
      }))
    },
    [dispatch, activeTabId, activeTab]
  )

  /**
   * 그리드 셀 수 계산
   */
  const getTotalCells = useCallback(() => {
    if (!activeSubTab) return 0
    return activeSubTab.gridConfig.rows * activeSubTab.gridConfig.cols
  }, [activeSubTab])

  /**
   * 현재 그리드 레이아웃 라벨 반환
   */
  const getCurrentGridLabel = useCallback(() => {
    if (!activeSubTab) return 'N/A'
    return `${activeSubTab.gridConfig.rows}x${activeSubTab.gridConfig.cols}`
  }, [activeSubTab])

  return {
    layout,
    activeTab,
    activeTabId,
    activeSubTab,
    gridOptions,
    getTotalCells,
    getCurrentGridLabel,
    handleSetActiveTab,
    handleSetActiveSubTab,
    handleChangeGridLayout,
  }
}
