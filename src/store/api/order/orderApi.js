import { apiSlice } from '../apiSlice';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Orders
    getAllOrders: builder.query({
      query: () => '/order/allorder',
      providesTags: ['Order'],
    }),

    // Get All Orders Admin (with pagination and filtering)
    getAllOrdersAdmin: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        return `/order/admin/allorders?${queryParams.toString()}`;
      },
      providesTags: ['Order'],
    }),

    // Get All Product Orders Admin (with pagination and filtering)
    getAllProductOrdersAdmin: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        return `/order/admin/allproductorders?${queryParams.toString()}`;
      },
      providesTags: ['Order'],
    }),

    // Get User Order History
    getUserOrderHistory: builder.query({
      query: () => '/order/userOrderHistory',
      providesTags: ['Order'],
    }),

    // Get Particular Order History
    getParticularOrderHistory: builder.query({
      query: (orderId) => `/order/orderTransaction?orderId=${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),

    // Get Order History
    getOrderHistory: builder.query({
      query: () => '/order/getOrderHistory',
      providesTags: ['Order'],
    }),

    // Create Order
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/order/create-order',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Place Order
    placeOrder: builder.mutation({
      query: (orderData) => ({
        url: '/order/placeOrder',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Refund Order
    refundOrder: builder.mutation({
      query: (refundData) => ({
        url: '/order/refundOrder',
        method: 'POST',
        body: refundData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Return Order
    returnOrder: builder.mutation({
      query: (returnData) => ({
        url: '/order/returnOrder',
        method: 'POST',
        body: returnData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Deposit INR
    depositINR: builder.mutation({
      query: (depositData) => ({
        url: '/order/depositInr',
        method: 'POST',
        body: depositData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Withdraw INR
    withdrawINR: builder.mutation({
      query: (withdrawData) => ({
        url: '/order/withdrawInr',
        method: 'POST',
        body: withdrawData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Buy or Sell Gold
    buyOrSellGold: builder.mutation({
      query: (goldData) => ({
        url: '/order/orderGold',
        method: 'POST',
        body: goldData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Generate Invoice
    generateInvoice: builder.mutation({
      query: (invoiceData) => ({
        url: '/generate-invoice',
        method: 'POST',
        body: invoiceData,
        responseHandler: (response) => response.blob(),
      }),
      invalidatesTags: ['Order'],
    }),

    // Get All Return/Refund Requests Admin
    getAllReturnRefundRequestsAdmin: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        return `/order/admin/returnRefundRequests?${queryParams.toString()}`;
      },
      providesTags: ['ReturnRefund'],
    }),

    // Accept Return/Refund Request
    acceptReturnRefundRequest: builder.mutation({
      query: (data) => ({
        url: '/order/admin/acceptReturnRefundRequest',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ReturnRefund', 'Order'],
    }),

    // Reject Return/Refund Request
    rejectReturnRefundRequest: builder.mutation({
      query: (data) => ({
        url: '/order/admin/rejectReturnRefundRequest',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ReturnRefund', 'Order'],
    }),

    // Get Investment Orders by Month for Chart
    getInvestmentOrdersByMonth: builder.query({
      query: ({ months = 12 } = {}) => {
        const params = new URLSearchParams();
        if (months) params.append('months', months);
        return `/order/admin/investmentOrdersByMonth?${params.toString()}`;
      },
      providesTags: ['Order'],
    }),

    // Get Total Revenue (excluding returns/refunds)
    getTotalRevenue: builder.query({
      query: () => '/order/admin/totalRevenue',
      providesTags: ['Revenue'],
    }),

    // Get Total Investment Orders (value and count)
    getTotalInvestmentOrders: builder.query({
      query: () => '/order/admin/totalInvestmentOrders',
      providesTags: ['Investment'],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetAllOrdersAdminQuery,
  useGetAllProductOrdersAdminQuery,
  useGetUserOrderHistoryQuery,
  useGetParticularOrderHistoryQuery,
  useGetOrderHistoryQuery,
  useCreateOrderMutation,
  usePlaceOrderMutation,
  useRefundOrderMutation,
  useReturnOrderMutation,
  useDepositINRMutation,
  useWithdrawINRMutation,
  useBuyOrSellGoldMutation,
  useGenerateInvoiceMutation,
  useGetAllReturnRefundRequestsAdminQuery,
  useAcceptReturnRefundRequestMutation,
  useRejectReturnRefundRequestMutation,
  useGetInvestmentOrdersByMonthQuery,
  useGetTotalRevenueQuery,
  useGetTotalInvestmentOrdersQuery,
} = orderApi;
