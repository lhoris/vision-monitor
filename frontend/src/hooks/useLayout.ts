/**
 * Custom Hook for Layout Management
 */

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  setActiveTab,
  addTab,
  removeTab,
  updateGridConfig,
  updateCameraPositions,
  fetchUserLayout,
} from '@/store/slices/layoutSlice'
import type { Tab, GridConfig, CameraPosition } from '@/types/layout'

export function useLayout(_userId?: number) {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((state) => state.layout.layout)
  const activeTab = useAppSelector((state) => state.layout.activeTab)
  const loading = useAppSelector((state) => state.layout.loading)
  const error = useAppSelector((state) => state.layout.error)

  const loadLayout = useCallback(
    (id: number) => {
      dispatch(fetchUserLayout(id))
    },
    [dispatch]
  )

  const onSetActiveTab = useCallback(
    (tabId: string) => {
      dispatch(setActiveTab(tabId))
    },
    [dispatch]
  )

  const onAddTab = useCallback(
    (tab: Tab) => {
      dispatch(addTab(tab))
    },
    [dispatch]
  )

  const onRemoveTab = useCallback(
    (tabId: string) => {
      dispatch(removeTab(tabId))
    },
    [dispatch]
  )

  const onUpdateGridConfig = useCallback(
    (tabId: string, subTabId: string, config: GridConfig) => {
      dispatch(updateGridConfig({ tabId, subTabId, config }))
    },
    [dispatch]
  )

  const onUpdateCameraPositions = useCallback(
    (tabId: string, subTabId: string, positions: CameraPosition[]) => {
      dispatch(updateCameraPositions({ tabId, subTabId, positions }))
    },
    [dispatch]
  )

  return {
    layout,
    activeTab,
    loading,
    error,
    loadLayout,
    setActiveTab: onSetActiveTab,
    addTab: onAddTab,
    removeTab: onRemoveTab,
    updateGridConfig: onUpdateGridConfig,
    updateCameraPositions: onUpdateCameraPositions,
  }
}
