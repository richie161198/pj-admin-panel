import { apiSlice } from '../apiSlice';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin Login
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Admin'],
    }),

    // Admin Register
    adminRegister: builder.mutation({
      query: (adminData) => ({
        url: '/admin/register',
        method: 'POST',
        body: adminData,
      }),
      invalidatesTags: ['Admin'],
    }),

    // Get Admin Profile
    getAdminProfile: builder.query({
      query: () => '/admin/profile',
      providesTags: ['Admin'],
    }),

    // Update Admin Profile
    updateAdminProfile: builder.mutation({
      query: (profileData) => ({
        url: '/admin/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Admin'],
    }),

    // Change Password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/admin/change-password',
        method: 'PUT',
        body: passwordData,
      }),
    }),

    // Refresh Token
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/admin/refresh-token',
        method: 'POST',
        body: { refreshToken },
      }),
    }),

    // Admin Logout
    adminLogout: builder.mutation({
      query: () => ({
        url: '/admin/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Admin'],
    }),

    // Get All Admins
    getAllAdmins: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        return `/admin/admins?${queryParams.toString()}`;
      },
      providesTags: ['Admin'],
    }),

    // Get Admin Statistics
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Admin'],
    }),

    // Get Single Admin by ID
    getAdminById: builder.query({
      query: (id) => `/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),

    // Update Admin by ID
    updateAdminById: builder.mutation({
      query: ({ id, ...adminData }) => ({
        url: `/admin/${id}`,
        method: 'PUT',
        body: adminData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Admin', id },
        'Admin'
      ],
    }),

    // Delete Admin by ID
    deleteAdminById: builder.mutation({
      query: (id) => ({
        url: `/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),

    // Update Admin Password by ID
    updateAdminPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/admin/${id}/password`,
        method: 'PUT',
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminRegisterMutation,
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useChangePasswordMutation,
  useRefreshTokenMutation,
  useAdminLogoutMutation,
  useGetAllAdminsQuery,
  useGetAdminStatsQuery,
  useGetAdminByIdQuery,
  useUpdateAdminByIdMutation,
  useDeleteAdminByIdMutation,
  useUpdateAdminPasswordMutation,
} = adminApi;
