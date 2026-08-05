/**
 * Redux Slice for Camera
 * Phase 3에서 구현
 */

import { createSlice } from '@reduxjs/toolkit'
import type { Camera } from '@/types/camera'

interface CameraState {
  cameras: Camera[]
  loading: boolean
  error: string | null
  selectedCameraId: number | null
}

const initialState: CameraState = {
  cameras: [],
  loading: false,
  error: null,
  selectedCameraId: null,
}

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    // TODO: Phase 3에서 구현
  },
})

export default cameraSlice.reducer
