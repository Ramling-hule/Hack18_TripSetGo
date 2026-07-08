import { apiSlice } from '@/app/apiSlice'

export const discoverApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query({
      query: ({ cursor, filters } = {}) => ({
        url: '/api/v1/discover/feed',
        params: { limit: 12, ...(cursor ? { cursor } : {}), ...filters },
      }),
      // Cache key based on filters only (cursor excluded) to support infinite scroll appending
      serializeQueryArgs: ({ queryArgs }) => {
        // eslint-disable-next-line no-unused-vars
        const { cursor, ...filters } = queryArgs || {}
        return filters
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems
        }
        return {
          ...currentCache,
          trips: [...(currentCache?.trips || []), ...(newItems?.trips || [])],
          nextCursor: newItems?.nextCursor,
          hasMore: newItems?.hasMore,
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return JSON.stringify(currentArg?.filters) !== JSON.stringify(previousArg?.filters)
      },
      providesTags: ['DiscoverFeed'],
    }),
    getTrending: builder.query({
      query: () => '/api/v1/discover/trending',
    }),
    searchTrips: builder.query({
      query: ({ query, filters }) => ({
        url: '/api/v1/discover/search',
        params: { q: query, ...filters },
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetFeedQuery,
  useGetTrendingQuery,
  useLazySearchTripsQuery,
} = discoverApi
