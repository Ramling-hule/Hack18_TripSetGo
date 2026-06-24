import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { discoverApi } from './discoverApi'
import { tripsApi } from '../trips/tripsApi'

// ── Async Thunk Wrappers for Backward Compatibility ──────────────────────────

export const fetchFeed = createAsyncThunk('discover/fetchFeed', async ({ cursor, filters } = {}, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(discoverApi.endpoints.getFeed.initiate({ cursor, filters })).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to fetch feed')
  }
})

export const searchTrips = createAsyncThunk('discover/searchTrips', async ({ query, filters }, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(discoverApi.endpoints.searchTrips.initiate({ query, filters })).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Search failed')
  }
})

export const fetchTrending = createAsyncThunk('discover/fetchTrending', async (_, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(discoverApi.endpoints.getTrending.initiate()).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to fetch trending')
  }
})

export const discoverLikeTrip = createAsyncThunk('discover/likeTrip', async (id, { dispatch, rejectWithValue }) => {
  try {
    const res = await dispatch(tripsApi.endpoints.likeTrip.initiate(id)).unwrap()
    return { id, ...res }
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to like trip')
  }
})

export const discoverSaveTrip = createAsyncThunk('discover/saveTrip', async (id, { dispatch, rejectWithValue }) => {
  try {
    const res = await dispatch(tripsApi.endpoints.saveTrip.initiate(id)).unwrap()
    return { id, ...res }
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to save trip')
  }
})

const initialState = {
  feed: [],
  trending: [],
  searchResults: null,
  cursor: null,
  hasMore: true,
  filters: {
    destination: '',
    minBudget: '',
    maxBudget: '',
    groupType: '',
    tags: [],
    sortBy: 'latest',
  },
  searchQuery: '',
  loading: false,
  loadingMore: false,
  error: null,
}

const discoverSlice = createSlice({
  name: 'discover',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.feed = []
      state.cursor = null
      state.hasMore = true
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    clearSearch: (state) => {
      state.searchResults = null
      state.searchQuery = ''
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Feed
      .addCase(fetchFeed.pending, (state, action) => {
        if (!action.meta.arg?.cursor) {
          state.loading = true
          state.feed = []
        } else {
          state.loadingMore = true
        }
        state.error = null
      })
      .addCase(fetchFeed.fulfilled, (state, { payload, meta }) => {
        state.loading = false
        state.loadingMore = false
        const data = payload.data || payload
        state.feed = meta.arg?.cursor ? [...state.feed, ...(data.trips || [])] : (data.trips || [])
        state.cursor  = data.nextCursor
        state.hasMore = data.hasMore
      })
      .addCase(fetchFeed.rejected, (state, { payload }) => {
        state.loading = false
        state.loadingMore = false
        state.error = payload
      })

      // Search
      .addCase(searchTrips.pending, (state) => {
        state.loading = true
      })
      .addCase(searchTrips.fulfilled, (state, { payload }) => {
        state.loading = false
        const data = payload.data || payload
        state.searchResults = data.trips || []
      })
      .addCase(searchTrips.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

      // Trending
      .addCase(fetchTrending.fulfilled, (state, { payload }) => {
        const data = payload.data || payload
        state.trending = data.destinations || []
      })

      // Like/Save in discover feed
      .addCase(discoverLikeTrip.fulfilled, (state, { payload }) => {
        const data = payload.data || payload
        const t = state.feed.find(t => t._id === payload.id)
        if (t) {
          t.likesCount = data.likesCount
          t.isLiked = data.isLiked
        }
      })
      .addCase(discoverSaveTrip.fulfilled, (state, { payload }) => {
        const data = payload.data || payload
        const t = state.feed.find(t => t._id === payload.id)
        if (t) {
          t.savesCount = data.savesCount
          t.isSaved = data.isSaved
        }
      })
  },
})

export const { setFilters, setSearchQuery, clearSearch, clearError } = discoverSlice.actions

export const selectFeed          = (state) => state.discover.feed
export const selectTrending      = (state) => state.discover.trending
export const selectSearchResults = (state) => state.discover.searchResults
export const selectDiscoverFilters = (state) => state.discover.filters
export const selectDiscoverLoading = (state) => state.discover.loading
export const selectHasMore       = (state) => state.discover.hasMore

export default discoverSlice.reducer
