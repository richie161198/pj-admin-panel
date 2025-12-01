import { apiSlice } from '../apiSlice';

export const ticketApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tickets (admin)
    getAllTickets: builder.query({
      query: ({ page = 1, limit = 10, status, category } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (status) params.append('status', status);
        if (category) params.append('category', category);
        
        return `/users/admin/getAllTickets?${params.toString()}`;
      },
      providesTags: ['Ticket']
    }),

    // Get ticket statistics (admin)
    getTicketStats: builder.query({
      query: () => '/users/admin/getTicketStats',
      providesTags: ['Ticket']
    }),

    // Get specific ticket by ID (admin)
    getTicketByIdAdmin: builder.query({
      query: (ticketId) => {
        console.log('getTicketById query called with:', ticketId, typeof ticketId);
        return `/users/admin/getTicketById/${ticketId}`;
      },
      providesTags: ['Ticket']
    }),

    // Update ticket status (admin)
    updateTicketStatusAdmin: builder.mutation({
      query: ({ ticketId, status, adminNote }) => {
        console.log('updateTicketStatus mutation called with:', { ticketId, status, adminNote });
        return {
          url: `/users/admin/updateTicketStatus/${ticketId}`,
          method: 'POST',
          body: { status, adminNote }
        };
      },
      invalidatesTags: ['Ticket']
    }),

    // Add ticket reply (admin)
    addTicketReply: builder.mutation({
      query: ({ ticketId, message, isInternal = false }) => {
        console.log('addTicketReply mutation called with:', { ticketId, message, isInternal });
        return {
          url: `/users/admin/addTicketReply/${ticketId}`,
          method: 'POST',
          body: { message, isInternal }
        };
      },
      invalidatesTags: ['Ticket']
    }),

    // Get user's own tickets
    getMyTickets: builder.query({
      query: () => '/users/getMyTickets',
      providesTags: ['Ticket']
    }),

    // Create new ticket
    createTicket: builder.mutation({
      query: (ticketData) => ({
        url: '/users/createTicket',
        method: 'POST',
        body: ticketData
      }),
      invalidatesTags: ['Ticket']
    }),

    // Get ticket by ID (user)
    // getTicketByIdUser: builder.query({
    //   query: (ticketId) => `/users/getTicketById/${ticketId}`,
    //   providesTags: (result, error, ticketId) => [{ type: 'Ticket', id: ticketId }]
    // }),

    // Update ticket status (user)
    // updateTicketStatusUser: builder.mutation({
    //   query: ({ ticketId, status }) => ({
    //     url: `/users/updateTicketStatus/${ticketId}`,
    //     method: 'POST',
    //     body: { status }
    //   }),
    //         invalidatesTags: ['Ticket']

    //   // invalidatesTags: (result, error, { ticketId }) => [{ type: 'Ticket', id: ticketId }]
    // })
  })
});

export const {
  useGetAllTicketsQuery,
  useGetTicketStatsQuery,
  // useGetTicketByIdQuery,
  useGetTicketByIdAdminQuery,
  useUpdateTicketStatusAdminMutation,
  useAddTicketReplyMutation,
  useGetMyTicketsQuery,
  useCreateTicketMutation,
  // useUpdateTicketStatusUserMutation
} = ticketApi;

