import { apiSlice } from '../apiSlice';

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create Notification
    createNotification: builder.mutation({
      query: (notificationData) => ({
        url: '/notifications/admin/notifications',
        method: 'POST',
        body: notificationData,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Get All Notifications
    getAllNotifications: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        return `/notifications/admin/notifications?${queryParams.toString()}`;
      },
      providesTags: ['Notification'],
    }),

    // Get Notification by ID
    getNotificationById: builder.query({
      query: (id) => `/notifications/admin/notifications/${id}`,
      providesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),

    // Update Notification
    updateNotification: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/notifications/admin/notifications/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Notification', id },
        'Notification',
      ],
    }),

    // Delete Notification
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/admin/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Send Notification
    sendNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/admin/notifications/${id}/send`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Get Notification Statistics
    getNotificationStats: builder.query({
      query: () => '/notifications/admin/notifications/stats',
      providesTags: ['Notification'],
    }),

    // Register Device Token (User)
    registerDeviceToken: builder.mutation({
      query: (tokenData) => ({
        url: '/notifications/notifications/register-token',
        method: 'POST',
        body: tokenData,
      }),
    }),

    // Update Notification Preferences (User)
    updateNotificationPreferences: builder.mutation({
      query: (preferences) => ({
        url: '/notifications/notifications/preferences',
        method: 'PUT',
        body: preferences,
      }),
    }),
  }),
});

export const {
  useCreateNotificationMutation,
  useGetAllNotificationsQuery,
  useGetNotificationByIdQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useSendNotificationMutation,
  useGetNotificationStatsQuery,
  useRegisterDeviceTokenMutation,
  useUpdateNotificationPreferencesMutation,
} = notificationApi;
