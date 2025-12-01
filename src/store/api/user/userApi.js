import { apiSlice } from '../apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users
    getAllUsers: builder.query({
      query: () => '/users/getAllUser',
      transformResponse: (response) => {
        // Backend returns { status: true, details: [...] }
        // Return the response as-is so we can access response.details
        return response;
      },
      providesTags: ['Users']
    }),

    // Get referred users
    getReferredUsers: builder.query({
      query: ({ page = 1, limit = 20, userId } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (userId) params.append('userId', userId);
        
        return `/user/admin/getReferredUsers?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.users.map(({ _id }) => ({ type: 'ReferredUsers', id: _id })),
              'ReferredUsers',
            ]
          : ['ReferredUsers'],
    }),

    // Get referral statistics
    getReferralStats: builder.query({
      query: () => '/user/admin/getReferralStats',
      providesTags: ['ReferralStats']
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetReferredUsersQuery,
  useGetReferralStatsQuery,
} = userApi;
