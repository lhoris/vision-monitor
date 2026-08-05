/**
 * Redux Slice for Layout (개인화 그리드 레이아웃 - 2중 탭 구조)
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { layoutService } from '@/services/layoutService'
import type { Layout, Tab, SubTab, GridConfig, LayoutState } from '@/types/layout'

const initialState: LayoutState = {
  layout: null,
  loading: false,
  error: null,
  activeTab: '',
}

/**
 * Async Thunks
 */
export const fetchUserLayout = createAsyncThunk(
  'layout/fetchUserLayout',
  async (userId: number) => {
    const layout = await layoutService.getUserLayout(userId)
    return layout
  }
)

export const saveLayout = createAsyncThunk(
  'layout/saveLayout',
  async (layout: Layout) => {
    const savedLayout = await layoutService.saveLayout(layout)
    return savedLayout
  }
)

export const updateLayout = createAsyncThunk(
  'layout/updateLayout',
  async ({ id, layout }: { id: number; layout: Partial<Layout> }) => {
    const updatedLayout = await layoutService.updateLayout(id, layout)
    return updatedLayout
  }
)

/**
 * Layout Slice (2중 탭 구조)
 */
const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    /**
     * 활성 상위 탭 변경
     */
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload
    },

    /**
     * 활성 하위 탭 변경
     */
    setActiveSubTab: (state, action: PayloadAction<{ tabId: string; subTabId: string }>) => {
      if (state.layout) {
        const tab = state.layout.tabs.find(t => t.id === action.payload.tabId)
        if (tab) {
          tab.activeSubTab = action.payload.subTabId
        }
      }
    },

    /**
     * 상위 탭 (공정) 추가
     */
    addTab: (state, action: PayloadAction<Tab>) => {
      if (state.layout) {
        state.layout.tabs.push(action.payload)
      }
    },

    /**
     * 상위 탭 (공정) 제거
     */
    removeTab: (state, action: PayloadAction<string>) => {
      if (state.layout) {
        state.layout.tabs = state.layout.tabs.filter(tab => tab.id !== action.payload)
        if (state.activeTab === action.payload && state.layout.tabs.length > 0) {
          state.activeTab = state.layout.tabs[0].id
        }
      }
    },

    /**
     * 상위 탭 순서 변경
     */
    reorderTabs: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      if (state.layout) {
        const { fromIndex, toIndex } = action.payload
        if (fromIndex >= 0 && fromIndex < state.layout.tabs.length && toIndex >= 0 && toIndex < state.layout.tabs.length) {
          const tab = state.layout.tabs[fromIndex]
          state.layout.tabs.splice(fromIndex, 1)
          state.layout.tabs.splice(toIndex, 0, tab)
        }
      }
    },

    /**
     * 하위 탭 (설비) 추가
     */
    addSubTab: (state, action: PayloadAction<{ tabId: string; subTab: SubTab }>) => {
      if (state.layout) {
        const tab = state.layout.tabs.find(t => t.id === action.payload.tabId)
        if (tab) {
          tab.subTabs.push(action.payload.subTab)
        }
      }
    },

    /**
     * 하위 탭 (설비) 제거
     */
    removeSubTab: (state, action: PayloadAction<{ tabId: string; subTabId: string }>) => {
      if (state.layout) {
        const tab = state.layout.tabs.find(t => t.id === action.payload.tabId)
        if (tab) {
          tab.subTabs = tab.subTabs.filter(st => st.id !== action.payload.subTabId)
          if (tab.activeSubTab === action.payload.subTabId && tab.subTabs.length > 0) {
            tab.activeSubTab = tab.subTabs[0].id
          }
        }
      }
    },

    /**
     * 하위 탭 순서 변경
     */
    reorderSubTabs: (state, action: PayloadAction<{ tabId: string; fromIndex: number; toIndex: number }>) => {
      if (state.layout) {
        const tab = state.layout.tabs.find(t => t.id === action.payload.tabId)
        if (tab) {
          const { fromIndex, toIndex } = action.payload
          if (fromIndex >= 0 && fromIndex < tab.subTabs.length && toIndex >= 0 && toIndex < tab.subTabs.length) {
            const subTab = tab.subTabs[fromIndex]
            tab.subTabs.splice(fromIndex, 1)
            tab.subTabs.splice(toIndex, 0, subTab)
          }
        }
      }
    },

    /**
     * 그리드 설정 업데이트 (하위 탭 기준)
     */
    updateGridConfig: (state, action: PayloadAction<{ tabId: string; subTabId: string; config: GridConfig }>) => {
      if (state.layout) {
        const tab = state.layout.tabs.find(t => t.id === action.payload.tabId)
        if (tab) {
          const subTab = tab.subTabs.find(st => st.id === action.payload.subTabId)
          if (subTab) {
            subTab.gridConfig = action.payload.config
          }
        }
      }
    },

    /**
     * 카메라 위치 업데이트 (하위 탭 기준)
     */
    updateCameraPositions: (state, action: PayloadAction<{ tabId: string; subTabId: string; positions: any[] }>) => {
      if (state.layout) {
        const tab = state.layout.tabs.find(t => t.id === action.payload.tabId)
        if (tab) {
          const subTab = tab.subTabs.find(st => st.id === action.payload.subTabId)
          if (subTab) {
            subTab.cameraPositions = action.payload.positions
          }
        }
      }
    },

    /**
     * 에러 초기화
     */
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLayout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserLayout.fulfilled, (state, action) => {
        state.loading = false
        state.layout = action.payload
        if (action.payload?.tabs.length) {
          state.activeTab = action.payload.tabs[0].id
        }
      })
      .addCase(fetchUserLayout.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch layout'
      })
      .addCase(saveLayout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveLayout.fulfilled, (state, action) => {
        state.loading = false
        state.layout = action.payload
      })
      .addCase(saveLayout.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to save layout'
      })
      .addCase(updateLayout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateLayout.fulfilled, (state, action) => {
        state.loading = false
        state.layout = action.payload
      })
      .addCase(updateLayout.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update layout'
      })
  },
})

export const {
  setActiveTab,
  setActiveSubTab,
  addTab,
  removeTab,
  reorderTabs,
  addSubTab,
  removeSubTab,
  reorderSubTabs,
  updateGridConfig,
  updateCameraPositions,
  clearError,
} = layoutSlice.actions

export default layoutSlice.reducer
