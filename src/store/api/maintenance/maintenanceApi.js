import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken, isTokenExpired, clearAuth } from '@/utils/auth';

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: "https://www.preciousgoldsmith.net/api/v0/maintenance",
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage or sessionStorage using utility function
      const token = getToken();
      
      if (token) {
        // Check if token is expired before making the request
        if (isTokenExpired(token)) {
          console.log('Maintenance API Request: Token is expired, clearing auth');
          clearAuth();
          // Redirect to login will be handled by the component
          return headers;
        }
        
        headers.set('authorization', `Bearer ${token}`);
        console.log('Maintenance API Request: Valid token added to headers');
      } else {
        console.log('Maintenance API Request: No token found');
      }
      
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized responses
  // Only clear auth if token is actually expired, not on all 401 errors
  if (result.error && result.error.status === 401) {
    const token = getToken();
    console.log('Maintenance API Response: 401 Unauthorized');
    
    // Only clear auth if token is expired or missing
    if (!token || isTokenExpired(token)) {
      console.log('Maintenance API Response: Token is expired or missing, clearing auth');
      clearAuth();
    } else {
      console.log('Maintenance API Response: 401 but token is still valid, not clearing auth (likely server error)');
    }
  }
  
  return result;
};

export const maintenanceApi = createApi({
  reducerPath: 'maintenanceApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Maintenance'],
  endpoints: (builder) => ({
    getMaintenanceStatus: builder.query({
      query: () => '/status',
      providesTags: ['Maintenance'],
    }),
    updateMaintenanceStatus: builder.mutation({
      query: (data) => ({
        url: '/admin/update',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Maintenance'],
    }),
    getMaintenanceHistory: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/admin/history?page=${page}&limit=${limit}`,
      providesTags: ['Maintenance'],
    }),
  }),
});

export const {
  useGetMaintenanceStatusQuery,
  useUpdateMaintenanceStatusMutation,
  useGetMaintenanceHistoryQuery,
} = maintenanceApi;
