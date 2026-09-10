import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { commonCodeService } from '@/services/commonCodeService'
import type { RuntimeCommonCodes } from '@/types/commonCode'

interface CommonCodeState extends RuntimeCommonCodes { status: 'idle' | 'loading' | 'succeeded' | 'failed'; error: string | null }
const initialState: CommonCodeState = { version: '', codes: {}, status: 'idle', error: null }

export const fetchCommonCodes = createAsyncThunk('commonCode/bootstrap', () => commonCodeService.bootstrap())
export const fetchCommonCodeNames = createAsyncThunk('commonCode/fetchNames', (names: string[]) => commonCodeService.find(names))

const commonCodeSlice = createSlice({
  name: 'commonCode', initialState,
  reducers: {
    clearCommonCodes: () => initialState,
    mergeCommonCodes: (state, action: PayloadAction<RuntimeCommonCodes>) => { state.codes = { ...state.codes, ...action.payload.codes }; state.version = action.payload.version },
  },
  extraReducers: (builder) => builder
    .addCase(fetchCommonCodes.pending, (state) => { state.status = 'loading'; state.error = null })
    .addCase(fetchCommonCodes.fulfilled, (state, action) => { state.status = 'succeeded'; state.version = action.payload.version; state.codes = action.payload.codes })
    .addCase(fetchCommonCodes.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message ?? 'Failed to load common codes' })
    .addCase(fetchCommonCodeNames.fulfilled, (state, action) => { state.version = action.payload.version; state.codes = { ...state.codes, ...action.payload.codes } })
    .addCase('auth/logout', () => initialState)
    .addCase('auth/logoutUser/fulfilled', () => initialState),
})

export const { clearCommonCodes, mergeCommonCodes } = commonCodeSlice.actions
export default commonCodeSlice.reducer
