import { apiSlice } from '@/app/apiSlice'

export const tripsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyTrips: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/api/v1/trips/my-trips',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.trips
          ? [
              ...result.trips.map(({ _id }) => ({ type: 'Trip', id: _id })),
              { type: 'Trip', id: 'LIST' },
            ]
          : [{ type: 'Trip', id: 'LIST' }],
    }),
    getTrip: builder.query({
      query: (id) => `/api/v1/trips/${id}`,
      providesTags: (result, error, id) => [{ type: 'Trip', id }],
    }),
    likeTrip: builder.mutation({
      query: (id) => ({
        url: `/api/v1/trips/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Trip', id },
        'DiscoverFeed',
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          tripsApi.util.updateQueryData('getTrip', id, (draft) => {
            if (draft) {
              draft.isLiked = !draft.isLiked
              draft.likesCount = draft.isLiked
                ? (draft.likesCount || 0) + 1
                : Math.max(0, (draft.likesCount || 1) - 1)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    saveTrip: builder.mutation({
      query: (id) => ({
        url: `/api/v1/trips/${id}/save`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Trip', id },
        'DiscoverFeed',
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          tripsApi.util.updateQueryData('getTrip', id, (draft) => {
            if (draft) {
              draft.isSaved = !draft.isSaved
              draft.savesCount = draft.isSaved
                ? (draft.savesCount || 0) + 1
                : Math.max(0, (draft.savesCount || 1) - 1)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    cloneTrip: builder.mutation({
      query: (id) => ({
        url: `/api/v1/trips/${id}/clone`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
    }),
    deleteTrip: builder.mutation({
      query: (id) => ({
        url: `/api/v1/trips/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
    }),
    shareTrip: builder.mutation({
      query: (id) => ({
        url: `/api/v1/trips/${id}/share`,
        method: 'POST',
      }),
    }),
    addComment: builder.mutation({
      query: ({ tripId, text }) => ({
        url: `/api/v1/trips/${tripId}/comment`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (result, error, { tripId }) => [{ type: 'Trip', id: tripId }],
      async onQueryStarted({ tripId, text }, { dispatch, queryFulfilled, getState }) {
        const state = getState()
        const currentUser = state.auth?.user

        const tempComment = {
          _id: 'temp-id-' + Date.now(),
          text,
          userId: {
            _id: currentUser?._id,
            name: currentUser?.name || 'Me',
            avatar: currentUser?.avatar,
          },
          createdAt: new Date().toISOString(),
        }

        const patchResult = dispatch(
          tripsApi.util.updateQueryData('getTrip', tripId, (draft) => {
            if (draft) {
              draft.comments = draft.comments || []
              draft.comments.push(tempComment)
              draft.commentsCount = (draft.commentsCount || 0) + 1
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMyTripsQuery,
  useGetTripQuery,
  useLikeTripMutation,
  useSaveTripMutation,
  useCloneTripMutation,
  useDeleteTripMutation,
  useShareTripMutation,
  useAddCommentMutation,
} = tripsApi
