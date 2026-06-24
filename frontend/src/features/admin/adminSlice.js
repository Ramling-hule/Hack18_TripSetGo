// src/features/admin/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

// ── Async Thunks ─────────────────────────────────────────────────────────

export const fetchAnalytics = createAsyncThunk('admin/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/v1/admin/analytics')
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics')
  }
})

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/v1/admin/users', { params })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users')
  }
})

export const updateUserStatus = createAsyncThunk('admin/updateUserStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/v1/admin/users/${id}/status`, { status })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update status')
  }
})

export const updateUserRole = createAsyncThunk('admin/updateUserRole', async ({ id, role }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/v1/admin/users/${id}/role`, { role })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update role')
  }
})

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/v1/admin/users/${id}`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete user')
  }
})

import { reviewsApi } from '../reviews/reviewsApi'

export const fetchReviews = createAsyncThunk('admin/fetchReviews', async (params, { dispatch, rejectWithValue }) => {
  try {
    const result = await dispatch(reviewsApi.endpoints.getAdminReviews.initiate(params)).unwrap()
    return result
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch reviews')
  }
})

export const deleteReview = createAsyncThunk('admin/deleteReview', async (id, { dispatch, rejectWithValue }) => {
  try {
    await dispatch(reviewsApi.endpoints.deleteReviewAdmin.initiate(id)).unwrap()
    return id
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete review')
  }
})

export const fetchDestinations = createAsyncThunk('admin/fetchDestinations', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/v1/admin/destinations', { params })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch destinations')
  }
})

export const createDestination = createAsyncThunk('admin/createDestination', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/v1/admin/destinations', data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create destination')
  }
})

export const updateDestination = createAsyncThunk('admin/updateDestination', async ({ type, id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/v1/admin/destinations/${type}/${id}`, data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update destination')
  }
})

export const deleteDestination = createAsyncThunk('admin/deleteDestination', async ({ type, id }, { rejectWithValue }) => {
  try {
    await api.delete(`/api/v1/admin/destinations/${type}/${id}`)
    return { type, id }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete destination')
  }
})

export const fetchReports = createAsyncThunk('admin/fetchReports', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/v1/admin/reports', { params })
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch reports')
  }
})

// ── Slice ─────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    analytics: null,
    users: [],
    usersPagination: null,
    reviews: [],
    reviewsPagination: null,
    destinations: [],
    destinationsPagination: null,
    reports: [],
    reportsPagination: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null },
    clearAdminSuccess: (state) => { state.successMessage = null },
  },
  extraReducers: (builder) => {
    builder
      // Analytics
      .addCase(fetchAnalytics.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAnalytics.fulfilled, (state, { payload }) => {
        state.loading = false
        state.analytics = payload
      })
      .addCase(fetchAnalytics.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      // Users
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.loading = false
        state.users = payload.users
        state.usersPagination = payload.pagination
      })
      .addCase(fetchUsers.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(updateUserStatus.fulfilled, (state, { payload }) => {
        const idx = state.users.findIndex(u => u._id === payload._id)
        if (idx !== -1) state.users[idx] = payload
        state.successMessage = 'User status updated successfully'
      })
      .addCase(updateUserRole.fulfilled, (state, { payload }) => {
        const idx = state.users.findIndex(u => u._id === payload._id)
        if (idx !== -1) state.users[idx] = payload
        state.successMessage = 'User role updated successfully'
      })
      .addCase(deleteUser.fulfilled, (state, { payload: id }) => {
        state.users = state.users.filter(u => u._id !== id)
        state.successMessage = 'User soft-deleted successfully'
      })

      // Reviews
      .addCase(fetchReviews.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchReviews.fulfilled, (state, { payload }) => {
        state.loading = false
        state.reviews = payload.reviews
        state.reviewsPagination = payload.pagination
      })
      .addCase(fetchReviews.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(deleteReview.fulfilled, (state, { payload: id }) => {
        state.reviews = state.reviews.filter(r => r._id !== id)
        state.successMessage = 'Review deleted successfully'
      })

      // Destinations
      .addCase(fetchDestinations.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchDestinations.fulfilled, (state, { payload }) => {
        state.loading = false
        state.destinations = payload.destinations
        state.destinationsPagination = payload.pagination
      })
      .addCase(fetchDestinations.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(createDestination.fulfilled, (state, { payload }) => {
        state.destinations.unshift(payload)
        state.successMessage = 'Destination created successfully'
      })
      .addCase(updateDestination.fulfilled, (state, { payload }) => {
        const idx = state.destinations.findIndex(d => d._id === payload._id)
        if (idx !== -1) state.destinations[idx] = payload
        state.successMessage = 'Destination updated successfully'
      })
      .addCase(deleteDestination.fulfilled, (state, { payload }) => {
        state.destinations = state.destinations.filter(d => d._id !== payload.id)
        state.successMessage = 'Destination deleted successfully'
      })

      // Reports
      .addCase(fetchReports.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchReports.fulfilled, (state, { payload }) => {
        state.loading = false
        state.reports = payload.auditLogs
        state.reportsPagination = payload.pagination
      })
      .addCase(fetchReports.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
  }
})

export const { clearAdminError, clearAdminSuccess } = adminSlice.actions

export const selectAdmin = (state) => state.admin

export default adminSlice.reducer
