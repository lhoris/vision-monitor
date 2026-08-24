/**
 * Layout Service
 */

import { apiClient } from './api'
import { getResponseData, withServiceFallback } from './serviceUtils'
import type { Layout, Tab, SubTab, GridConfig } from '@/types/layout'

const LOCAL_LAYOUT_PREFIX = 'layout:personalization:'

function getCurrentUsername(): string {
  return localStorage.getItem('authUsername') || 'anonymous'
}

function isMockUser(username = getCurrentUsername()): boolean {
  return username === 'tester' || username === 'tester1'
}

function getLocalLayoutKey(username = getCurrentUsername()): string {
  return `${LOCAL_LAYOUT_PREFIX}${username}`
}

function readLocalLayout(username = getCurrentUsername()): Layout | null {
  const raw = localStorage.getItem(getLocalLayoutKey(username))
  if (!raw) return null
  try {
    return JSON.parse(raw) as Layout
  } catch {
    localStorage.removeItem(getLocalLayoutKey(username))
    return null
  }
}

function writeLocalLayout(layout: Layout, username = getCurrentUsername()): Layout {
  localStorage.setItem(getLocalLayoutKey(username), JSON.stringify(layout))
  return layout
}

export function createDefaultLayout(userId: number): Layout {
  const now = new Date().toISOString()
  const defaultGridConfig: GridConfig = {
    rows: 3,
    cols: 2,
    layout: 'grid',
    gapSize: 8,
  }

  const defaultSubTab: SubTab = {
    id: 'subtab-default-1',
    name: 'Equipment 1',
    gridConfig: defaultGridConfig,
    cameraPositions: [
      { cameraId: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { cameraId: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { cameraId: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
    ],
    createdAt: now,
    updatedAt: now,
  }

  const defaultTab: Tab = {
    id: 'tab-default',
    name: 'Process A',
    subTabs: [defaultSubTab],
    activeSubTab: defaultSubTab.id,
    createdAt: now,
    updatedAt: now,
  }

  return {
    id: 1,
    userId,
    tabs: [defaultTab],
    activeTab: defaultTab.id,
    createdAt: now,
    updatedAt: now,
  }
}

class LayoutService {
  async getMyLayout(): Promise<Layout | null> {
    if (isMockUser()) {
      return readLocalLayout() ?? createDefaultLayout(1)
    }

    return withServiceFallback(
      async () => {
        const response = await apiClient.get<Layout | null>('/layouts/me')
        const layout = getResponseData(response, null)
        if (layout) {
          writeLocalLayout(layout)
          return layout
        }
        return readLocalLayout() ?? createDefaultLayout(1)
      },
      readLocalLayout() ?? createDefaultLayout(1),
      'Failed to fetch current user layout. Using local/default layout:'
    )
  }

  async getUserLayout(userId: number): Promise<Layout | null> {
    return withServiceFallback(
      async () => {
      const response = await apiClient.get<Layout>(`/layouts/${userId}`)
        return getResponseData(response, null)
      },
      createDefaultLayout(userId),
      'Failed to fetch user layout. Using default development layout:'
    )
  }

  async saveMyLayout(layout: Layout): Promise<Layout | null> {
    if (isMockUser()) {
      return writeLocalLayout(layout)
    }

    return withServiceFallback(
      async () => {
        const response = await apiClient.put<Layout>('/layouts/me', layout)
        const savedLayout = getResponseData(response, null)
        return savedLayout ? writeLocalLayout(savedLayout) : null
      },
      null,
      'Failed to save current user layout:'
    )
  }

  saveLocalLayout(layout: Layout): Layout {
    return writeLocalLayout(layout)
  }

  async saveLayout(layout: Layout): Promise<Layout | null> {
    return withServiceFallback(
      async () => {
      const response = await apiClient.post<Layout>('/layouts', layout)
        return getResponseData(response, null)
      },
      null,
      'Failed to save layout:'
    )
  }

  async updateLayout(id: number, layout: Partial<Layout>): Promise<Layout | null> {
    return withServiceFallback(
      async () => {
      const response = await apiClient.put<Layout>(`/layouts/${id}`, layout)
        return getResponseData(response, null)
      },
      null,
      'Failed to update layout:'
    )
  }

  async deleteLayout(id: number): Promise<boolean> {
    return withServiceFallback(
      async () => {
      await apiClient.delete(`/layouts/${id}`)
      return true
      },
      false,
      'Failed to delete layout:'
    )
  }

  async addTab(layoutId: number, tab: Tab): Promise<Tab | null> {
    return withServiceFallback(
      async () => {
      const response = await apiClient.post<Tab>(`/layouts/${layoutId}/tabs`, tab)
        return getResponseData(response, null)
      },
      null,
      'Failed to add tab:'
    )
  }

  async updateTab(layoutId: number, tabId: string, tab: Partial<Tab>): Promise<Tab | null> {
    return withServiceFallback(
      async () => {
      const response = await apiClient.put<Tab>(`/layouts/${layoutId}/tabs/${tabId}`, tab)
        return getResponseData(response, null)
      },
      null,
      'Failed to update tab:'
    )
  }

  async deleteTab(layoutId: number, tabId: string): Promise<boolean> {
    return withServiceFallback(
      async () => {
      await apiClient.delete(`/layouts/${layoutId}/tabs/${tabId}`)
      return true
      },
      false,
      'Failed to delete tab:'
    )
  }
}

export const layoutService = new LayoutService()
