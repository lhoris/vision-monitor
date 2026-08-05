/**
 * Custom Hook for Camera Management
 * 카메라 데이터 및 작업 관리
 */
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAllCameras, fetchCameraDetail, createCameraAsync, updateCameraAsync, deleteCameraAsync, selectCamera, clearSelectedCamera, clearError, } from '@/store/slices/cameraSlice';
export function useCamera() {
    const dispatch = useAppDispatch();
    const cameras = useAppSelector((state) => state.camera.cameras);
    const selectedCamera = useAppSelector((state) => state.camera.selectedCamera);
    const selectedCameraId = useAppSelector((state) => state.camera.selectedCameraId);
    const loading = useAppSelector((state) => state.camera.loading);
    const error = useAppSelector((state) => state.camera.error);
    /**
     * 모든 카메라 조회
     */
    const loadCameras = useCallback(() => {
        dispatch(fetchAllCameras());
    }, [dispatch]);
    /**
     * 카메라 상세 정보 조회
     */
    const loadCameraDetail = useCallback((cameraId) => {
        dispatch(fetchCameraDetail(cameraId));
    }, [dispatch]);
    /**
     * 카메라 생성
     */
    const createCamera = useCallback((camera) => {
        return dispatch(createCameraAsync(camera));
    }, [dispatch]);
    /**
     * 카메라 업데이트
     */
    const updateCamera = useCallback((id, camera) => {
        return dispatch(updateCameraAsync({ id, camera }));
    }, [dispatch]);
    /**
     * 카메라 삭제
     */
    const deleteCamera = useCallback((cameraId) => {
        return dispatch(deleteCameraAsync(cameraId));
    }, [dispatch]);
    /**
     * 카메라 선택
     */
    const onSelectCamera = useCallback((cameraId) => {
        dispatch(selectCamera(cameraId));
    }, [dispatch]);
    /**
     * 선택된 카메라 초기화
     */
    const onClearSelectedCamera = useCallback(() => {
        dispatch(clearSelectedCamera());
    }, [dispatch]);
    /**
     * 에러 초기화
     */
    const onClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);
    return {
        // State
        cameras,
        selectedCamera,
        selectedCameraId,
        loading,
        error,
        // Actions
        loadCameras,
        loadCameraDetail,
        createCamera,
        updateCamera,
        deleteCamera,
        selectCamera: onSelectCamera,
        clearSelectedCamera: onClearSelectedCamera,
        clearError: onClearError,
    };
}
