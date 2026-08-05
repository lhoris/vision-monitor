/**
 * Event Service
 * 이벤트/알림 관련 API 호출
 */
import { apiClient } from './api';
class EventService {
    /**
     * 이벤트 목록 조회 (페이지네이션)
     */
    async getEvents(params) {
        try {
            const response = await apiClient.get('/events', params);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to fetch events:', error);
            return null;
        }
    }
    /**
     * 특정 이벤트 조회
     */
    async getEventDetail(eventId) {
        try {
            const response = await apiClient.get(`/events/${eventId}`);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to fetch event detail:', error);
            return null;
        }
    }
    /**
     * 카메라별 이벤트 조회
     */
    async getCameraEvents(cameraId, params) {
        try {
            const response = await apiClient.get(`/cameras/${cameraId}/events`, params);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to fetch camera events:', error);
            return null;
        }
    }
    /**
     * 이벤트 확인 처리
     */
    async acknowledgeEvent(eventId) {
        try {
            const response = await apiClient.put(`/events/${eventId}/acknowledge`, {});
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to acknowledge event:', error);
            return null;
        }
    }
    /**
     * 여러 이벤트 확인 처리
     */
    async acknowledgeEvents(eventIds) {
        try {
            await apiClient.post(`/events/acknowledge`, { eventIds });
            return true;
        }
        catch (error) {
            console.error('Failed to acknowledge events:', error);
            return false;
        }
    }
    /**
     * 이벤트 삭제
     */
    async deleteEvent(eventId) {
        try {
            await apiClient.delete(`/events/${eventId}`);
            return true;
        }
        catch (error) {
            console.error('Failed to delete event:', error);
            return false;
        }
    }
    /**
     * 여러 이벤트 삭제
     */
    async deleteEvents(eventIds) {
        try {
            await apiClient.post(`/events/delete`, { eventIds });
            return true;
        }
        catch (error) {
            console.error('Failed to delete events:', error);
            return false;
        }
    }
    /**
     * 알림 설정 조회
     */
    async getAlertSettings(cameraId) {
        try {
            const url = cameraId ? `/alerts/settings/${cameraId}` : '/alerts/settings';
            const response = await apiClient.get(url);
            return response.data || [];
        }
        catch (error) {
            console.error('Failed to fetch alert settings:', error);
            return [];
        }
    }
    /**
     * 알림 설정 생성
     */
    async createAlertSetting(setting) {
        try {
            const response = await apiClient.post('/alerts/settings', setting);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to create alert setting:', error);
            return null;
        }
    }
    /**
     * 알림 설정 업데이트
     */
    async updateAlertSetting(id, setting) {
        try {
            const response = await apiClient.put(`/alerts/settings/${id}`, setting);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to update alert setting:', error);
            return null;
        }
    }
    /**
     * 알림 설정 삭제
     */
    async deleteAlertSetting(id) {
        try {
            await apiClient.delete(`/alerts/settings/${id}`);
            return true;
        }
        catch (error) {
            console.error('Failed to delete alert setting:', error);
            return false;
        }
    }
}
export const eventService = new EventService();
