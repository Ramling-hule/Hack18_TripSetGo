import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { tripsApi } from './tripsApi'

// ── Async Thunk Wrappers for Backward Compatibility ──────────────────────────

export const fetchMyTrips = createAsyncThunk('trips/fetchMyTrips', async ({ page = 1, limit = 10 } = {}, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(tripsApi.endpoints.getMyTrips.initiate({ page, limit }, { forceRefetch: true })).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to fetch trips')
  }
})

export const fetchTrip = createAsyncThunk('trips/fetchTrip', async (id, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(tripsApi.endpoints.getTrip.initiate(id, { forceRefetch: true })).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to fetch trip')
  }
})

export const likeTrip = createAsyncThunk('trips/likeTrip', async (id, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(tripsApi.endpoints.likeTrip.initiate(id)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to like trip')
  }
})

export const saveTrip = createAsyncThunk('trips/saveTrip', async (id, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(tripsApi.endpoints.saveTrip.initiate(id)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to save trip')
  }
})

export const cloneTrip = createAsyncThunk('trips/cloneTrip', async (id, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(tripsApi.endpoints.cloneTrip.initiate(id)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to clone trip')
  }
})

export const deleteTrip = createAsyncThunk('trips/deleteTrip', async (id, { dispatch, rejectWithValue }) => {
  try {
    await dispatch(tripsApi.endpoints.deleteTrip.initiate(id)).unwrap()
    return id
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to delete trip')
  }
})

export const shareTrip = createAsyncThunk('trips/shareTrip', async (id, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(tripsApi.endpoints.shareTrip.initiate(id)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to share trip')
  }
})

export const addComment = createAsyncThunk('trips/addComment', async ({ tripId, text }, { dispatch, rejectWithValue }) => {
  try {
    const comment = await dispatch(tripsApi.endpoints.addComment.initiate({ tripId, text })).unwrap()
    return { tripId, comment }
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to add comment')
  }
})

const initialState = {
  trips: [],
  currentTrip: null,
  total: 0,
  page: 1,
  hasMore: true,
  loading: false,
  error: null,
}

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    clearCurrentTrip: (state) => { state.currentTrip = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTrips.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyTrips.fulfilled, (state, { payload }) => {
        state.loading = false
        const data = payload.data || payload
        state.trips   = data.trips || []
        state.total   = data.total || 0
        state.hasMore = data.hasMore || false
      })
      .addCase(fetchMyTrips.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

      .addCase(fetchTrip.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTrip.fulfilled, (state, { payload }) => {
        state.loading = false
        state.currentTrip = payload.data || payload
      })
      .addCase(fetchTrip.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

      .addCase(likeTrip.fulfilled, (state, { payload }) => {
        const data = payload.data || payload
        const t = state.trips.find(t => t._id === data.id || t._id === payload.id)
        if (t) {
          t.likesCount = data.likesCount
          t.isLiked = data.isLiked
        }
        if (state.currentTrip?._id === (data.id || payload.id)) {
          state.currentTrip.likesCount = data.likesCount
          state.currentTrip.isLiked = data.isLiked
        }
      })

      .addCase(saveTrip.fulfilled, (state, { payload }) => {
        const data = payload.data || payload
        const t = state.trips.find(t => t._id === data.id || t._id === payload.id)
        if (t) {
          t.savesCount = data.savesCount
          t.isSaved = data.isSaved
        }
        if (state.currentTrip?._id === (data.id || payload.id)) {
          state.currentTrip.savesCount = data.savesCount
          state.currentTrip.isSaved = data.isSaved
        }
      })

      .addCase(cloneTrip.fulfilled, (state, { payload }) => {
        const data = payload.data || payload
        state.trips.unshift(data)
      })

      .addCase(deleteTrip.fulfilled, (state, { payload: id }) => {
        state.trips = state.trips.filter(t => t._id !== id)
      })

      .addCase(addComment.fulfilled, (state, { payload }) => {
        const data = payload.comment || payload
        if (state.currentTrip?._id === payload.tripId) {
          state.currentTrip.comments = state.currentTrip.comments || []
          state.currentTrip.comments.push(data)
          state.currentTrip.commentsCount = (state.currentTrip.commentsCount || 0) + 1
        }
      })
  },
})

export const { clearError, clearCurrentTrip } = tripsSlice.actions

export const selectTrips        = (state) => state.trips.trips
export const selectCurrentTrip  = (state) => state.trips.currentTrip
export const selectTripsLoading = (state) => state.trips.loading
export const selectTripsError   = (state) => state.trips.error

export default tripsSlice.reducer
