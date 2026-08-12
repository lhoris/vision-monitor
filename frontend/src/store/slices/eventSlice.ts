/**
 * Redux Slice for Events
 * 이벤트/알림 상태 관리
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { eventService } from '@/services/eventService'
import type { Event, AlertSetting } from '@/types'

interface EventFilter {
  severity?: 'low' | 'medium' | 'high' | 'critical'
  cameraId?: number
  type?: string
  startDate?: Date
  endDate?: Date
}

interface EventState {
  events: Event[]
  selectedEvent: Event | null
  alertSettings: AlertSetting[]
  loading: boolean
  error: string | null
  filter: EventFilter
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  alertSettings: [],
  loading: false,
  error: null,
  filter: {},
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
}

/**
 * Async Thunks
 */
export const fetchEvents = createAsyncThunk(
  'event/fetchEvents',
  async (params?: { page?: number; pageSize?: number; cameraId?: number; severity?: string }) => {
    const response = await eventService.getEvents(params)
    return response
  }
)

export const fetchCameraEvents = createAsyncThunk(
  'event/fetchCameraEvents',
  async ({ cameraId, params }: { cameraId: number; params?: { page?: number; pageSize?: number } }) => {
    const response = await eventService.getCameraEvents(cameraId, params)
    return response
  }
)

export const acknowledgeEventAsync = createAsyncThunk(
  'event/acknowledgeEvent',
  async (eventId: number) => {
    const event = await eventService.acknowledgeEvent(eventId)
    return event
  }
)

export const acknowledgeEventsAsync = createAsyncThunk(
  'event/acknowledgeEvents',
  async (eventIds: number[]) => {
    const success = await eventService.acknowledgeEvents(eventIds)
    return { success, eventIds }
  }
)

export const deleteEventAsync = createAsyncThunk(
  'event/deleteEvent',
  async (eventId: number) => {
    const success = await eventService.deleteEvent(eventId)
    return { success, eventId }
  }
)

export const fetchAlertSettings = createAsyncThunk(
  'event/fetchAlertSettings',
  async (cameraId?: number) => {
    const settings = await eventService.getAlertSettings(cameraId)
    return settings
  }
)

export const createAlertSettingAsync = createAsyncThunk(
  'event/createAlertSetting',
  async (setting: Omit<AlertSetting, 'id'>) => {
    const newSetting = await eventService.createAlertSetting(setting)
    return newSetting
  }
)

export const updateAlertSettingAsync = createAsyncThunk(
  'event/updateAlertSetting',
  async ({ id, setting }: { id: number; setting: Partial<AlertSetting> }) => {
    const updatedSetting = await eventService.updateAlertSetting(id, setting)
    return updatedSetting
  }
)

export const deleteAlertSettingAsync = createAsyncThunk(
  'event/deleteAlertSetting',
  async (id: number) => {
    const success = await eventService.deleteAlertSetting(id)
    return { success, id }
  }
)

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload
    },
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.unshift(action.payload)
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(e => e.id === action.payload.id)
      if (index !== -1) {
        state.events[index] = action.payload
      }
    },
    acknowledgeEvent: (state, action: PayloadAction<number>) => {
      const event = state.events.find(e => e.id === action.payload)
      if (event) {
        event.acknowledged = true
      }
    },
    setFilter: (state, action: PayloadAction<EventFilter>) => {
      state.filter = action.payload
    },
    setPagination: (
      state,
      action: PayloadAction<{
        page: number
        pageSize: number
        total: number
      }>
    ) => {
      state.pagination = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchEvents
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.events = action.payload.content
          state.pagination = {
            page: action.payload.currentPage,
            pageSize: action.payload.pageSize,
            total: action.payload.totalElements,
          }
        }
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch events'
      })

    // fetchCameraEvents
    builder
      .addCase(fetchCameraEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCameraEvents.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.events = action.payload.content
          state.pagination = {
            page: action.payload.currentPage,
            pageSize: action.payload.pageSize,
            total: action.payload.totalElements,
          }
        }
      })
      .addCase(fetchCameraEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch camera events'
      })

    // acknowledgeEvent
    builder
      .addCase(acknowledgeEventAsync.fulfilled, (state, action) => {
        const acknowledgedEvent = action.payload
        if (acknowledgedEvent) {
          const index = state.events.findIndex((e) => e.id === acknowledgedEvent.id)
          if (index !== -1) {
            state.events[index].acknowledged = true
          }
        }
      })
      .addCase(acknowledgeEventAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to acknowledge event'
      })

    // acknowledgeEvents
    builder
      .addCase(acknowledgeEventsAsync.fulfilled, (state, action) => {
        if (action.payload.success) {
          action.payload.eventIds.forEach((eventId) => {
            const index = state.events.findIndex((e) => e.id === eventId)
            if (index !== -1) {
              state.events[index].acknowledged = true
            }
          })
        }
      })
      .addCase(acknowledgeEventsAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to acknowledge events'
      })

    // deleteEvent
    builder
      .addCase(deleteEventAsync.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.events = state.events.filter((e) => e.id !== action.payload.eventId)
        }
      })
      .addCase(deleteEventAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete event'
      })

    // fetchAlertSettings
    builder
      .addCase(fetchAlertSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAlertSettings.fulfilled, (state, action) => {
        state.loading = false
        state.alertSettings = action.payload
      })
      .addCase(fetchAlertSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch alert settings'
      })

    // createAlertSetting
    builder
      .addCase(createAlertSettingAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAlertSettingAsync.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.alertSettings.push(action.payload)
        }
      })
      .addCase(createAlertSettingAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create alert setting'
      })

    // updateAlertSetting
    builder
      .addCase(updateAlertSettingAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAlertSettingAsync.fulfilled, (state, action) => {
        state.loading = false
        const updatedSetting = action.payload
        if (updatedSetting) {
          const index = state.alertSettings.findIndex((s) => s.id === updatedSetting.id)
          if (index !== -1) {
            state.alertSettings[index] = updatedSetting
          }
        }
      })
      .addCase(updateAlertSettingAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update alert setting'
      })

    // deleteAlertSetting
    builder
      .addCase(deleteAlertSettingAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAlertSettingAsync.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.success) {
          state.alertSettings = state.alertSettings.filter((s) => s.id !== action.payload.id)
        }
      })
      .addCase(deleteAlertSettingAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete alert setting'
      })
  },
})

export const {
  setEvents,
  setSelectedEvent,
  addEvent,
  updateEvent,
  acknowledgeEvent,
  setFilter,
  setPagination,
  setLoading,
  setError,
  clearError,
} = eventSlice.actions

export default eventSlice.reducer
