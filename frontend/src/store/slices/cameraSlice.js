/**
 * Redux Slice for Camera
 * 카메라 상태 관리 (목록, 선택, 상태 등)
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cameraService } from '@/services/cameraService';
const initialState = {
    cameras: [],
    selectedCamera: null,
    loading: false,
    error: null,
    selectedCameraId: null,
};
/**
 * Async Thunks
 */
export const fetchAllCameras = createAsyncThunk('camera/fetchAllCameras', async () => {
    const cameras = await cameraService.getAllCameras();
    return cameras;
});
export const fetchCameraDetail = createAsyncThunk('camera/fetchCameraDetail', async (cameraId) => {
    const camera = await cameraService.getCameraDetail(cameraId);
    return camera;
});
export const createCameraAsync = createAsyncThunk('camera/createCamera', async (camera) => {
    const newCamera = await cameraService.createCamera(camera);
    return newCamera;
});
export const updateCameraAsync = createAsyncThunk('camera/updateCamera', async ({ id, camera }) => {
    const updatedCamera = await cameraService.updateCamera(id, camera);
    return updatedCamera;
});
export const deleteCameraAsync = createAsyncThunk('camera/deleteCamera', async (cameraId) => {
    const success = await cameraService.deleteCamera(cameraId);
    return { success, cameraId };
});
const cameraSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        setCameras: (state, action) => {
            state.cameras = action.payload;
        },
        setSelectedCamera: (state, action) => {
            state.selectedCamera = action.payload;
            if (action.payload) {
                state.selectedCameraId = action.payload.id;
            }
        },
        clearSelectedCamera: (state) => {
            state.selectedCameraId = null;
            state.selectedCamera = null;
        },
        addCamera: (state, action) => {
            state.cameras.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchAllCameras
        builder
            .addCase(fetchAllCameras.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchAllCameras.fulfilled, (state, action) => {
            state.loading = false;
            state.cameras = action.payload;
        })
            .addCase(fetchAllCameras.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to fetch cameras';
        });
        // fetchCameraDetail
        builder
            .addCase(fetchCameraDetail.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchCameraDetail.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedCamera = action.payload;
        })
            .addCase(fetchCameraDetail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to fetch camera detail';
        });
        // createCamera
        builder
            .addCase(createCameraAsync.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(createCameraAsync.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload) {
                state.cameras.push(action.payload);
            }
        })
            .addCase(createCameraAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to create camera';
        });
        // updateCamera
        builder
            .addCase(updateCameraAsync.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(updateCameraAsync.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload) {
                const index = state.cameras.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.cameras[index] = action.payload;
                }
                if (state.selectedCamera?.id === action.payload.id) {
                    state.selectedCamera = action.payload;
                }
            }
        })
            .addCase(updateCameraAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to update camera';
        });
        // deleteCamera
        builder
            .addCase(deleteCameraAsync.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(deleteCameraAsync.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload.success) {
                state.cameras = state.cameras.filter((c) => c.id !== action.payload.cameraId);
                if (state.selectedCameraId === action.payload.cameraId) {
                    state.selectedCameraId = null;
                    state.selectedCamera = null;
                }
            }
        })
            .addCase(deleteCameraAsync.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to delete camera';
        });
    },
});
export const { setCameras, setSelectedCamera, clearSelectedCamera, addCamera, setLoading, setError, clearError, } = cameraSlice.actions;
export default cameraSlice.reducer;
