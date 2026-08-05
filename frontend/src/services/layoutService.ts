/**
 * Layout Service
 * 개인화된 그리드 레이아웃 API 호출
 * Phase 3에서 구현될 백엔드 API와 연동
 */

import { apiClient } from './api'
import type { Layout, Tab, GridConfig } from '@/types/layout'
import type { ApiResponse } from '@/types'

// Mock default layout for development
const createDefaultLayout = (userId: number): Layout => {
  const defaultGridConfig: GridConfig = {
    rows: 3,
    cols: 2,
    layout: 'grid',
    gapSize: 8,
  }

  const defaultTab: Tab = {
    id: 'tab-default',
    name: 'Process A',
    cameras: [],
    gridConfig: defaultGridConfig,
    cameraPositions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return {
    id: 1,
    userId,
    tabs: [defaultTab],
    activeTab: 'tab-default',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

class LayoutService {
  /**
   * 사용자 레이아웃 조회
   */
  async getUserLayout(userId: number): Promise<Layout | null> {
    try {
      const response = await apiClient.get<Layout>(`/layouts/${userId}`)
      return response.data || null
    } catch (error) {
      console.error('Failed to fetch user layout:', error)
      // Return mock data for development
      return createDefaultLayout(userId)
    }
  }

  /**
   * 레이아웃 저장
   */
  async saveLayout(layout: Layout): Promise<Layout | null> {
    try {
      const response = await apiClient.post<Layout>('/layouts', layout)
      return response.data || null
    } catch (error) {
      console.error('Failed to save layout:', error)
      return null
    }
  }

  /**
   * 레이아웃 업데이트
   */
  async updateLayout(id: number, layout: Partial<Layout>): Promise<Layout | null> {
    try {
      const response = await apiClient.put<Layout>(`/layouts/${id}`, layout)
      return response.data || null
    } catch (error) {
      console.error('Failed to update layout:', error)
      return null
    }
  }

  /**
   * 레이아웃 삭제
   */
  async deleteLayout(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/layouts/${id}`)
      return true
    } catch (error) {
      console.error('Failed to delete layout:', error)
      return false
    }
  }

  /**
   * 탭 추가
   */
  async addTab(layoutId: number, tab: Tab): Promise<Tab | null> {
    try {
      const response = await apiClient.post<Tab>(
        `/layouts/${layoutId}/tabs`,
        tab
      )
      return response.data || null
    } catch (error) {
      console.error('Failed to add tab:', error)
      return null
    }
  }

  /**
   * 탭 업데이트
   */
  async updateTab(layoutId: number, tabId: string, tab: Partial<Tab>): Promise<Tab | null> {
    try {
      const response = await apiClient.put<Tab>(
        `/layouts/${layoutId}/tabs/${tabId}`,
        tab
      )
      return response.data || null
    } catch (error) {
      console.error('Failed to update tab:', error)
      return null
    }
  }

  /**
   * 탭 삭제
   */
  async deleteTab(layoutId: number, tabId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/layouts/${layoutId}/tabs/${tabId}`)
      return true
    } catch (error) {
      console.error('Failed to delete tab:', error)
      return false
    }
  }
}

export const layoutService = new LayoutService()
