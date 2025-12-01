import { apiSlice } from '../apiSlice';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all chats
    getAllChats: builder.query({
      query: ({ page = 1, limit = 20, status, priority, category } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        if (category) params.append('category', category);
        
        return `/chat/chats?${params.toString()}`;
      },
      providesTags: ['Chat']
    }),

    // Get chat statistics
    getChatStats: builder.query({
      query: () => '/chat/chats/stats',
      providesTags: ['Chat']
    }),

    // Get specific chat by ID
    getChatById: builder.query({
      query: (chatId) => `/chat/chats/${chatId}`,
      providesTags: (result, error, chatId) => [{ type: 'Chat', id: chatId }]
    }),

    // Create new chat
    createChat: builder.mutation({
      query: (chatData) => ({
        url: '/chat/chats',
        method: 'POST',
        body: chatData
      }),
      invalidatesTags: ['Chat']
    }),

    // Send message
    sendMessage: builder.mutation({
      query: ({ chatId, message, messageType = 'text', attachments = [] }) => ({
        url: `/chat/chats/${chatId}/messages`,
        method: 'POST',
        body: { message, messageType, attachments }
      }),
      invalidatesTags: (result, error, { chatId }) => [{ type: 'Chat', id: chatId }]
    }),

    // Mark messages as read
    markAsRead: builder.mutation({
      query: (chatId) => ({
        url: `/chat/chats/${chatId}/read`,
        method: 'PUT'
      }),
      invalidatesTags: (result, error, chatId) => [{ type: 'Chat', id: chatId }]
    }),

    // Assign chat to admin
    assignChat: builder.mutation({
      query: ({ chatId, adminId }) => ({
        url: `/chat/chats/${chatId}/assign`,
        method: 'PUT',
        body: { adminId }
      }),
      invalidatesTags: (result, error, { chatId }) => [{ type: 'Chat', id: chatId }]
    }),

    // Update chat status
    updateChatStatus: builder.mutation({
      query: ({ chatId, status, priority, category, tags }) => ({
        url: `/chat/chats/${chatId}/status`,
        method: 'PUT',
        body: { status, priority, category, tags }
      }),
      invalidatesTags: (result, error, { chatId }) => [{ type: 'Chat', id: chatId }]
    }),

    // Close chat
    closeChat: builder.mutation({
      query: (chatId) => ({
        url: `/chat/chats/${chatId}/close`,
        method: 'PUT'
      }),
      invalidatesTags: (result, error, chatId) => [{ type: 'Chat', id: chatId }]
    })
  })
});

export const {
  useGetAllChatsQuery,
  useGetChatStatsQuery,
  useGetChatByIdQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useAssignChatMutation,
  useUpdateChatStatusMutation,
  useCloseChatMutation
} = chatApi;
