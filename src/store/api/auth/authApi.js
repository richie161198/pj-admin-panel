import { apiSlice } from '../apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin Login
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Admin Register
    adminRegister: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Forgot Password Request
    forgotPasswordRequest: builder.mutation({
      query: (email) => ({
        url: '/auth/forgotPasswordRequest',
        method: 'POST',
        body: { email },
      }),
    }),

    // Send OTP
    sendOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/SendOTP',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify OTP
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/verifyOtp',
        method: 'POST',
        body: data,
      }),
    }),

    // Update Password
    updatePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/updatePassword',
        method: 'POST',
        body: data,
      }),
    }),

    // Activate Account
    activateAccount: builder.mutation({
      query: (data) => ({
        url: '/auth/activateAccount',
        method: 'POST',
        body: data,
      }),
    }),

    // Send Mobile OTP
    sendMobileOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/sendMobileOtp',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify Mobile OTP
    verifyMobileOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/verifyMobileOtp',
        method: 'POST',
        body: data,
      }),
    }),

    // Send Mail OTP
    sendMailOTP: builder.mutation({
      query: (data) => ({
        url: '/utils/sendOtp',
        method: 'POST',
        body: data,
      }),
    }),

    // Get Current User Profile
    getCurrentUser: builder.query({
      query: () => '/users/getuserById',
      providesTags: ['Auth'],
    }),

    // Update User Profile
    updateProfile: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/updateuserById/${id}`,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminRegisterMutation,
  useForgotPasswordRequestMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useUpdatePasswordMutation,
  useActivateAccountMutation,
  useSendMobileOTPMutation,
  useVerifyMobileOTPMutation,
  useSendMailOTPMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} = authApi;
