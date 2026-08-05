/**
 * Redux Slice for Layout (개인화 그리드 레이아웃)
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { layoutService } from '@/services/layoutService'
import type { Layout, Tab, GridConfig, LayoutState } from '@/types/layout'

const initialState: LayoutState = {
  layout: null,
  loading: false,
  error: null,
  activeTab: '',
}

/**
 * Async Thunks (Phase 3에서 실제 구현)
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
 * Layout Slice
 */
const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    /**
     * 활성 탭 변경
     */
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload
    },

    /**
     * 탭 추가
     */
    addTab: (state, action: PayloadAction<Tab>) => {
      if (state.layout) {
        state.layout.tabs.push(action.payload)
      }
    },

    /**
     * 탭 제거
     */
    removeTab: (state, action: PayloadAction<string>) => {
      if (state.layout) {
        state.layout.tabs = state.layout.tabs.filter(tab => tab.id !== action.payload)
      }
    },

    /**
     * 그리드 설정 업데이트
     */
    updateGridConfig: (state, action: PayloadAction<{ tabId: string; config: GridConfig }>) => {
      if (state.layout) {
        const tab = state.layout.tabs.find(t => t.id === action.payload.tabId)
        if (tab) {
          tab.gridConfig = action.payload.config
        }
      }
    },

    /**
     * 카메라 위치 업데이트
     */
    updateCameraPositions: (state, action: PayloadAction<{ tabId: string; positions: any[] }>) => {
      if (state.layout) {
        const tab = state.layout.tabs.find(t => t.id === action.payload.tabId)
        if (tab) {
          tab.cameraPositions = action.payload.positions
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
    // fetchUserLayout
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

    // saveLayout
    builder
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

    // updateLayout
    builder
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
  addTab,
  removeTab,
  updateGridConfig,
  updateCameraPositions,
  clearError,
} = layoutSlice.actions

export default layoutSlice.reducer
