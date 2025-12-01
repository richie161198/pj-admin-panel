import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken, isTokenExpired, clearAuth } from '@/utils/auth';

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: "http://35.154.139.118/api/v0/invoices",
    prepareHeaders: (headers, { getState }) => {
      const token = getToken();
      if (token) {
        if (isTokenExpired(token)) {
          console.log('Invoice API Request: Token is expired, clearing auth');
          clearAuth();
          return headers;
        }
        headers.set('authorization', `Bearer ${token}`);
        console.log('Invoice API Request: Valid token added to headers');
      } else {
        console.log('Invoice API Request: No token found');
      }
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized responses
  // Only clear auth if token is actually expired, not on all 401 errors
  if (result.error && result.error.status === 401) {
    const token = getToken();
    console.log('Invoice API Response: 401 Unauthorized');
    
    // Only clear auth if token is expired or missing
    if (!token || isTokenExpired(token)) {
      console.log('Invoice API Response: Token is expired or missing, clearing auth');
      clearAuth();
    } else {
      console.log('Invoice API Response: 401 but token is still valid, not clearing auth (likely server error)');
    }
  }
  
  return result;
};

export const invoiceApi = createApi({
  reducerPath: 'invoiceApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    getAllInvoices: builder.query({
      query: ({ page = 1, limit = 10, search = '', status = '', startDate = '', endDate = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/?${params.toString()}`;
      },
      providesTags: ['Invoice'],
    }),
    getInvoiceById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),
    createInvoiceFromOrder: builder.mutation({
      query: (data) => ({
        url: '/create-from-order',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Invoice'],
    }),
    createTestInvoice: builder.mutation({
      query: () => ({
        url: '/create-test',
        method: 'POST',
      }),
      invalidatesTags: ['Invoice'],
    }),
    updateInvoice: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Invoice', id }],
    }),
    markInvoiceAsPaid: builder.mutation({
      query: (id) => ({
        url: `/${id}/mark-paid`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),
    getInvoiceStats: builder.query({
      query: () => '/stats',
      providesTags: ['Invoice'],
    }),
    downloadInvoice: builder.query({
      query: (id) => ({
        url: `/${id}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetAllInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceFromOrderMutation,
  useCreateTestInvoiceMutation,
  useUpdateInvoiceMutation,
  useMarkInvoiceAsPaidMutation,
  useDeleteInvoiceMutation,
  useGetInvoiceStatsQuery,
  useLazyDownloadInvoiceQuery,
} = invoiceApi;