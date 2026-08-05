/**
 * Layout Service
 * 개인화된 그리드 레이아웃 API 호출
 * Phase 3에서 구현될 백엔드 API와 연동
 */
import { apiClient } from './api';
// Mock default layout for development
const createDefaultLayout = (userId) => {
    const defaultGridConfig = {
        rows: 3,
        cols: 2,
        layout: 'grid',
        gapSize: 8,
    };
    const defaultTab = {
        id: 'tab-default',
        name: 'Process A',
        cameras: [],
        gridConfig: defaultGridConfig,
        cameraPositions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    return {
        id: 1,
        userId,
        tabs: [defaultTab],
        activeTab: 'tab-default',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
};
class LayoutService {
    /**
     * 사용자 레이아웃 조회
     */
    async getUserLayout(userId) {
        try {
            const response = await apiClient.get(`/layouts/${userId}`);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to fetch user layout:', error);
            // Return mock data for development
            return createDefaultLayout(userId);
        }
    }
    /**
     * 레이아웃 저장
     */
    async saveLayout(layout) {
        try {
            const response = await apiClient.post('/layouts', layout);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to save layout:', error);
            return null;
        }
    }
    /**
     * 레이아웃 업데이트
     */
    async updateLayout(id, layout) {
        try {
            const response = await apiClient.put(`/layouts/${id}`, layout);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to update layout:', error);
            return null;
        }
    }
    /**
     * 레이아웃 삭제
     */
    async deleteLayout(id) {
        try {
            await apiClient.delete(`/layouts/${id}`);
            return true;
        }
        catch (error) {
            console.error('Failed to delete layout:', error);
            return false;
        }
    }
    /**
     * 탭 추가
     */
    async addTab(layoutId, tab) {
        try {
            const response = await apiClient.post(`/layouts/${layoutId}/tabs`, tab);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to add tab:', error);
            return null;
        }
    }
    /**
     * 탭 업데이트
     */
    async updateTab(layoutId, tabId, tab) {
        try {
            const response = await apiClient.put(`/layouts/${layoutId}/tabs/${tabId}`, tab);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to update tab:', error);
            return null;
        }
    }
    /**
     * 탭 삭제
     */
    async deleteTab(layoutId, tabId) {
        try {
            await apiClient.delete(`/layouts/${layoutId}/tabs/${tabId}`);
            return true;
        }
        catch (error) {
            console.error('Failed to delete tab:', error);
            return false;
        }
    }
}
export const layoutService = new LayoutService();
