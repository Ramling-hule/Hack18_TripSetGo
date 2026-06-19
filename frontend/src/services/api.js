// src/services/api.js — Axios instance with JWT + CSRF interceptors
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
    : 'http://localhost:5001',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// ── Helper: read a cookie value by name ──────────────────────────────────────
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

// ── Request interceptor: attach access token + CSRF header ───────────────────
// The backend sets a `csrfToken` cookie on every GET response (httpOnly: false).
// For all mutating requests (POST/PUT/PATCH/DELETE) we read that cookie and
// echo it back in the `x-csrf-token` header — this is the double-submit pattern.
api.interceptors.request.use(
  (config) => {
    // 1. JWT access token
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`

    // 2. CSRF token — required for all mutating requests
    const safeMethods = ['GET', 'HEAD', 'OPTIONS']
    if (!safeMethods.includes((config.method || '').toUpperCase())) {
      const csrfToken = getCookie('csrfToken')
      if (csrfToken) config.headers['x-csrf-token'] = csrfToken
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: refresh token on 401 ───────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const baseUrl = import.meta.env.VITE_API_URL
          ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
          : 'http://localhost:5001'
        const { data } = await axios.post(
          `${baseUrl}/api/v1/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: { 'x-csrf-token': getCookie('csrfToken') || '' },
          }
        )
        const newToken = data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        api.defaults.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
