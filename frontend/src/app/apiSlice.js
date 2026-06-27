import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
    : 'http://localhost:5001',
  prepareHeaders: (headers) => {
    // 1. JWT access token
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    // 2. CSRF token — required for all mutating requests (POST/PUT/PATCH/DELETE)
    // Read and attach if present in cookies. harmless on GETs.
    const csrfToken = getCookie('csrfToken')
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken)
    }

    return headers
  },
  credentials: 'include', // equivalent to withCredentials: true
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const urlString = typeof args === 'string' ? args : args.url || ''
    const isAuthRoute = urlString.includes('/auth/refresh') || 
                        urlString.includes('/auth/login') || 
                        urlString.includes('/auth/signup') ||
                        urlString.includes('/auth/google/token')

    if (isAuthRoute) {
      return result
    }

    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
        // Retry the original query (prepareHeaders will automatically run again and fetch the new token)
        result = await baseQuery(args, api, extraOptions)
      } catch (err) {
        return result
      }
    } else {
      isRefreshing = true

      try {
        const refreshResult = await baseQuery(
          {
            url: '/api/v1/auth/refresh',
            method: 'POST',
            body: {}
          },
          api,
          extraOptions
        )

        if (refreshResult.data) {
          const newToken = refreshResult.data.data.accessToken
          localStorage.setItem('accessToken', newToken)

          processQueue(null, newToken)

          // Retry the original query
          result = await baseQuery(args, api, extraOptions)
        } else {
          processQueue(refreshResult.error, null)
          localStorage.removeItem('accessToken')
          api.dispatch({ type: 'auth/logout' })
          window.location.href = '/auth/login'
        }
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('accessToken')
        api.dispatch({ type: 'auth/logout' })
        window.location.href = '/auth/login'
      } finally {
        isRefreshing = false
      }
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Trip', 'Draft', 'Review', 'DiscoverFeed'],
  endpoints: () => ({}),
})
