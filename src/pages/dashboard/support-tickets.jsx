import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import { useGetAllTicketsQuery, useGetTicketByIdAdminQuery, useUpdateTicketStatusAdminMutation, useAddTicketReplyMutation, useGetTicketStatsQuery } from '@/store/api/ticket/ticketApi';
import socketService from '@/utils/socketService';

const SupportTickets = () => {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalReply, setIsInternalReply] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [currentTicketData, setCurrentTicketData] = useState(null);
  const typingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [ticketsWithNewMessages, setTicketsWithNewMessages] = useState(new Set());
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    limit: 10
  });
  // API queries
  const { data: ticketsData, isLoading: ticketsLoading, refetch: refetchTickets } = useGetAllTicketsQuery(filters);
  
  const ticketId = selectedTicket?._id;
  const { data: ticketData, isLoading: ticketLoading, refetch: refetchTicket } = useGetTicketByIdAdminQuery(ticketId, {
    skip: !ticketId
  });
  const { data: statsData, isLoading: statsLoading } = useGetTicketStatsQuery();

  // Mutations
  const [updateTicketStatus, { isLoading: isUpdatingStatus }] = useUpdateTicketStatusAdminMutation();
  const [addTicketReply, { isLoading: isAddingReply }] = useAddTicketReplyMutation();

  // Extract tickets data with robust handling
  const extractTicketsData = (response) => {
    if (!response) return { tickets: [], pagination: null };
    if (Array.isArray(response)) return { tickets: response, pagination: null };
    if (response.data) {
      if (Array.isArray(response.data)) return { tickets: response.data, pagination: null };
      if (response.data.tickets && Array.isArray(response.data.tickets)) {
        return {
          tickets: response.data.tickets,
          pagination: response.data.pagination || null
        };
      }
    }
    if (response.tickets && Array.isArray(response.tickets)) {
      return {
        tickets: response.tickets,
        pagination: response.pagination || null
      };
    }
    if (response.details && Array.isArray(response.details)) {
      return { tickets: response.details, pagination: null };
    }
    return { tickets: [], pagination: null };
  };

  const { tickets: rawTickets, pagination } = extractTicketsData(ticketsData);
  
  // Sort tickets: ones with new messages first, then by date
  const tickets = [...rawTickets].sort((a, b) => {
    const aHasNewMessage = ticketsWithNewMessages.has(a._id);
    const bHasNewMessage = ticketsWithNewMessages.has(b._id);
    
    if (aHasNewMessage && !bHasNewMessage) return -1;
    if (!aHasNewMessage && bHasNewMessage) return 1;
    
    // If both have or don't have new messages, sort by date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  // Use socket data if available, otherwise fallback to API data
  const currentTicket = currentTicketData || ticketData?.ticket || null;
  const stats = statsData?.data || statsData;


  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    
    socketService.on('connect', () => {
      setIsSocketConnected(true);
    });

    socketService.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socketService.on('joined_ticket', (data) => {
      console.log('Joined ticket:', data);
    });

    socketService.on('ticket_data', (data) => {
      if (data && data.ticket) {
        setCurrentTicketData(data.ticket);
      }
    });

    socketService.on('new_ticket_message', (data) => {
      if (data && data.reply) {
        // If this is for the currently selected ticket, update it
        if (data.ticketId === selectedTicket?._id) {
          setCurrentTicketData(prev => {
            if (!prev) return prev;
            
            // Remove any temporary messages (optimistic updates)
            const filteredReplies = (prev.replies || []).filter(r => !r._id?.startsWith('temp_'));
            
            const newReply = {
              ...data.reply,
              _id: data.reply._id || data.reply.id || Date.now().toString(),
              timestamp: data.reply.timestamp || new Date().toISOString(),
              repliedBy: data.sender ? {
                _id: data.sender.id,
                name: data.sender.name,
                role: data.sender.role
              } : (data.reply.repliedBy || prev.replies?.[prev.replies.length - 1]?.repliedBy)
            };
            
            // Check if this reply already exists (avoid duplicates)
            const replyExists = filteredReplies.some(r => 
              r._id === newReply._id || 
              (r.message === newReply.message && 
               Math.abs(new Date(r.timestamp) - new Date(newReply.timestamp)) < 5000)
            );
            
            if (replyExists) {
              return prev; // Don't add duplicate
            }
            
            return {
              ...prev,
              replies: [...filteredReplies, newReply]
            };
          });
          // Auto-scroll to bottom when new message arrives
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          refetchTicket();
        } else {
          // If this is for a different ticket, mark it as having new messages
          setTicketsWithNewMessages(prev => new Set([...prev, data.ticketId]));
        }
        refetchTickets();
      }
    });

    socketService.on('ticket_status_updated', (data) => {
      if (data && data.ticketId === selectedTicket?._id && data.ticket) {
        setCurrentTicketData(data.ticket);
        refetchTicket();
        refetchTickets();
        toast.success(`Ticket status updated to ${data.ticket.status}`);
      }
    });

    socketService.on('new_ticket_reply', (data) => {
      // Notify admin about new user reply
      if (data && data.ticketId && data.ticket) {
        if (data.ticketId !== selectedTicket?._id) {
          // Mark ticket as having new messages and move to top
          setTicketsWithNewMessages(prev => new Set([...prev, data.ticketId]));
          toast.info(`New reply on ticket: ${data.ticket.subject || 'Unknown'}`);
        }
        refetchTickets();
      }
    });

    socketService.on('error', (error) => {
      const errorMessage = error?.message || error?.toString() || 'Socket error occurred';
      toast.error(errorMessage);
      console.error('Socket error:', error);
    });

    return () => {
      if (selectedTicket) {
        socketService.leaveTicket(selectedTicket._id);
      }
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('joined_ticket');
      socketService.off('ticket_data');
      socketService.off('new_ticket_message');
      socketService.off('ticket_status_updated');
      socketService.off('new_ticket_reply');
      socketService.off('error');
    };
  }, [selectedTicket?._id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (currentTicket?.replies && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentTicket?.replies?.length]);

  const handleTicketSelect = (ticket) => {
    // Leave previous ticket room
    if (selectedTicket) {
      socketService.leaveTicket(selectedTicket._id);
    }

    setSelectedTicket(ticket);
    setReplyMessage('');
    setIsInternalReply(false);
    setCurrentTicketData(null);
    
    // Remove new message indicator when ticket is selected
    setTicketsWithNewMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(ticket._id);
      return newSet;
    });

    // Join new ticket room
    if (ticket && isSocketConnected) {
      socketService.joinTicket(ticket._id);
    }
    
    // Scroll to bottom when ticket is selected
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStatusUpdate = async (ticketId, status, adminNote = '') => {
    if (isSocketConnected) {
      // Use socket for real-time update
      socketService.updateTicketStatus(ticketId, status, adminNote);
    } else {
      // Fallback to API
      try {
        const result = await updateTicketStatus({
          ticketId,
          status,
          adminNote
        }).unwrap();
        
        toast.success(`Ticket status updated to ${status}`);
        refetchTickets();
        if (selectedTicket?._id === ticketId) {
          refetchTicket();
        }
      } catch (error) {
        console.error('Failed to update ticket status:', error);
        toast.error(error?.data?.message || 'Failed to update ticket status');
      }
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket?._id) return;

    const messageText = replyMessage.trim();
    const isInternal = isInternalReply;
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic update - add message immediately
    if (currentTicketData) {
      const optimisticReply = {
        _id: tempId,
        message: messageText,
        timestamp: new Date().toISOString(),
        repliedBy: {
          _id: 'admin',
          name: 'You',
          role: 'admin'
        },
        isInternal: isInternal
      };
      
      setCurrentTicketData(prev => ({
        ...prev,
        replies: [...(prev.replies || []), optimisticReply]
      }));
      
      // Scroll to bottom immediately
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }

    // Clear the input immediately
    setReplyMessage('');
    setIsInternalReply(false);

    if (isSocketConnected) {
      // Use socket for real-time messaging
      socketService.sendTicketMessage(
        selectedTicket._id,
        messageText,
        isInternal
      );
      
      // The socket will send back the real message, which will replace the temp one
      // No need to show toast here as it will be handled by the socket response
    } else {
      // Fallback to API
      try {
        const result = await addTicketReply({
          ticketId: selectedTicket._id,
          message: messageText,
          isInternal: isInternal
        }).unwrap();
        
        // Remove temp message and add real one from API response
        if (currentTicketData && result.ticket) {
          setCurrentTicketData(prev => ({
            ...prev,
            replies: [
              ...(prev.replies || []).filter(r => !r._id?.startsWith('temp_')),
              ...(result.ticket.replies || [])
            ]
          }));
        }
        
        toast.success(isInternal ? 'Internal note added successfully' : 'Reply sent successfully');
        refetchTicket();
        refetchTickets();
      } catch (error) {
        console.error('Failed to add reply:', error);
        toast.error(error?.data?.message || 'Failed to add reply');
        
        // Remove optimistic update on error
        if (currentTicketData) {
          setCurrentTicketData(prev => ({
            ...prev,
            replies: prev.replies?.filter(r => r._id !== tempId) || []
          }));
        }
        
        // Restore the message text on error
        setReplyMessage(messageText);
        setIsInternalReply(isInternal);
      }
    }
  };

  const handleReplyMessageChange = (value) => {
    setReplyMessage(value);
    
    // Send typing indicator
    if (selectedTicket && isSocketConnected) {
      clearTimeout(typingTimerRef.current);
      socketService.sendTypingIndicator(selectedTicket._id, true);
      
      typingTimerRef.current = setTimeout(() => {
        socketService.sendTypingIndicator(selectedTicket._id, false);
      }, 2000);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'success'; // Green
      case 'in-progress': return 'warning'; // Yellow/Orange
      case 'resolved': return 'info'; // Blue
      case 'closed': return 'danger'; // Red
      default: return 'secondary'; // Gray
    }
  };
  
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': 
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'in-progress': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'resolved': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'closed': 
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return 'ph:circle';
      case 'in-progress': return 'ph:clock';
      case 'resolved': return 'ph:check-circle';
      case 'closed': return 'ph:x-circle';
      default: return 'ph:circle';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (ticketsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isSocketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage customer support tickets</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline"
        >
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.total}</p>
              </div>
              <Icon icon="ph:ticket" className="text-2xl text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open</p>
                <p className="text-2xl font-bold text-green-600">{stats.overview.open}</p>
              </div>
              <Icon icon="ph:circle" className="text-2xl text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.overview.inProgress}</p>
              </div>
              <Icon icon="ph:clock" className="text-2xl text-yellow-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-blue-600">{stats.overview.resolved}</p>
              </div>
              <Icon icon="ph:check-circle" className="text-2xl text-blue-500" />
            </div>
          </Card>
          
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1">
          <Card title="All Tickets" className="h-full">
            {/* Filters */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="general">General</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>
            </div>

            {/* Ticket List */}
            <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
              {tickets.map((ticket) => {
                const hasNewMessage = ticketsWithNewMessages.has(ticket._id);
                const isSelected = selectedTicket?._id === ticket._id;
                
                return (
                  <div
                    key={ticket._id}
                    onClick={() => handleTicketSelect(ticket)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                    } ${hasNewMessage && !isSelected ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
                  >
                    {hasNewMessage && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {ticket.user?.name || 'Unknown User'}
                            </h3>
                            {hasNewMessage && (
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                New
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {ticket.subject}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(ticket.createdAt)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {ticket.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((pagination.current || pagination.currentPage || filters.page) - 1) * filters.limit + 1} to{' '}
                  {Math.min((pagination.current || pagination.currentPage || filters.page) * filters.limit, pagination.total)} of{' '}
                  {pagination.total} tickets
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className="btn btn-sm btn-outline"
                  >
                    <Icon icon="ph:arrow-left" className="mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.current || pagination.currentPage || filters.page} of {pagination.pages}
                  </span>
                  <Button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page >= pagination.pages}
                    className="btn btn-sm btn-outline"
                  >
                    Next
                    <Icon icon="ph:arrow-right" className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {ticketLoading ? (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <LoadingIcon />
                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading ticket details...</p>
              </div>
            </Card>
          ) : selectedTicket && currentTicket ? (
            <Card className="h-full flex flex-col">
              {/* Ticket Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {/* <Avatar
                    src={currentTicket.user?.profilePhoto}
                    alt={currentTicket.user?.name}
                    size="sm"
                  /> */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentTicket.user?.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentTicket.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${getStatusBadgeColor(currentTicket.status)}`}>
                    <Icon icon={getStatusIcon(currentTicket.status)} />
                    <span>{currentTicket.status}</span>
                  </span>
                </div>
              </div>

              {/* Ticket Content */}
              <div className="flex-1 p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Subject
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentTicket.subject}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Category
                    </h4>
                    <Badge color="info" size="sm">
                      {currentTicket.category}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Created
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(currentTicket.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Admin Note */}
                {currentTicket.adminNote && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Admin Note
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      {currentTicket.adminNote}
                    </p>
                  </div>
                )}

                {/* Conversation / Replies */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Icon icon="ph:chat-circle-text" className="mr-2" />
                    Conversation
                    {currentTicket.replies && currentTicket.replies.length > 0 && (
                      <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        {currentTicket.replies.length} {currentTicket.replies.length === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    {/* Original message - from user */}
                    <div className="flex space-x-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <Icon icon="ph:user" className="text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1 max-w-[75%]">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">
                              {currentTicket.user?.name || 'Customer'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(currentTicket.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {currentTicket.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {currentTicket.replies && currentTicket.replies.length > 0 ? (
                      currentTicket.replies.map((reply, index) => {
                        // Check if reply is from admin or user
                        // Admin replies: repliedBy is an admin (not the ticket user)
                        const ticketUserId = currentTicket.user?._id || currentTicket.user;
                        const replyUserId = reply.repliedBy?._id || reply.repliedBy;
                        const isAdminReply = ticketUserId?.toString() !== replyUserId?.toString();
                        const isInternal = reply.isInternal;
                        const isTemp = reply._id?.startsWith('temp_');
                        
                        return (
                          <div
                            key={reply._id || index}
                            className={`flex space-x-3 ${isAdminReply ? 'justify-end' : 'justify-start'} ${isInternal ? 'opacity-75' : ''} ${isTemp ? 'opacity-70' : ''}`}
                          >
                            {!isAdminReply && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <Icon icon="ph:user" className="text-gray-600 dark:text-gray-300" />
                              </div>
                            )}
                            <div className={`flex-1 ${isAdminReply ? 'max-w-[75%]' : 'max-w-[75%]'}`}>
                              <div className={`rounded-lg p-3 shadow-sm ${
                                isInternal
                                  ? 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
                                  : isAdminReply
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700'
                              }`}>
                                <div className={`flex items-center justify-between mb-2 ${isAdminReply ? 'text-white' : ''}`}>
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-semibold ${isAdminReply ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                      {isAdminReply 
                                        ? (reply.repliedBy?.name || 'Admin')
                                        : (currentTicket.user?.name || 'Customer')
                                      }
                                    </span>
                                    {isInternal && (
                                      <Badge color="warning" size="sm">
                                        <Icon icon="ph:lock" className="mr-1" />
                                        Internal
                                      </Badge>
                                    )}
                                    {isAdminReply && !isInternal && (
                                      <Badge color="info" size="sm" className="bg-white/20 text-white">
                                        Admin
                                      </Badge>
                                    )}
                                    {isTemp && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                        Sending...
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-xs ${isAdminReply ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {formatDate(reply.timestamp)}
                                  </span>
                                </div>
                                <p className={`text-sm ${isAdminReply ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {reply.message}
                                </p>
                              </div>
                            </div>
                            {isAdminReply && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <Icon icon="ph:user-circle" className="text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6">
                        <Icon icon="ph:chat-circle-dots" className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No replies yet. Be the first to respond!
                        </p>
                      </div>
                    )}
                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                {/* Status Update */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Update Status:
                  </span>
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <Button
                      onClick={() => handleStatusUpdate(currentTicket._id, 'in-progress')}
                      className="btn btn-sm btn-warning"
                      disabled={currentTicket.status === 'in-progress' || isUpdatingStatus}
                      isLoading={isUpdatingStatus}
                    >
                      <Icon icon="ph:clock" className="mr-1" />
                      In Progress
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(currentTicket._id, 'resolved')}
                      className="btn btn-sm btn-info"
                      disabled={currentTicket.status === 'resolved' || isUpdatingStatus}
                      isLoading={isUpdatingStatus}
                    >
                      <Icon icon="ph:check-circle" className="mr-1" />
                      Resolve
                    </Button>
                    {/* <Button
                      onClick={() => handleStatusUpdate(currentTicket._id, 'closed')}
                      className="btn btn-sm btn-danger"
                      disabled={currentTicket.status === 'closed' || isUpdatingStatus}
                      isLoading={isUpdatingStatus}
                    >
                      <Icon icon="ph:x-circle" className="mr-1" />
                      Close
                    </Button> */}
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleAddReply} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add Reply
                    </label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => handleReplyMessageChange(e.target.value)}
                      placeholder={isSocketConnected ? "Type your reply here..." : "Connecting..."}
                      rows={3}
                      disabled={!isSocketConnected}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isInternalReply}
                        onChange={(e) => setIsInternalReply(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Internal Note (not visible to user)
                      </span>
                    </label>
                    <Button
                      type="submit"
                      disabled={!replyMessage.trim() || isAddingReply || !isSocketConnected}
                      className="btn btn-primary"
                      isLoading={isAddingReply}
                    >
                      <Icon icon={isSocketConnected ? "ph:paper-plane-tilt" : "ph:wifi-slash"} className="mr-2" />
                      {isAddingReply ? 'Sending...' : (isSocketConnected ? 'Send Reply' : 'Connecting...')}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          ) : tickets.length === 0 ? (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <Icon icon="ph:ticket" className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No tickets found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No support tickets match your current filters
                </p>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <Icon icon="ph:ticket" className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select a ticket to view details
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a ticket from the list to view and manage it
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;

