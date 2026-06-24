import { apiSlice } from '@/app/apiSlice'

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTargetReviews: builder.query({
      query: ({ targetType, targetId }) => `/api/v1/reviews/target/${targetType}/${targetId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Review', id: _id })),
              { type: 'Review', id: 'LIST' },
            ]
          : [{ type: 'Review', id: 'LIST' }],
    }),
    addReview: builder.mutation({
      query: (data) => ({
        url: '/api/v1/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),
    editReview: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/reviews/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Review', id },
        { type: 'Review', id: 'LIST' },
      ],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/api/v1/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),
    uploadReviewImages: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/v1/reviews/${id}/images`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Review', id }],
    }),
    toggleHelpful: builder.mutation({
      query: (id) => ({
        url: `/api/v1/reviews/${id}/helpful`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Review', id }],
    }),
    reportReview: builder.mutation({
      query: (id) => ({
        url: `/api/v1/reviews/${id}/report`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Review', id }],
    }),

    // Admin Review Endpoints
    getAdminReviews: builder.query({
      query: (params) => ({
        url: '/api/v1/admin/reviews',
        params,
      }),
      providesTags: (result) =>
        result?.reviews
          ? [
              ...result.reviews.map(({ _id }) => ({ type: 'Review', id: _id })),
              { type: 'Review', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Review', id: 'ADMIN_LIST' }],
    }),
    deleteReviewAdmin: builder.mutation({
      query: (id) => ({
        url: `/api/v1/admin/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Review', id },
        { type: 'Review', id: 'ADMIN_LIST' },
        { type: 'Review', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTargetReviewsQuery,
  useAddReviewMutation,
  useEditReviewMutation,
  useDeleteReviewMutation,
  useUploadReviewImagesMutation,
  useToggleHelpfulMutation,
  useReportReviewMutation,
  useGetAdminReviewsQuery,
  useDeleteReviewAdminMutation,
} = reviewsApi
