import { apiSlice } from '@/app/apiSlice'

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (data) => ({
        url: '/api/v1/auth/signup',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: '/api/v1/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resendOTP: builder.mutation({
      query: (data) => ({
        url: '/api/v1/auth/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
    login: builder.mutation({
      query: (data) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    mfaVerify: builder.mutation({
      query: (data) => ({
        url: '/api/v1/auth/mfa/verify-login',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/api/v1/auth/logout',
        method: 'POST',
      }),
    }),
    fetchMe: builder.query({
      query: () => '/api/v1/users/me',
      providesTags: ['User'],
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/api/v1/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/api/v1/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useSignupMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useLoginMutation,
  useMfaVerifyMutation,
  useLogoutMutation,
  useFetchMeQuery,
  useLazyFetchMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi
