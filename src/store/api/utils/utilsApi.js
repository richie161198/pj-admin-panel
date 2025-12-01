import { apiSlice } from '../apiSlice';

export const utilsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Gold Price
    getGoldPrice: builder.query({
      query: () => '/utils/goldPrice',
      providesTags: ['Utils'],
    }),

    // Get Banners
    getBanners: builder.query({
      query: () => '/utils/banners',
      providesTags: ['Utils'],
    }),

    // Send Mail OTP
    sendMailOTP: builder.mutation({
      query: (data) => ({
        url: '/utils/sendOtp',
        method: 'POST',
        body: data,
      }),
    }),

    // Upload Image (Utils endpoint)
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/utils/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Utils'],
    }),

    // Get Investment Settings
    getInvestmentSettings: builder.query({
      query: () => '/utils/investmentSettingsDetails',
      providesTags: ['Utils'],
    }),

    // Create/Update Investment Settings
    createInvestmentSettings: builder.mutation({
      query: (data) => ({
        url: '/utils/admin/createinvestmentSettings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Utils'],
    }),

    // Get Policy by Type
    getPolicyByType: builder.query({
      query: (type) => `/utils/policies/${type}`,
      providesTags: (result, error, type) => [{ type: 'Policy', id: type }],
    }),

    // Get All Policies
    getAllPolicies: builder.query({
      query: () => '/utils/policies',
      providesTags: ['Policy'],
    }),

    // Create or Update Policy
    createOrUpdatePolicy: builder.mutation({
      query: (data) => ({
        url: '/utils/admin/policies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Policy', id: arg.type },
        'Policy',
      ],
    }),

    // Delete Policy
    deletePolicy: builder.mutation({
      query: (type) => ({
        url: `/utils/admin/policies/${type}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Policy'],
    }),
  }),
});

export const {
  useGetGoldPriceQuery,
  useGetBannersQuery,
  useSendMailOTPMutation,
  useUploadImageMutation,
  useGetInvestmentSettingsQuery,
  useCreateInvestmentSettingsMutation,
  useGetPolicyByTypeQuery,
  useGetAllPoliciesQuery,
  useCreateOrUpdatePolicyMutation,
  useDeletePolicyMutation,
} = utilsApi;
