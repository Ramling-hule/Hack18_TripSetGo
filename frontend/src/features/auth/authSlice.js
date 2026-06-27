import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from './authApi'

// ── Async Thunk Wrappers for Backward Compatibility ──────────────────────────

export const signup = createAsyncThunk('auth/signup', async (data, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(authApi.endpoints.signup.initiate(data)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Signup failed')
  }
})

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async (data, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(authApi.endpoints.verifyOTP.initiate(data)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'OTP verification failed')
  }
})

export const resendOTP = createAsyncThunk('auth/resendOTP', async (data, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(authApi.endpoints.resendOTP.initiate(data)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to resend OTP')
  }
})

export const login = createAsyncThunk('auth/login', async (data, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(authApi.endpoints.login.initiate(data)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Login failed')
  }
})

export const mfaVerify = createAsyncThunk('auth/mfaVerify', async (data, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(authApi.endpoints.mfaVerify.initiate(data)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'MFA verification failed')
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch, rejectWithValue }) => {
  try {
    const result = await dispatch(authApi.endpoints.logout.initiate()).unwrap()
    localStorage.removeItem('accessToken')
    return result
  } catch (err) {
    localStorage.removeItem('accessToken')
    return rejectWithValue(err.data?.message || err.message || 'Logout failed')
  }
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(authApi.endpoints.fetchMe.initiate(undefined, { forceRefetch: true })).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to fetch user')
  }
})

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (data, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(authApi.endpoints.forgotPassword.initiate(data)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Failed to send reset email')
  }
})

export const resetPassword = createAsyncThunk('auth/resetPassword', async (data, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(authApi.endpoints.resetPassword.initiate(data)).unwrap()
  } catch (err) {
    return rejectWithValue(err.data?.message || err.message || 'Reset failed')
  }
})

const initialState = {
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: null,
  pendingEmail: null, // used for OTP flow
  mfaPending: false,  // true when MFA challenge is active
  mfaToken: null,     // temporary MFA token from backend
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    clearSuccess: (state) => { state.successMessage = null },
    setPendingEmail: (state, action) => { state.pendingEmail = action.payload },
    clearMfa: (state) => { state.mfaPending = false; state.mfaToken = null },
    setGoogleUser: (state, action) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.isAuthenticated = true
      localStorage.setItem('accessToken', accessToken)
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, { payload }) => {
        state.loading = false
        const data = payload.data || payload
        state.pendingEmail = data.email
        state.successMessage = 'OTP sent to your email'
      })
      .addCase(signup.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false
        state.successMessage = 'Email verified! Please log in.'
      })
      .addCase(verifyOTP.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resendOTP.fulfilled, (state, { payload }) => {
        state.loading = false
        state.successMessage = payload?.message || 'A new OTP has been sent'
      })
      .addCase(resendOTP.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false
        const data = payload.data || payload
        if (data.mfaRequired) {
          state.mfaPending = true
          state.mfaToken   = data.mfaToken
        } else {
          state.user = data.user
          state.accessToken = data.accessToken
          state.isAuthenticated = true
        }
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // MFA verify
      .addCase(mfaVerify.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(mfaVerify.fulfilled, (state, { payload }) => {
        state.loading = false
        const data = payload.data || payload
        state.user = data.user
        state.accessToken = data.accessToken
        state.isAuthenticated = true
        state.mfaPending = false
        state.mfaToken   = null
      })
      .addCase(mfaVerify.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.mfaPending = false
        state.mfaToken   = null
      })

    // FetchMe
      .addCase(fetchMe.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        const data = payload.data || payload
        state.user = data
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.accessToken = null
        state.loading = false
      })

    // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state, { payload }) => {
        state.loading = false
        state.successMessage = payload?.message || 'Reset password email sent'
      })
      .addCase(forgotPassword.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state, { payload }) => {
        state.loading = false
        state.successMessage = payload?.message || 'Password reset successful'
      })
      .addCase(resetPassword.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
  },
})

export const { clearError, clearSuccess, setPendingEmail, clearMfa, setGoogleUser, updateUser } = authSlice.actions

// Selectors
export const selectAuth            = (state) => state.auth
export const selectUser            = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading     = (state) => state.auth.loading
export const selectAuthError       = (state) => state.auth.error
export const selectMfaPending      = (state) => state.auth.mfaPending
export const selectMfaToken        = (state) => state.auth.mfaToken

export default authSlice.reducer
