import { apiSlice } from '@/app/apiSlice'

export const plannerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generatePlan: builder.mutation({
      query: (formData) => ({
        url: '/api/v1/trips',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
    }),
    saveTripSelections: builder.mutation({
      query: ({ tripId, selections }) => ({
        url: `/api/v1/trips/${tripId}`,
        method: 'PUT',
        body: { selections },
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: 'Trip', id: tripId },
        { type: 'Trip', id: 'LIST' },
      ],
    }),
    regenerateDay: builder.mutation({
      query: (data) => ({
        url: '/api/v1/planner/regenerate-day',
        method: 'POST',
        body: data,
      }),
    }),
    getDrafts: builder.query({
      query: (tripId) => `/api/v1/trips/${tripId}/drafts`,
      providesTags: (result, error, tripId) => [{ type: 'Draft', id: tripId }],
    }),
    saveDraft: builder.mutation({
      query: ({ tripId, ...data }) => ({
        url: `/api/v1/trips/${tripId}/drafts`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { tripId }) => [{ type: 'Draft', id: tripId }],
    }),
    deleteDraft: builder.mutation({
      query: ({ tripId, draftId }) => ({
        url: `/api/v1/trips/${tripId}/drafts/${draftId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { tripId }) => [{ type: 'Draft', id: tripId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGeneratePlanMutation,
  useSaveTripSelectionsMutation,
  useRegenerateDayMutation,
  useGetDraftsQuery,
  useSaveDraftMutation,
  useDeleteDraftMutation,
} = plannerApi
