/**
 * Camera Service
 * 카메라 관련 API 호출
 */
import { apiClient } from './api';
class CameraService {
    /**
     * 모든 카메라 조회
     */
    async getAllCameras() {
        try {
            const response = await apiClient.get('/cameras');
            return response.data || [];
        }
        catch (error) {
            console.error('Failed to fetch all cameras:', error);
            return [];
        }
    }
    /**
     * 카메라 상세 정보 조회
     */
    async getCameraDetail(cameraId) {
        try {
            const response = await apiClient.get(`/cameras/${cameraId}`);
            return response.data || null;
        }
        catch (error) {
            console.error(`Failed to fetch camera detail for ${cameraId}:`, error);
            return null;
        }
    }
    /**
     * 카메라 상태 조회
     */
    async getCameraStatus(cameraId) {
        try {
            const response = await apiClient.get(`/cameras/${cameraId}/status`);
            return response.data?.status || 'offline';
        }
        catch (error) {
            console.error(`Failed to fetch camera status for ${cameraId}:`, error);
            return 'offline';
        }
    }
    /**
     * 카메라 등록
     */
    async createCamera(camera) {
        try {
            const response = await apiClient.post('/cameras', camera);
            return response.data || null;
        }
        catch (error) {
            console.error('Failed to create camera:', error);
            return null;
        }
    }
    /**
     * 카메라 업데이트
     */
    async updateCamera(id, camera) {
        try {
            const response = await apiClient.put(`/cameras/${id}`, camera);
            return response.data || null;
        }
        catch (error) {
            console.error(`Failed to update camera ${id}:`, error);
            return null;
        }
    }
    /**
     * 카메라 삭제
     */
    async deleteCamera(id) {
        try {
            await apiClient.delete(`/cameras/${id}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to delete camera ${id}:`, error);
            return false;
        }
    }
    /**
     * 카메라 리스트 조회 (필터링 지원)
     */
    async getCamerasByZone(zone) {
        try {
            const response = await apiClient.get('/cameras', { zone });
            return response.data || [];
        }
        catch (error) {
            console.error(`Failed to fetch cameras by zone ${zone}:`, error);
            return [];
        }
    }
    /**
     * 카메라 온라인 상태 체크
     */
    async checkCameraHealth(cameraId) {
        try {
            const response = await apiClient.get(`/cameras/${cameraId}/health`);
            return response.data || { online: false };
        }
        catch (error) {
            console.error(`Failed to check camera health for ${cameraId}:`, error);
            return { online: false };
        }
    }
}
export const cameraService = new CameraService();
