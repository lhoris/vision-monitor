/**
 * Custom Hook for Layout Management
 * 개인화된 그리드 레이아웃 관리
 */
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveTab, addTab, removeTab, updateGridConfig, updateCameraPositions, fetchUserLayout, saveLayout, updateLayout, } from '@/store/slices/layoutSlice';
export function useLayout(userId) {
    const dispatch = useAppDispatch();
    const layout = useAppSelector((state) => state.layout.layout);
    const activeTab = useAppSelector((state) => state.layout.activeTab);
    const loading = useAppSelector((state) => state.layout.loading);
    const error = useAppSelector((state) => state.layout.error);
    /**
     * 사용자 레이아웃 불러오기
     */
    const loadLayout = useCallback((id) => {
        dispatch(fetchUserLayout(id));
    }, [dispatch]);
    /**
     * 활성 탭 변경
     */
    const onSetActiveTab = useCallback((tabId) => {
        dispatch(setActiveTab(tabId));
    }, [dispatch]);
    /**
     * 탭 추가
     */
    const onAddTab = useCallback((tab) => {
        dispatch(addTab(tab));
        if (layout) {
            dispatch(saveLayout(layout));
        }
    }, [dispatch, layout]);
    /**
     * 탭 제거
     */
    const onRemoveTab = useCallback((tabId) => {
        dispatch(removeTab(tabId));
        if (layout) {
            dispatch(saveLayout(layout));
        }
    }, [dispatch, layout]);
    /**
     * 그리드 설정 업데이트
     */
    const onUpdateGridConfig = useCallback((tabId, config) => {
        dispatch(updateGridConfig({ tabId, config }));
        if (layout) {
            dispatch(updateLayout({ id: layout.id, layout }));
        }
    }, [dispatch, layout]);
    /**
     * 카메라 위치 업데이트
     */
    const onUpdateCameraPositions = useCallback((tabId, positions) => {
        dispatch(updateCameraPositions({ tabId, positions }));
        if (layout) {
            dispatch(updateLayout({ id: layout.id, layout }));
        }
    }, [dispatch, layout]);
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
    };
}
