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
  saveLayout,
  updateLayout,
} from '@/store/slices/layoutSlice'
import type { Tab, GridConfig, CameraPosition } from '@/types/layout'
import {
  addLayoutTab,
  removeLayoutTab,
  updateLayoutCameraPositions,
  updateLayoutGridConfig,
} from './layoutMutations'

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
      if (layout) {
        dispatch(saveLayout(addLayoutTab(layout, tab)))
      }
    },
    [dispatch, layout]
  )

  const onRemoveTab = useCallback(
    (tabId: string) => {
      dispatch(removeTab(tabId))
      if (layout) {
        dispatch(saveLayout(removeLayoutTab(layout, tabId)))
      }
    },
    [dispatch, layout]
  )

  const onUpdateGridConfig = useCallback(
    (tabId: string, subTabId: string, config: GridConfig) => {
      dispatch(updateGridConfig({ tabId, subTabId, config }))
      if (layout) {
        const nextLayout = updateLayoutGridConfig(layout, tabId, subTabId, config)
        dispatch(updateLayout({ id: layout.id, layout: nextLayout }))
      }
    },
    [dispatch, layout]
  )

  const onUpdateCameraPositions = useCallback(
    (tabId: string, subTabId: string, positions: CameraPosition[]) => {
      dispatch(updateCameraPositions({ tabId, subTabId, positions }))
      if (layout) {
        const nextLayout = updateLayoutCameraPositions(layout, tabId, subTabId, positions)
        dispatch(updateLayout({ id: layout.id, layout: nextLayout }))
      }
    },
    [dispatch, layout]
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
