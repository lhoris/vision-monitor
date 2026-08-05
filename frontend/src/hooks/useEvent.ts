/**
 * Custom Hook for Event Management
 * 이벤트/알림 데이터 및 작업 관리
 */

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchEvents,
  fetchCameraEvents,
  acknowledgeEventAsync,
  acknowledgeEventsAsync,
  deleteEventAsync,
  fetchAlertSettings,
  createAlertSettingAsync,
  updateAlertSettingAsync,
  deleteAlertSettingAsync,
  setEventFilter,
  addEvent,
  updateEvent,
  acknowledgeEvent,
  clearError,
} from '@/store/slices/eventSlice'
import type { Event, AlertSetting } from '@/types'

interface EventQueryParams {
  page?: number
  pageSize?: number
  cameraId?: number
  severity?: string
}

export function useEvent() {
  const dispatch = useAppDispatch()
  const events = useAppSelector((state) => state.event.events)
  const selectedEvent = useAppSelector((state) => state.event.selectedEvent)
  const alertSettings = useAppSelector((state) => state.event.alertSettings)
  const pagination = useAppSelector((state) => state.event.pagination)
  const loading = useAppSelector((state) => state.event.loading)
  const error = useAppSelector((state) => state.event.error)
  const filter = useAppSelector((state) => state.event.filter)

  /**
   * 이벤트 목록 조회
   */
  const loadEvents = useCallback(
    (params?: EventQueryParams) => {
      dispatch(fetchEvents(params))
    },
    [dispatch]
  )

  /**
   * 카메라별 이벤트 조회
   */
  const loadCameraEvents = useCallback(
    (cameraId: number, params?: Omit<EventQueryParams, 'cameraId'>) => {
      dispatch(fetchCameraEvents({ cameraId, params }))
    },
    [dispatch]
  )

  /**
   * 단일 이벤트 확인 처리
   */
  const acknowledgeEventFn = useCallback(
    (eventId: number) => {
      return dispatch(acknowledgeEventAsync(eventId))
    },
    [dispatch]
  )

  /**
   * 여러 이벤트 확인 처리
   */
  const acknowledgeEventsFn = useCallback(
    (eventIds: number[]) => {
      return dispatch(acknowledgeEventsAsync(eventIds))
    },
    [dispatch]
  )

  /**
   * 이벤트 삭제
   */
  const deleteEventFn = useCallback(
    (eventId: number) => {
      return dispatch(deleteEventAsync(eventId))
    },
    [dispatch]
  )

  /**
   * 알림 설정 조회
   */
  const loadAlertSettings = useCallback(
    (cameraId?: number) => {
      dispatch(fetchAlertSettings(cameraId))
    },
    [dispatch]
  )

  /**
   * 알림 설정 생성
   */
  const createAlertSetting = useCallback(
    (setting: Omit<AlertSetting, 'id'>) => {
      return dispatch(createAlertSettingAsync(setting))
    },
    [dispatch]
  )

  /**
   * 알림 설정 업데이트
   */
  const updateAlertSetting = useCallback(
    (id: number, setting: Partial<AlertSetting>) => {
      return dispatch(updateAlertSettingAsync({ id, setting }))
    },
    [dispatch]
  )

  /**
   * 알림 설정 삭제
   */
  const deleteAlertSetting = useCallback(
    (id: number) => {
      return dispatch(deleteAlertSettingAsync(id))
    },
    [dispatch]
  )

  /**
   * 필터 설정 변경
   */
  const onSetFilter = useCallback(
    (filterData: typeof filter) => {
      dispatch(setEventFilter(filterData))
    },
    [dispatch]
  )

  /**
   * 로컬 이벤트 추가 (웹소켓 등을 통해)
   */
  const onAddEventLocal = useCallback(
    (event: Event) => {
      dispatch(addEvent(event))
    },
    [dispatch]
  )

  /**
   * 로컬 이벤트 업데이트
   */
  const onUpdateEventLocal = useCallback(
    (event: Event) => {
      dispatch(updateEvent(event))
    },
    [dispatch]
  )

  /**
   * 로컬 이벤트 확인
   */
  const onAcknowledgeEventLocal = useCallback(
    (eventId: number) => {
      dispatch(acknowledgeEvent(eventId))
    },
    [dispatch]
  )

  /**
   * 에러 초기화
   */
  const onClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    // State
    events,
    selectedEvent,
    alertSettings,
    pagination,
    loading,
    error,
    filter,

    // API Actions
    loadEvents,
    loadCameraEvents,
    acknowledgeEvent: acknowledgeEventFn,
    acknowledgeEvents: acknowledgeEventsFn,
    deleteEvent: deleteEventFn,
    loadAlertSettings,
    createAlertSetting,
    updateAlertSetting,
    deleteAlertSetting,

    // Local State Actions
    setFilter: onSetFilter,
    addEventLocal: onAddEventLocal,
    updateEventLocal: onUpdateEventLocal,
    acknowledgeEventLocal: onAcknowledgeEventLocal,
    clearError: onClearError,
  }
}
