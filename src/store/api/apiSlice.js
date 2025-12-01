import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken, isTokenExpired, clearAuth } from '@/utils/auth';

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: "http://35.154.139.118/api/v0",
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage or sessionStorage using utility function
      const token = getToken();
      
      if (token) {
        // Check if token is expired before making the request
        if (isTokenExpired(token)) {
          console.log('API Request: Token is expired, clearing auth');
          clearAuth();
          // Redirect to login will be handled by the component
          return headers;
        }
        
        headers.set('authorization', `Bearer ${token}`);
        console.log('API Request: Valid token added to headers');
      } else {
        console.log('API Request: No token found');
      }
      
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized responses
  if (result.error && result.error.status === 401) {
    console.log('API Response: 401 Unauthorized, clearing auth');
    clearAuth();
    // The ProtectedRoute will handle redirect to login
  }

  // Debug: Log result structure for debugging
  if (process.env.NODE_ENV === 'development' && args.url?.includes('getAllUser')) {
    console.log('BaseQuery Result for getAllUser:', {
      hasData: !!result.data,
      hasError: !!result.error,
      dataType: typeof result.data,
      error: result.error
    });
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth', 'Admin', 'User', 'Order', 'Customer', 'Product', 'Category', 'Utils', 'Chat', 'Ticket', 'Policy', 'Notification', 'Maintenance'],
  endpoints: (builder) => ({}),
});
