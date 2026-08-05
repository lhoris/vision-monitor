/**
 * Redux Slice for Events
 * Phase 3에서 구현
 */

import { createSlice } from '@reduxjs/toolkit'
import type { Event } from '@/types'

interface EventState {
  events: Event[]
  loading: boolean
  error: string | null
  filter: {
    severity?: string
    camera?: number
  }
}

const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
  filter: {},
}

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    // TODO: Phase 3에서 구현
  },
})

export default eventSlice.reducer
